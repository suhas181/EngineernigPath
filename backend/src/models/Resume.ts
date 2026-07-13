import { Schema, model, Document } from 'mongoose';

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
  fileUrl: string; // Cloudinary secure URL
  rawText: string;
  version: number;
  atsScore: number;
  readinessScore: number;
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
  degree: { type: String, required: true },
  year: { type: String, required: true },
  cgpa: String,
});

const ExperienceParsedSchema = new Schema<IExperienceParsed>({
  company: { type: String, required: true },
  role: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String, required: true },
});

const ProjectParsedSchema = new Schema<IProjectParsed>({
  title: { type: String, required: true },
  description: { type: String, required: true },
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

// Compound index for fast queries of student resume versions
ResumeSchema.index({ userId: 1, version: -1 });

export const Resume = model<IResume>('Resume', ResumeSchema);
export default Resume;
