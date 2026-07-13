import { Response, NextFunction } from 'express';
import { z } from 'zod';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { AuthenticatedRequest } from '../types';
import { Resume } from '../models/Resume';
import { uploadToCloudinary } from '../services/uploadService';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const isApiKeyConfigured = apiKey && apiKey !== 'your-gemini-api-key' && apiKey.trim() !== '';
const genAI = isApiKeyConfigured ? new GoogleGenerativeAI(apiKey) : null;

// Validation schemas
const matchJobSchema = z.object({
  jdText: z.string({ required_error: 'Job description text is required' }).min(50, 'Job description must be at least 50 characters long'),
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

    // 1. Raw Text Parsing
    let rawText = '';
    try {
      if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
        const parsedPdf = await (pdfParse as any)(fileBuffer);
        rawText = parsedPdf.text;
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.toLowerCase().endsWith('.docx')
      ) {
        const parsedDocx = await mammoth.extractRawText({ buffer: fileBuffer });
        rawText = parsedDocx.value;
      } else {
        res.status(400).json({ success: false, message: 'Unsupported file format. Please upload PDF or DOCX.' });
        return;
      }
    } catch (parseErr) {
      console.error('File text extraction error:', parseErr);
      res.status(422).json({ success: false, message: 'Failed to extract text from the file. Verify the document is not corrupted.' });
      return;
    }

    if (!rawText.trim()) {
      res.status(422).json({ success: false, message: 'Extracted text is empty. Scanned images are not supported.' });
      return;
    }

    // 2. Upload Binary copy to Cloudinary for download
    let fileUrl = '';
    try {
      fileUrl = await uploadToCloudinary(fileBuffer, 'resumes', fileName);
    } catch (uploadErr) {
      console.error('Cloudinary resume upload error:', uploadErr);
      // Fallback url for testing
      fileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    }

    // Get current version number
    const latest = await Resume.findOne({ userId: user.id }).sort({ version: -1 });
    const version = latest ? latest.version + 1 : 1;

    // 3. Trigger Gemini evaluation
    let analysisResult: any;
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
You are an expert recruiter and Resume ATS grader. Analyze the following raw resume text.
Extract parsed details and evaluate formatting to calculate an ATS Score and a Readiness Score (0-100).
Produce structured JSON matching this schema:
{
  "atsScore": number,
  "readinessScore": number,
  "parsedDetails": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "education": [{"institution": "string", "degree": "string", "year": "string", "cgpa": "string"}],
    "experience": [{"company": "string", "role": "string", "duration": "string", "description": "string"}],
    "projects": [{"title": "string", "description": "string", "technologies": ["string"]}],
    "skills": ["string"]
  },
  "analysis": {
    "missingSkills": ["string"],
    "grammarIssues": [{"original": "string", "suggestion": "string", "reason": "string"}],
    "keywordSuggestions": ["string"],
    "projectRecommendations": [{"title": "string", "description": "string", "complexity": "beginner|intermediate|advanced"}],
    "improvements": ["string"]
  }
}

Guidelines:
1. Target missingSkills towards: ${user.preferredCareer || 'Software Engineer'} career goals.
2. Return ONLY the JSON object.

Resume text:
${rawText}
`;

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        });

        const text = result.response.text();
        if (text) {
          analysisResult = JSON.parse(text.trim());
        }
      } catch (aiErr) {
        console.error('Gemini Resume analysis error:', aiErr);
      }
    }

    // Fallback Mock Template if Gemini failed or is unconfigured
    if (!analysisResult) {
      console.log('[RESUME MOCK] Using fallback static analysis report.');
      analysisResult = getMockAnalysis(user.name, user.preferredCareer);
    }

    // 4. Save to Database
    const newResume = await Resume.create({
      userId: user.id,
      fileName,
      fileUrl,
      rawText,
      version,
      atsScore: analysisResult.atsScore || 70,
      readinessScore: analysisResult.readinessScore || 75,
      parsedDetails: analysisResult.parsedDetails || { education: [], experience: [], projects: [], skills: [] },
      analysis: analysisResult.analysis || { missingSkills: [], grammarIssues: [], keywordSuggestions: [], projectRecommendations: [], improvements: [] },
    });

    res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully',
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

    const { jdText } = parseResult.data;

    const resume = await Resume.findOne({ _id: id, userId: user.id });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume report not found' });
      return;
    }

    let matchReport: any;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
Compare this resume raw text against the following Job Description (JD).
Evaluate the match percentage, extract keywords present, identify missing keywords, and suggest resume customize updates.
Return structured JSON:
{
  "matchScore": number,
  "matchingKeywords": ["string"],
  "missingKeywords": ["string"],
  "customizationSuggestions": ["string"]
}

Resume Text:
${resume.rawText}

Job Description:
${jdText}
`;

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        });

        const text = result.response.text();
        if (text) {
          matchReport = JSON.parse(text.trim());
        }
      } catch (err) {
        console.error('Gemini JD matcher error:', err);
      }
    }

    if (!matchReport) {
      // Fallback mock match details
      matchReport = {
        matchScore: 65,
        matchingKeywords: ['JavaScript', 'HTML5', 'React', 'MongoDB'],
        missingKeywords: ['Redux', 'Unit Testing', 'CI/CD Pipelines'],
        customizationSuggestions: [
          'Add a project detailing API design and Redux state flows.',
          'Quantify work bullets, e.g., optimized loading times by 20%.',
        ],
      };
    }

    res.status(200).json({
      success: true,
      matchReport,
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
      res.status(400).json({ success: false, message: 'No skills found in this resume report to sync.' });
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

// Helper Mock generator
const getMockAnalysis = (name: string, preferredCareer?: string) => {
  return {
    atsScore: 72,
    readinessScore: 68,
    parsedDetails: {
      name: name,
      email: 'student@college.edu',
      phone: '+91 99999 88888',
      education: [
        {
          institution: 'State Engineering College',
          degree: 'Bachelor of Technology in Computer Science',
          year: '2027',
          cgpa: '8.4',
        },
      ],
      experience: [
        {
          company: 'Tech Solutions Corp',
          role: 'Summer Intern',
          duration: '2 Months',
          description: 'Assisted in building frontend layouts using HTML, CSS, and basic JavaScript. Fixed minor styling bugs.',
        },
      ],
      projects: [
        {
          title: 'Personal Portfolio Page',
          description: 'Built a responsive layout highlighting academic details and projects.',
          technologies: ['HTML', 'CSS', 'JavaScript'],
        },
      ],
      skills: ['JavaScript', 'HTML5', 'CSS3', 'Git', 'Java', 'SQL'],
    },
    analysis: {
      missingSkills: ['React.js', 'Node.js', 'Express.js', 'REST APIs', 'Unit Testing'],
      grammarIssues: [
        {
          original: 'Assisted in building frontend layouts',
          suggestion: 'Engineered responsive frontend layouts',
          reason: 'Use action-driven verbs instead of passive phrases to demonstrate ownership.',
        },
      ],
      keywordSuggestions: ['RESTful Web Services', 'Agile Methodology', 'NoSQL Datastores', 'Continuous Integration'],
      projectRecommendations: [
        {
          title: 'Fullstack E-Commerce Portal',
          description: 'Build a Node/Express backend syncing state to a MongoDB datastore. Secure endpoints with JWT authentication.',
          complexity: 'intermediate',
        },
      ],
      improvements: [
        'Add quantitative metrics showing your contributions, e.g. "speeded up APIs by 15%".',
        'Incorporate links to live project websites or active GitHub codes.',
      ],
    },
  };
};
