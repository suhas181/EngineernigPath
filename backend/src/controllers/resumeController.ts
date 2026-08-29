import mongoose from 'mongoose';
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
  determineAnalysisConfidence,
} from '../services/resumePipelineService';

// Validation schemas
const matchJobSchema = z.object({
  jobTitle: z.string().optional(),
  jdText: z
    .string({ required_error: 'Job description text is required' })
    .min(20, 'Job description must be at least 20 characters long'),
});

export interface IPlaceholderWarning {
  type: 'PLACEHOLDER';
  text: string;
  severity: 'HIGH' | 'MEDIUM';
  message: string;
}

export function detectPlaceholders(text: string): IPlaceholderWarning[] {
  if (!text) return [];
  const warnings: IPlaceholderWarning[] = [];

  const placeholderRegexes = [
    {
      regex: /\[\s*(number|company|date|position|organization|insert|insert here|name|email|phone|role|project)\s*\]/gi,
      message: 'Replace bracketed placeholder with real candidate details.',
      severity: 'HIGH' as const,
    },
    {
      regex: /<\s*(company|project|insert|role|name|organization)\s*>/gi,
      message: 'Replace placeholder tag with real candidate details.',
      severity: 'HIGH' as const,
    },
    {
      regex: /\b(TODO|TBD|XXX)\b/g,
      message: 'Complete unfinished placeholder marker.',
      severity: 'HIGH' as const,
    },
    {
      regex: /\blorem\s+ipsum\b/gi,
      message: 'Remove template filler text (Lorem ipsum).',
      severity: 'HIGH' as const,
    },
    {
      regex: /\[\s*number\s*\]%\s*(?:improvement|increase|decrease|reduction|growth|boost|gain)/gi,
      message: 'Replace [number]% with an actual measured percentage result.',
      severity: 'HIGH' as const,
    },
    {
      regex: /\[\s*number\s*\]\s+(?:users|projects|customers|clients|servers|dollars|employees|requests|queries|tps)/gi,
      message: 'Replace [number] with the actual metric quantity.',
      severity: 'HIGH' as const,
    },
  ];

  for (const p of placeholderRegexes) {
    let match;
    p.regex.lastIndex = 0;
    while ((match = p.regex.exec(text)) !== null) {
      warnings.push({
        type: 'PLACEHOLDER',
        text: match[0],
        severity: p.severity,
        message: p.message,
      });
    }
  }

  return warnings;
}

