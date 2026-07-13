import { Schema, model, Document } from 'mongoose';

export interface IResource {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'book';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompleted: boolean;
}

export interface ITopic {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  resources: IResource[];
}

export interface IRoadmap extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  description: string;
  progress: number; // percentage
  topics: ITopic[];
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

const TopicSchema = new Schema<ITopic>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  resources: [ResourceSchema],
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
  },
  {
    timestamps: true,
  }
);

export const Roadmap = model<IRoadmap>('Roadmap', RoadmapSchema);
