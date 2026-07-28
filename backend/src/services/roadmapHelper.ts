import { User } from '../models/User';
import { Roadmap, IRoadmap } from '../models/Roadmap';
import mongoose from 'mongoose';

/**
 * Single source of truth helper to load ONLY the active roadmap for a given user.
 */
export const getActiveRoadmap = async (userId: string | mongoose.Types.ObjectId): Promise<IRoadmap | null> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return null;
    }

    // 1. Try to load using explicit activeRoadmapId
    if (user.activeRoadmapId) {
      const activeRoadmap = await Roadmap.findById(user.activeRoadmapId);
      if (activeRoadmap) {
        return activeRoadmap;
      }
    }

    // 2. Fallback: Query latest created roadmap for this user
    const latestRoadmap = await Roadmap.findOne({ userId }).sort({ createdAt: -1 });
    if (latestRoadmap) {
      // Persist activeRoadmapId link to user for fast future lookups
      user.activeRoadmapId = latestRoadmap._id as any;
      await user.save();
      return latestRoadmap;
    }

    return null;
  } catch (error) {
    console.error('[ROADMAP-HELPER] Error in getActiveRoadmap:', error);
    return null;
  }
};

export default getActiveRoadmap;
