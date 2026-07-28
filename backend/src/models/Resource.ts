import { Schema, model, Document } from 'mongoose';
import { CANONICAL_RESOURCE_TYPES, CANONICAL_DIFFICULTIES, CanonicalResourceType, CanonicalDifficulty } from '../constants/resourceTypes';

export interface IResource extends Document {
  title: string;
  description: string;
  url: string;
  category: CanonicalResourceType;
  difficulty: CanonicalDifficulty;
  estimatedTime: number; // in minutes
  tags: string[];
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Resource description is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Resource URL is required'],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      enum: CANONICAL_RESOURCE_TYPES,
      required: [true, 'Resource category is required'],
    },
    difficulty: {
      type: String,
      enum: CANONICAL_DIFFICULTIES,
      required: [true, 'Resource difficulty is required'],
    },
    estimatedTime: {
      type: Number,
      required: [true, 'Estimated time is required'],
      min: [1, 'Estimated time must be at least 1 minute'],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// High performance indexes
ResourceSchema.index({ category: 1, difficulty: 1 });
ResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Resource = model<IResource>('Resource', ResourceSchema);
