import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType =
  | 'ai_suggestion'
  | 'internship_alert'
  | 'learning_resource'
  | 'system_announcement'
  | 'milestone';

export interface INotification extends Document {
  userId?: Types.ObjectId | null;
  isBroadcast: boolean;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    isBroadcast: {
      type: Boolean,
      default: false,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'ai_suggestion',
        'internship_alert',
        'learning_resource',
        'system_announcement',
        'milestone',
      ],
      default: 'system_announcement',
    },
    link: {
      type: String,
      default: '',
      trim: true,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ createdAt: -1 });

export const Notification = model<INotification>('Notification', NotificationSchema);
