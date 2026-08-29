import { Schema, model, Document } from 'mongoose';

export interface IRecentResource extends Document {
  userId: Schema.Types.ObjectId;
  resourceId: string;
  title: string;
  provider: string;
  type: string;
  url: string;
  thumbnail?: string;
  lastOpenedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecentResourceSchema = new Schema<IRecentResource>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      default: 'EngineerPath',
      trim: true,
    },
    type: {
      type: String,
      default: 'article',
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    lastOpenedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce single entry per resource per user (upsert / update lastOpenedAt on reopen)
RecentResourceSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

// High-speed retrieval for the user's most recently opened resources (DESC order)
RecentResourceSchema.index({ userId: 1, lastOpenedAt: -1 });

export const RecentResource = model<IRecentResource>('RecentResource', RecentResourceSchema);
