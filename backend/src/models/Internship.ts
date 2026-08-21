import { Schema, model, Document } from 'mongoose';

export type InternshipStatus = 'OPEN' | 'CLOSED' | 'UNKNOWN';
export type InternshipRole =
  | 'Software Engineer'
  | 'Frontend Engineer'
  | 'Backend Engineer'
  | 'AI/ML Engineer'
  | 'Data Analyst'
  | 'DevOps Engineer'
  | 'Mobile Developer'
  | 'Cybersecurity Engineer'
  | 'Other';

export interface IInternship extends Document {
  externalId: string;
  source: string;
  title: string;
  company: string;
  description?: string;
  location?: string;
  country?: string;
  remote?: boolean;
  employmentType?: string;
  skills: string[];
  applicationUrl: string;
  companyUrl?: string;
  sourceUrl?: string;
  salary?: string;
  publishedAt?: Date;
  expiresAt?: Date;
  lastCheckedAt: Date;
  status: InternshipStatus;
  role: InternshipRole;
  createdAt: Date;
  updatedAt: Date;
}

const InternshipSchema = new Schema<IInternship>(
  {
    externalId: {
      type: String,
      required: [true, 'externalId is required'],
      trim: true,
    },
    source: {
      type: String,
      required: [true, 'source is required'],
      default: 'Adzuna',
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'company is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: 'India',
    },
    country: {
      type: String,
      default: 'in',
    },
    remote: {
      type: Boolean,
      default: false,
    },
    employmentType: {
      type: String,
      default: 'Internship',
    },
    skills: {
      type: [String],
      default: [],
    },
    applicationUrl: {
      type: String,
      required: [true, 'applicationUrl is required'],
    },
    companyUrl: {
      type: String,
      default: '',
    },
    sourceUrl: {
      type: String,
      default: '',
    },
    salary: {
      type: String,
      default: '',
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    lastCheckedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'UNKNOWN'],
      default: 'UNKNOWN',
    },
    role: {
      type: String,
      enum: [
        'Software Engineer',
        'Frontend Engineer',
        'Backend Engineer',
        'AI/ML Engineer',
        'Data Analyst',
        'DevOps Engineer',
        'Mobile Developer',
        'Cybersecurity Engineer',
        'Other',
      ],
      default: 'Software Engineer',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate entries from the same source
InternshipSchema.index({ source: 1, externalId: 1 }, { unique: true });

// Text index for fast search queries
InternshipSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  location: 'text',
  skills: 'text',
});

export const Internship = model<IInternship>('Internship', InternshipSchema);
