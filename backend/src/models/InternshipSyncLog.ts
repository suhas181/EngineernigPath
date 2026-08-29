import { Schema, model, Document } from 'mongoose';

export type SyncStatus = 'RUNNING' | 'SUCCESS' | 'FAILED';

export interface IInternshipSyncLog extends Document {
  syncType: 'SCHEDULED_CRON' | 'BOOTSTRAP' | 'MANUAL_TRIGGER' | 'WEBHOOK';
  status: SyncStatus;
  startedAt: Date;
  completedAt?: Date;
  fetchedCount: number;
  insertedCount: number;
  updatedCount: number;
  rejectedCount: number;
  errorMessage?: string;
  triggeredBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const InternshipSyncLogSchema = new Schema<IInternshipSyncLog>(
  {
    syncType: {
      type: String,
      enum: ['SCHEDULED_CRON', 'BOOTSTRAP', 'MANUAL_TRIGGER', 'WEBHOOK'],
      default: 'SCHEDULED_CRON',
    },
    status: {
      type: String,
      enum: ['RUNNING', 'SUCCESS', 'FAILED'],
      default: 'RUNNING',
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    completedAt: {
      type: Date,
    },
    fetchedCount: {
      type: Number,
      default: 0,
    },
    insertedCount: {
      type: Number,
      default: 0,
    },
    updatedCount: {
      type: Number,
      default: 0,
    },
    rejectedCount: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: '',
    },
    triggeredBy: {
      type: String,
      default: 'SYSTEM_SCHEDULER',
    },
  },
  {
    timestamps: true,
  }
);

// Fast sorting for recent sync history
InternshipSyncLogSchema.index({ startedAt: -1 });
InternshipSyncLogSchema.index({ status: 1 });

export const InternshipSyncLog = model<IInternshipSyncLog>('InternshipSyncLog', InternshipSyncLogSchema);
