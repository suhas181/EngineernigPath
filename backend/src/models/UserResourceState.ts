import { Schema, model, Document } from 'mongoose';

export interface IUserResourceState extends Document {
  userId: Schema.Types.ObjectId;
  resourceId: Schema.Types.ObjectId;
  isCompleted: boolean;
  isBookmarked: boolean;
  completedAt?: Date;
  bookmarkedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserResourceStateSchema = new Schema<IUserResourceState>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    bookmarkedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Fast lookups & uniqueness constraint
UserResourceStateSchema.index({ userId: 1, resourceId: 1 }, { unique: true });
UserResourceStateSchema.index({ userId: 1, isBookmarked: 1 });
UserResourceStateSchema.index({ userId: 1, isCompleted: 1 });

export const UserResourceState = model<IUserResourceState>('UserResourceState', UserResourceStateSchema);
