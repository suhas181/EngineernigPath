import { Schema, model, Document } from 'mongoose';

export interface IExtractionMetadata {
  garbledTextRatio: number;
  tablesDetected: boolean;
  multiColumnSuspected: boolean;
  extractionConfidence: number;
}

export interface IStage1ExtractionResult {
  contact_info: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    links?: string[];
  };
  skills: {
    technical: string[];
    tools_and_technologies: string[];
    soft: string[];
  };
  projects: Array<{
    name: string;
    description: string[];
    technologies: string[];
    duration?: string | null;
  }>;
  education: Array<{
    institution: string;
    degree?: string | null;
    field?: string | null;
    duration?: string | null;
    score?: string | null;
  }>;
  experience: Array<{
    company: string;
    role: string;
    duration?: string | null;
    responsibilities: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer?: string | null;
    date?: string | null;
  }>;
  achievements: Array<{
    title: string;
    description?: string | null;
  }>;
  parsing_warnings: string[];
}

export interface IImprovementSuggestion {
  section: string;
  reference: string;
  issue: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

export interface IStage2ScoringResult {
  overall_score: number;
  job_match_score?: number | null;
  content_quality_score: number;
  ats_compatibility_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  strengths: string[];
  weaknesses: string[];
  improvement_suggestions: IImprovementSuggestion[];
  summary: string;
  targetRole?: string;
  jobDescription?: string;
}

export interface IEducationParsed {
  institution: string;
  degree: string;
  year: string;
  cgpa?: string;
}

export interface IExperienceParsed {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface IProjectParsed {
  title: string;
  description: string;
  technologies: string[];
}

export interface IGrammarIssue {
  original: string;
  suggestion: string;
  reason: string;
}

export interface IProjectRecommendation {
  title: string;
  description: string;
  complexity: string;
}

export interface IResume extends Document {
  userId: Schema.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  fileHash: string;
  rawText: string;
  version: number;
  atsScore: number;
  readinessScore: number;
  extractionMetadata: IExtractionMetadata;
  extractionResult: IStage1ExtractionResult;
  scoringResult: IStage2ScoringResult;
  parsedDetails: {
    name: string;
    email: string;
    phone: string;
    education: IEducationParsed[];
    experience: IExperienceParsed[];
    projects: IProjectParsed[];
    skills: string[];
  };
  analysis: {
    missingSkills: string[];
    grammarIssues: IGrammarIssue[];
    keywordSuggestions: string[];
    projectRecommendations: IProjectRecommendation[];
    improvements: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const EducationParsedSchema = new Schema<IEducationParsed>({
  institution: { type: String, required: true },
  degree: { type: String, default: '' },
  year: { type: String, default: '' },
  cgpa: String,
});

const ExperienceParsedSchema = new Schema<IExperienceParsed>({
  company: { type: String, required: true },
  role: { type: String, required: true },
  duration: { type: String, default: '' },
  description: { type: String, default: '' },
});

const ProjectParsedSchema = new Schema<IProjectParsed>({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  technologies: { type: [String], default: [] },
});

const GrammarIssueSchema = new Schema<IGrammarIssue>({
  original: { type: String, required: true },
  suggestion: { type: String, required: true },
  reason: { type: String, required: true },
});

const ProjectRecommendationSchema = new Schema<IProjectRecommendation>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  complexity: { type: String, required: true },
});

const ResumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'FileName is required'],
    },
    fileUrl: {
      type: String,
      required: [true, 'FileUrl is required'],
    },
    fileHash: {
      type: String,
      index: true,
      default: '',
    },
    rawText: {
      type: String,
      required: [true, 'Raw text is required'],
    },
    version: {
      type: Number,
      default: 1,
    },
    atsScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    readinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    extractionMetadata: {
      garbledTextRatio: { type: Number, default: 0 },
      tablesDetected: { type: Boolean, default: false },
      multiColumnSuspected: { type: Boolean, default: false },
      extractionConfidence: { type: Number, default: 1.0 },
    },
    extractionResult: {
      type: Schema.Types.Mixed,
      default: null,
    },
    scoringResult: {
      type: Schema.Types.Mixed,
      default: null,
    },
    parsedDetails: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      education: [EducationParsedSchema],
      experience: [ExperienceParsedSchema],
      projects: [ProjectParsedSchema],
      skills: { type: [String], default: [] },
    },
    analysis: {
      missingSkills: { type: [String], default: [] },
      grammarIssues: [GrammarIssueSchema],
      keywordSuggestions: { type: [String], default: [] },
      projectRecommendations: [ProjectRecommendationSchema],
      improvements: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
  }
);

ResumeSchema.index({ userId: 1, version: -1 });
ResumeSchema.index({ userId: 1, fileHash: 1 });

export const Resume = model<IResume>('Resume', ResumeSchema);
export default Resume;
