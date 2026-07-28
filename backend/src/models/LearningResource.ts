import mongoose, { Schema, Document } from 'mongoose';
import { CANONICAL_RESOURCE_TYPES, CANONICAL_DIFFICULTIES, CanonicalResourceType, CanonicalDifficulty } from '../constants/resourceTypes';

export interface ILearningResource extends Document {
  topic: string;
  careerPaths: string[];
  title: string;
  url: string;
  type: CanonicalResourceType;
  difficulty: CanonicalDifficulty;
  verified: boolean;
  lastCheckedAt: Date;
}

const LearningResourceSchema: Schema = new Schema(
  {
    topic: {
      type: String,
      required: true,
      index: true,
    },
    careerPaths: {
      type: [String],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: CANONICAL_RESOURCE_TYPES,
      required: true,
    },
    difficulty: {
      type: String,
      enum: CANONICAL_DIFFICULTIES,
      required: true,
      default: 'Beginner',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    lastCheckedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const LearningResource = mongoose.model<ILearningResource>(
  'LearningResource',
  LearningResourceSchema
);
