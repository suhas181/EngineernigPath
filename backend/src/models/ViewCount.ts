import { Schema, model, Document } from 'mongoose';

export type ViewEntityType = 'resource' | 'roadmap';

export interface IViewCount extends Document {
  entityType: ViewEntityType;
  entityId: string;
  views: number;
  lastViewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ViewCountSchema = new Schema<IViewCount>(
  {
    entityType: {
      type: String,
      enum: ['resource', 'roadmap'],
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastViewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee uniqueness per entityType + entityId
ViewCountSchema.index({ entityType: 1, entityId: 1 }, { unique: true });

export const ViewCount = model<IViewCount>('ViewCount', ViewCountSchema);
export default ViewCount;
