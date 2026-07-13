import { Schema, model, Document } from 'mongoose';

export interface ITask extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  type: 'daily' | 'weekly';
  dueDate: Date;
  isCompleted: boolean;
  xpReward: number;
  roadmapReference?: {
    topicId: string;
    resourceId?: string;
  };
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['daily', 'weekly'],
      required: [true, 'Task type is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    xpReward: {
      type: Number,
      default: 10,
    },
    roadmapReference: {
      topicId: String,
      resourceId: String,
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ userId: 1, dueDate: 1 });

export const Task = model<ITask>('Task', TaskSchema);
export default Task;
