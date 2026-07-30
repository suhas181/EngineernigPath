import { Response, NextFunction } from 'express';
import { z } from 'zod';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { AuthenticatedRequest } from '../types';
import { Resume } from '../models/Resume';
import { uploadToCloudinary } from '../services/uploadService';
import {
  calculateFileHash,
  computeExtractionMetadata,
  rasterizeDocumentToPageImages,
  executeVisionStage,
  executeStage1Extraction,
  executeStage2Scoring,
} from '../services/resumePipelineService';

// Validation schemas
const matchJobSchema = z.object({
  jobTitle: z.string().optional(),
  jdText: z
    .string({ required_error: 'Job description text is required' })
    .min(30, 'Job description must be at least 30 characters long'),
});

export const uploadResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'Please upload a file' });
      return;
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const mimeType = req.file.mimetype;

    // 1. Compute SHA-256 Hash for Caching Stage 1 Output
    const fileHash = calculateFileHash(fileBuffer);

    // 2. Raw Text Extraction (library based: pdf-parse / mammoth, NOT LLM)
    let rawText = '';
    try {
      if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
        let pdfModule: any = pdfParse;
        if (typeof pdfModule === 'function') {
          const parsedPdf = await pdfModule(fileBuffer);
          rawText = parsedPdf.text || '';
        } else if (pdfModule && typeof pdfModule.default === 'function') {
          const parsedPdf = await pdfModule.default(fileBuffer);
          rawText = parsedPdf.text || '';
        } else if (pdfModule && pdfModule.PDFParse) {
          const parser = new pdfModule.PDFParse({ data: fileBuffer });
          const parsedPdf = await parser.getText();
          rawText = parsedPdf.text || '';
        } else {
          const bufferString = fileBuffer.toString('latin1');
          const matches = bufferString.match(/\(([^()]{3,})\)/g);
          if (matches && matches.length > 0) {
            rawText = matches.map((m) => m.slice(1, -1)).join(' ');
          }
        }
      } else if (
        mimeType ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.toLowerCase().endsWith('.docx')
      ) {
        const parsedDocx = await mammoth.extractRawText({ buffer: fileBuffer });
        rawText = parsedDocx.value;
      } else {
        res.status(400).json({
          success: false,
          message: 'Unsupported file format. Please upload PDF or DOCX.',
        });
        return;
      }
    } catch (parseErr) {
      console.error('File text extraction error:', parseErr);
      // Fallback regex text extractor from binary stream if PDFParse throws
      try {
        const bufferString = fileBuffer.toString('latin1');
        const matches = bufferString.match(/\(([^()]{3,})\)/g);
        if (matches && matches.length > 0) {
          rawText = matches.map((m) => m.slice(1, -1)).join(' ');
        }
      } catch (e) {
        console.error('Regex PDF fallback failed:', e);
      }
    }

    if (!rawText.trim()) {
      res.status(422).json({
        success: false,
        message: 'Extracted text is empty. Scanned image PDFs are not supported.',
      });
      return;
    }

    // 3. Compute Text Extraction Metadata & Heuristics
    const extractionMetadata = computeExtractionMetadata(rawText);

    // 4. Upload Binary file to Cloudinary for secure storage
    let fileUrl = '';
    try {
      fileUrl = await uploadToCloudinary(fileBuffer, 'resumes', fileName);
    } catch (uploadErr) {
      console.error('Cloudinary resume upload error:', uploadErr);
      fileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    }

    // Get next version number
    const latest = await Resume.findOne({ userId: user.id }).sort({ version: -1 });
    const version = latest ? latest.version + 1 : 1;

    // 5. VISION STAGE — Page Rasterization & VLM Markdown Extraction (nemotron-parse)
    console.log(`[RESUME PIPELINE VISION STAGE] Rasterizing ${fileName}...`);
    const pageImagesB64 = await rasterizeDocumentToPageImages(fileBuffer, fileName);
    const { visionMarkdown, visualWarnings } = await executeVisionStage(pageImagesB64);

    const inputTextForStage1 = visionMarkdown.trim() ? visionMarkdown : rawText;

    // 6. STAGE 1 — Extraction LLM Call (with SHA-256 caching lookup)
    let extractionResult: any = null;

    const cachedResume = await Resume.findOne({ userId: user.id, fileHash });
    if (cachedResume && cachedResume.extractionResult) {
      console.log(`[RESUME PIPELINE CACHE HIT] Reusing Stage 1 extraction for fileHash: ${fileHash}`);
      extractionResult = cachedResume.extractionResult;
    } else {
      console.log(`[RESUME PIPELINE STAGE 1] Triggering Stage 1 extraction for ${fileName}...`);
      extractionResult = await executeStage1Extraction(inputTextForStage1);
      
      // Merge visual non-text region warnings into Stage 1 parsing_warnings
      if (visualWarnings.length > 0) {
        const mergedWarnings = new Set([...(extractionResult.parsing_warnings || []), ...visualWarnings]);
        extractionResult.parsing_warnings = Array.from(mergedWarnings);
      }
    }

    // 6. STAGE 2 — Scoring LLM Call
    const targetRole = req.body.role || user.preferredCareer || 'Software Engineer';
    const jobDescription = req.body.jobDescription || null;

    console.log(`[RESUME PIPELINE STAGE 2] Triggering Stage 2 scoring for role: ${targetRole}`);
    const scoringResult = await executeStage2Scoring(extractionResult, targetRole, jobDescription);

    // 7. Map pipeline results to legacy schema fields for backwards compatibility
    const parsedDetails = {
      name: extractionResult.contact_info?.name || user.name,
      email: extractionResult.contact_info?.email || user.email,
      phone: extractionResult.contact_info?.phone || '',
      education: (extractionResult.education || []).map((e: any) => ({
        institution: e.institution || 'University',
        degree: e.degree || e.field || 'Degree',
        year: e.duration || '2026',
        cgpa: e.score || '',
      })),
      experience: (extractionResult.experience || []).map((e: any) => ({
        company: e.company || 'Company',
        role: e.role || 'Role',
        duration: e.duration || '',
        description: Array.isArray(e.responsibilities)
          ? e.responsibilities.join(' ')
          : e.responsibilities || '',
      })),
      projects: (extractionResult.projects || []).map((p: any) => ({
        title: p.name || 'Project',
        description: Array.isArray(p.description) ? p.description.join(' ') : p.description || '',
        technologies: p.technologies || [],
      })),
      skills: [
        ...(extractionResult.skills?.technical || []),
        ...(extractionResult.skills?.tools_and_technologies || []),
        ...(extractionResult.skills?.soft || []),
      ],
    };

    const analysis = {
      missingSkills: scoringResult.missing_keywords || [],
      grammarIssues: [],
      keywordSuggestions: scoringResult.matched_keywords || [],
      projectRecommendations: [],
      improvements: (scoringResult.improvement_suggestions || []).map(
        (s: any) => `${s.section} [Priority: ${s.priority?.toUpperCase() || 'MED'}]: ${s.suggestion}`
      ),
    };

    // 8. Save to Mongo Database
    const newResume = await Resume.create({
      userId: user.id,
      fileName,
      fileUrl,
      fileHash,
      rawText,
      version,
      atsScore: scoringResult.overall_score || scoringResult.ats_compatibility_score || 75,
      readinessScore: scoringResult.content_quality_score || 75,
      extractionMetadata,
      extractionResult,
      scoringResult,
      parsedDetails,
      analysis,
    });

    res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully via 2-Stage Nemotron Pipeline',
      resume: newResume,
    });
  } catch (error) {
    next(error);
  }
};

