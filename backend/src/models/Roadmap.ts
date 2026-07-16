import { Schema, model, Document } from 'mongoose';

export interface IResource {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'book';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompleted: boolean;
}

export interface IPracticeProblem {
  id: string;
  title: string;
  url: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isCompleted: boolean;
}

export interface IMonthProject {
  title: string;
  description: string;
  technologies: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  githubSubmission: string;
  liveDemoSubmission: string;
  isCompleted: boolean;
}

export interface ITopic {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  resources: IResource[];
  
  // New Month structures
  whyThisMonth?: string;
  learningObjectives?: string[];
  weeklyStudyPlan?: string[];
  estimatedStudyHours?: number;
  topics?: string[];
  practiceProblems?: IPracticeProblem[];
  project?: IMonthProject;
  interviewPrep?: string[];
  weeklyMilestones?: string[];
  monthlyGoal?: string;
  expectedOutcome?: string;
  placementReadinessImprovement?: number;
}

export interface IRoadmap extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  description: string;
  progress: number; // percentage
  topics: ITopic[];
  lastWeeklyReviewDate?: Date;
  version?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['video', 'article', 'book'], required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  isCompleted: { type: Boolean, default: false },
});

const PracticeProblemSchema = new Schema<IPracticeProblem>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  isCompleted: { type: Boolean, default: false },
});

const MonthProjectSchema = new Schema<IMonthProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: { type: [String], default: [] },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  githubSubmission: { type: String, default: '' },
  liveDemoSubmission: { type: String, default: '' },
  isCompleted: { type: Boolean, default: false },
});

const TopicSchema = new Schema<ITopic>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  resources: [ResourceSchema],
  
  // New Month structures
  whyThisMonth: { type: String, default: '' },
  learningObjectives: { type: [String], default: [] },
  weeklyStudyPlan: { type: [String], default: [] },
  estimatedStudyHours: { type: Number, default: 0 },
  topics: { type: [String], default: [] },
  practiceProblems: [PracticeProblemSchema],
  project: { type: MonthProjectSchema, default: null },
  interviewPrep: { type: [String], default: [] },
  weeklyMilestones: { type: [String], default: [] },
  monthlyGoal: { type: String, default: '' },
  expectedOutcome: { type: String, default: '' },
  placementReadinessImprovement: { type: Number, default: 0 },
});

const RoadmapSchema = new Schema<IRoadmap>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Roadmap title is required'],
    },
    description: {
      type: String,
      required: [true, 'Roadmap description is required'],
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    topics: [TopicSchema],
    lastWeeklyReviewDate: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: String,
      default: '2.0.0',
    },
  },
  {
    timestamps: true,
  }
);

export const Roadmap = model<IRoadmap>('Roadmap', RoadmapSchema);
