import { Schema, model, Document } from 'mongoose';

export interface IBadge {
  badgeId: string;
  earnedAt: Date;
}

export interface IUserStats extends Document {
  userId: Schema.Types.ObjectId;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  badges: IBadge[];
  createdAt: Date;
  updatedAt: Date;
}

const BadgeSchema = new Schema<IBadge>({
  badgeId: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now },
});

const UserStatsSchema = new Schema<IUserStats>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    badges: [BadgeSchema],
  },
  {
    timestamps: true,
  }
);

export const UserStats = model<IUserStats>('UserStats', UserStatsSchema);
export default UserStats;
