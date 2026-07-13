import { Schema, model, Document } from 'mongoose';

export interface IPlannerEvent extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isCompleted: boolean;
  roadmapReference?: {
    topicId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PlannerEventSchema = new Schema<IPlannerEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    roadmapReference: {
      topicId: String,
    },
  },
  {
    timestamps: true,
  }
);

PlannerEventSchema.index({ userId: 1, startTime: 1, endTime: 1 });

export const PlannerEvent = model<IPlannerEvent>('PlannerEvent', PlannerEventSchema);
export default PlannerEvent;