export const uploadResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    const userId = user ? user.id : new mongoose.Types.ObjectId();
    const userCareer = user ? user.preferredCareer : 'Software Engineer';

    let fileBuffer: Buffer | null = null;
    let fileName = 'resume.txt';
    let mimeType = 'text/plain';
    let rawText = '';
    let isTextFormat = false;

    // Check if raw resume text was pasted directly in body
    const bodyText = req.body.resumeText || req.body.rawText;
    if (bodyText && typeof bodyText === 'string' && bodyText.trim().length > 0) {
      rawText = bodyText.trim();
      fileName = req.body.fileName || 'Pasted_Resume.txt';
      fileBuffer = Buffer.from(rawText, 'utf-8');
      isTextFormat = true;
    } else if (req.file) {
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname;
      mimeType = req.file.mimetype;

      const lowerName = fileName.toLowerCase();
      if (
        lowerName.endsWith('.txt') ||
        lowerName.endsWith('.md') ||
        lowerName.endsWith('.markdown') ||
        mimeType.startsWith('text/')
      ) {
        isTextFormat = true;
        rawText = fileBuffer.toString('utf-8');
      } else if (mimeType === 'application/pdf' || lowerName.endsWith('.pdf')) {
        isTextFormat = false;
        try {
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
        } catch (parseErr) {
          const bufferString = fileBuffer.toString('latin1');
          const matches = bufferString.match(/\(([^()]{3,})\)/g);
          if (matches && matches.length > 0) {
            rawText = matches.map((m) => m.slice(1, -1)).join(' ');
          }
        }
      } else if (
        mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        lowerName.endsWith('.docx')
      ) {
        isTextFormat = false;
        try {
          const parsedDocx = await mammoth.extractRawText({ buffer: fileBuffer });
          rawText = parsedDocx.value || '';
        } catch (docxErr) {
          rawText = '';
        }
      } else {
        res.status(400).json({
          success: false,
          message: 'Unsupported file format. Please upload PDF, DOCX, TXT, or MD.',
        });
        return;
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Please upload a resume file (PDF, DOCX, TXT, MD) or paste your resume text.',
      });
      return;
    }

    if (!fileBuffer) {
      fileBuffer = Buffer.from(rawText, 'utf-8');
    }

    // Check text sufficiency for scanned document fallback
    let textIsInsufficient = !rawText.trim() || rawText.trim().length < 80;
    let ocrUsed = false;
    let visualWarnings: string[] = [];
    let inputTextForStage1 = rawText;

    if (textIsInsufficient && !isTextFormat && fileBuffer) {
      try {
        const pageImagesB64 = await rasterizeDocumentToPageImages(fileBuffer, fileName);
        if (pageImagesB64 && pageImagesB64.length > 0) {
          const visionRes = await executeVisionStage(pageImagesB64);
          if (visionRes.visionMarkdown && visionRes.visionMarkdown.trim().length > 10) {
            rawText = visionRes.visionMarkdown;
            inputTextForStage1 = visionRes.visionMarkdown;
            visualWarnings = visionRes.visualWarnings;
            textIsInsufficient = false;
            ocrUsed = true;
          }
        }
      } catch (ocrErr) {
        // Handled gracefully below
      }
    }

    if (textIsInsufficient) {
      res.status(422).json({
        success: false,
        message: 'Extracted text is empty or too short. Please upload a document containing readable resume text.',
      });
      return;
    }

    // 1. Compute SHA-256 Hash for Caching Stage 1 Output
    const fileHash = calculateFileHash(fileBuffer);

    // 2. Upload file buffer to Cloudinary (or local storage fallback)
    let fileUrl = '';
    try {
      fileUrl = await uploadToCloudinary(fileBuffer, 'resumes', fileName);
    } catch (uploadErr) {
      res.status(500).json({
        success: false,
        message: 'Failed to store resume. Storage service is currently unavailable.',
      });
      return;
    }

    // Get next version number
    const latest = await Resume.findOne({ userId }).sort({ version: -1 });
    const version = latest ? latest.version + 1 : 1;

    // 3. Compute Text Extraction Metadata & Layout Heuristics
    const extractionMetadata = computeExtractionMetadata(inputTextForStage1, visualWarnings);

    // 5. STAGE 1 — Extraction (with SHA-256 caching lookup)
    let extractionResult: any = null;

    const cachedResume = await Resume.findOne({ userId, fileHash });
    if (cachedResume && cachedResume.extractionResult) {
      extractionResult = cachedResume.extractionResult;
    } else {
      extractionResult = await executeStage1Extraction(inputTextForStage1);

      if (visualWarnings.length > 0) {
        const mergedWarnings = new Set([...(extractionResult.parsing_warnings || []), ...visualWarnings]);
        extractionResult.parsing_warnings = Array.from(mergedWarnings);
      }
    }

    // 6. STAGE 2 — Scoring
    const targetRole = req.body.role || userCareer || 'Software Engineer';
    const jobDescription = req.body.jobDescription || null;

    const scoringResult = await executeStage2Scoring(
      extractionResult,
      targetRole,
      jobDescription,
      rawText,
      extractionMetadata
    );

    // 7. Map pipeline results with zero fabrication
    const skillList = Array.from(
      new Set([
        ...(extractionResult?.skills?.technical || []),
        ...(extractionResult?.skills?.programming_languages || []),
        ...(extractionResult?.skills?.frameworks || []),
        ...(extractionResult?.skills?.libraries || []),
        ...(extractionResult?.skills?.databases || []),
        ...(extractionResult?.skills?.cloud_and_tools || []),
        ...(extractionResult?.skills?.tools_and_technologies || []),
        ...(extractionResult?.skills?.soft || []),
      ])
    );

    const parsedDetails = {
      name: extractionResult?.contact_info?.name || '',
      email: extractionResult?.contact_info?.email || '',
      phone: extractionResult?.contact_info?.phone || '',
      education: (extractionResult?.education || []).map((e: any) => ({
        institution: e.institution || '',
        degree: e.degree || e.field || '',
        year: e.duration || '',
        cgpa: e.score || '',
      })),
      experience: (extractionResult?.experience || []).map((e: any) => ({
        company: e.company || '',
        role: e.role || '',
        duration: e.duration || '',
        description: Array.isArray(e.responsibilities)
          ? e.responsibilities.join(' ')
          : e.responsibilities || '',
      })),
      projects: (extractionResult?.projects || []).map((p: any) => ({
        title: p.name || '',
        description: Array.isArray(p.description) ? p.description.join(' ') : p.description || '',
        technologies: Array.isArray(p.technologies) ? p.technologies : [],
      })),
      skills: skillList,
    };

    const placeholderWarnings = detectPlaceholders(rawText);

    const analysis = {
      missingSkills: scoringResult?.missing_keywords || [],
      grammarIssues: [],
      keywordSuggestions: scoringResult?.matched_keywords || [],
      projectRecommendations: [],
      improvements: (scoringResult?.improvement_suggestions || []).map(
        (s: any) => `${s.section} [Priority: ${s.priority?.toUpperCase() || 'MED'}]: ${s.suggestion}`
      ),
      placeholderWarnings,
    };

    const overallScore = scoringResult?.overall_score || 0;
    const contentQualityScore = scoringResult?.content_quality_score || 0;
    const atsScore = scoringResult?.ats_compatibility_score || 0;
    const jobMatchScore = scoringResult?.job_match_score !== undefined ? scoringResult.job_match_score : null;
    const experienceEvidenceScore = scoringResult?.experience_evidence_score || 0;
    const projectsQualityScore = scoringResult?.projects_quality_score || 0;
    const completenessScore = scoringResult?.completeness_score || 0;
    const analysisConfidence = determineAnalysisConfidence(extractionResult, extractionMetadata, rawText.length);

    // 8. Save to Mongo Database
    const newResume = await Resume.create({
      userId,
      fileName,
      fileUrl,
      fileHash,
      rawText,
      version,
      atsScore,
      readinessScore: contentQualityScore,
      overallScore,
      contentQualityScore,
      jobMatchScore,
      experienceEvidenceScore,
      projectsQualityScore,
      completenessScore,
      analysisConfidence,
      extractionMetadata,
      extractionResult,
      scoringResult,
      parsedDetails,
      analysis,
    });

    res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully.',
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
      res.status(200).json({ success: true, count: 0, resumes: [] });
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

    let extractionResult = resume.extractionResult;
    if (!extractionResult) {
      extractionResult = await executeStage1Extraction(resume.rawText);
      resume.extractionResult = extractionResult;
    }

    const targetRole = jobTitle || req.body.role || user.preferredCareer || 'Software Engineer';
    const scoringResult = await executeStage2Scoring(
      extractionResult,
      targetRole,
      jdText,
      resume.rawText,
      resume.extractionMetadata
    );

    resume.scoringResult = scoringResult;
    resume.overallScore = scoringResult.overall_score || 0;
    resume.contentQualityScore = scoringResult.content_quality_score || 0;
    resume.atsScore = scoringResult.ats_compatibility_score || 0;
    resume.jobMatchScore = scoringResult.job_match_score !== undefined ? scoringResult.job_match_score : null;
    resume.experienceEvidenceScore = scoringResult.experience_evidence_score || 0;
    resume.projectsQualityScore = scoringResult.projects_quality_score || 0;
    resume.completenessScore = scoringResult.completeness_score || 0;
    resume.readinessScore = scoringResult.content_quality_score || 0;

    resume.analysis.missingSkills = scoringResult.missing_keywords || [];
    resume.analysis.keywordSuggestions = scoringResult.matched_keywords || [];
    resume.analysis.improvements = (scoringResult.improvement_suggestions || []).map(
      (s: any) => `${s.section} [Priority: ${s.priority?.toUpperCase() || 'MED'}]: ${s.suggestion}`
    );

    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Job match analysis calculated successfully.',
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

    const parsedSkills = resume.parsedDetails?.skills || [];
    if (parsedSkills.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No skills found in this resume report to sync.',
      });
      return;
    }

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