export const getResumes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const resumes = await Resume.find({ userId: user.id }).sort({ version: -1 });
    res.status(200).json({ success: true, count: resumes.length, resumes });
  } catch (error) {
    next(error);
  }
};

export const getResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { id } = req.params;
    const resume = await Resume.findOne({ _id: id, userId: user.id });

    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume report not found' });
      return;
    }

    res.status(200).json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

export const matchJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { id } = req.params;
    const parseResult = matchJobSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { jdText, jobTitle } = parseResult.data;

    const resume = await Resume.findOne({ _id: id, userId: user.id });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume report not found' });
      return;
    }

    // Reuse Stage 1 cached extraction output (DO NOT re-trigger Stage 1 extraction!)
    let extractionResult = resume.extractionResult;
    if (!extractionResult) {
      console.log('[JD MATCHER] Extraction result missing on resume, running Stage 1...');
      extractionResult = await executeStage1Extraction(resume.rawText);
      resume.extractionResult = extractionResult;
    }

    const targetRole = jobTitle || req.body.role || user.preferredCareer || 'Software Engineer';
    console.log(`[JD MATCHER] Re-running Stage 2 scoring against JD for target role: ${targetRole}...`);

    const scoringResult = await executeStage2Scoring(extractionResult, targetRole, jdText);

    // Update resume scoringResult and overall atsScore
    resume.scoringResult = scoringResult;
    resume.atsScore = scoringResult.overall_score;
    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Job match score calculated via Stage 2 Nemotron pipeline',
      matchReport: {
        matchScore: scoringResult.job_match_score ?? scoringResult.overall_score,
        overallScore: scoringResult.overall_score,
        contentQualityScore: scoringResult.content_quality_score,
        atsCompatibilityScore: scoringResult.ats_compatibility_score,
        matchingKeywords: scoringResult.matched_keywords || [],
        missingKeywords: scoringResult.missing_keywords || [],
        strengths: scoringResult.strengths || [],
        weaknesses: scoringResult.weaknesses || [],
        improvementSuggestions: scoringResult.improvement_suggestions || [],
        customizationSuggestions: (scoringResult.improvement_suggestions || []).map(
          (s: any) => `[${s.section}] ${s.issue} → ${s.suggestion}`
        ),
        summary: scoringResult.summary,
      },
      resume,
    });
  } catch (error) {
    next(error);
  }
};

export const syncSkills = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { id } = req.params;
    const resume = await Resume.findOne({ _id: id, userId: user.id });

    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume report not found' });
      return;
    }

    const parsedSkills = resume.parsedDetails.skills || [];
    if (parsedSkills.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No skills found in this resume report to sync.',
      });
      return;
    }

    // Merge skills avoiding duplicates
    const merged = new Set([...(user.skills || []), ...parsedSkills]);
    user.skills = Array.from(merged);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skills synchronized with your profile successfully!',
      skills: user.skills,
    });
  } catch (error) {
    next(error);
  }
};
