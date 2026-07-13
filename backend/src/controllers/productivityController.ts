import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { UserStats } from '../models/UserStats';
import { Task } from '../models/Task';
import { PlannerEvent } from '../models/PlannerEvent';
import { Roadmap } from '../models/Roadmap';

// Request body validation schemas
const createTaskSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).min(1).trim(),
  type: z.enum(['daily', 'weekly']),
  dueDate: z.string().transform((val) => new Date(val)),
  xpReward: z.number().optional(),
});

const toggleTaskSchema = z.object({
  isCompleted: z.boolean({ required_error: 'isCompleted is required' }),
});

const createEventSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).min(1).trim(),
  description: z.string().optional(),
  startTime: z.string().transform((val) => new Date(val)),
  endTime: z.string().transform((val) => new Date(val)),
  roadmapReference: z.object({
    topicId: z.string(),
  }).optional(),
});

// Helper: Check and award badges based on productivity achievements
const checkAndAwardBadges = (stats: any, completedTasksCount: number): string[] => {
  const newlyEarnedBadges: string[] = [];
  const existingBadgeIds = new Set(stats.badges.map((b: any) => b.badgeId));

  const addBadge = (badgeId: string) => {
    if (!existingBadgeIds.has(badgeId)) {
      stats.badges.push({ badgeId, earnedAt: new Date() });
      newlyEarnedBadges.push(badgeId);
    }
  };

  // 1. Task badges
  if (completedTasksCount >= 1) addBadge('task_starter');
  if (completedTasksCount >= 10) addBadge('task_conqueror');
  
  // 2. Level badges
  if (stats.level >= 2) addBadge('level_2_pioneer');
  if (stats.level >= 5) addBadge('level_5_master');

  // 3. Streak badges
  if (stats.currentStreak >= 3) addBadge('streak_3_days');
  if (stats.currentStreak >= 7) addBadge('streak_7_days_hero');

  return newlyEarnedBadges;
};

export const getUserStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    let stats = await UserStats.findOne({ userId: user.id });
    if (!stats) {
      // First-time stats initialize
      stats = await UserStats.create({
        userId: user.id,
        xp: 0,
        level: 1,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date(),
        badges: [{ badgeId: 'welcome_pioneer', earnedAt: new Date() }],
      });
      res.status(200).json({ success: true, stats, newlyEarnedBadges: [] });
      return;
    }

    // Streak checking logic on active requests
    const today = new Date();
    const lastActive = new Date(stats.lastActiveDate);

    today.setHours(0, 0, 0, 0);
    lastActive.setHours(0, 0, 0, 0);

    const diffMs = today.getTime() - lastActive.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let streakUpdated = false;

    if (diffDays === 1) {
      // Increment streak since user returns exactly the next calendar day
      stats.currentStreak += 1;
      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }
      stats.lastActiveDate = new Date();
      streakUpdated = true;
    } else if (diffDays > 1) {
      // Reset streak back to 1 since consistency broke
      stats.currentStreak = 1;
      stats.lastActiveDate = new Date();
      streakUpdated = true;
    } else if (diffDays === 0) {
      // Still active today, just update lastActiveDate timestamp
      stats.lastActiveDate = new Date();
    }

    // Award badges if streak milestones met
    const completedTasksCount = await Task.countDocuments({ userId: user.id, isCompleted: true });
    const newlyEarnedBadges = checkAndAwardBadges(stats, completedTasksCount);

    if (streakUpdated || newlyEarnedBadges.length > 0) {
      await stats.save();
    }

    res.status(200).json({
      success: true,
      stats,
      newlyEarnedBadges,
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { type } = req.query;
    const filter: any = { userId: user.id };
    if (type === 'daily' || type === 'weekly') {
      filter.type = type;
    }

    const tasks = await Task.find(filter).sort({ isCompleted: 1, dueDate: 1 });
    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const parseResult = createTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { title, type, dueDate, xpReward } = parseResult.data;

    // Daily tasks yield 10 XP; Weekly tasks yield 30 XP by default
    const finalXpReward = xpReward !== undefined ? xpReward : type === 'daily' ? 10 : 30;

    const newTask = await Task.create({
      userId: user.id,
      title,
      type,
      dueDate,
      xpReward: finalXpReward,
      isCompleted: false,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: newTask,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleTaskComplete = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { id } = req.params;
    const parseResult = toggleTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { isCompleted } = parseResult.data;

    const task = await Task.findOne({ _id: id, userId: user.id });
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Check transition
    const transitionToComplete = !task.isCompleted && isCompleted;
    const transitionToIncomplete = task.isCompleted && !isCompleted;

    task.isCompleted = isCompleted;
    task.completedAt = isCompleted ? new Date() : undefined;
    await task.save();

    let xpGained = 0;
    let levelUp = false;
    let newlyEarnedBadges: string[] = [];

    // Award / deduct XP
    if (transitionToComplete || transitionToIncomplete) {
      let stats = await UserStats.findOne({ userId: user.id });
      if (!stats) {
        stats = new UserStats({ userId: user.id, xp: 0, level: 1 });
      }

      if (transitionToComplete) {
        xpGained = task.xpReward;
        stats.xp += xpGained;
      } else {
        xpGained = -task.xpReward;
        stats.xp = Math.max(0, stats.xp + xpGained);
      }

      // Check level upgrades: 200 XP points needed per level
      const calculatedLevel = Math.floor(stats.xp / 200) + 1;
      if (calculatedLevel !== stats.level) {
        if (calculatedLevel > stats.level) {
          levelUp = true;
        }
        stats.level = calculatedLevel;
      }

      // Check badge rewards
      const completedTasksCount = await Task.countDocuments({ userId: user.id, isCompleted: true });
      newlyEarnedBadges = checkAndAwardBadges(stats, completedTasksCount);

      await stats.save();
    }

    // Sync with Roadmap if this task represents a roadmap item
    let roadmapSynced = false;
    if (task.roadmapReference && task.roadmapReference.topicId) {
      const roadmap = await Roadmap.findOne({ userId: user.id });
      if (roadmap) {
        const topic = roadmap.topics.find((t) => t.id === task.roadmapReference?.topicId);
        if (topic) {
          if (task.roadmapReference.resourceId) {
            const resource = topic.resources.find((r) => r.id === task.roadmapReference?.resourceId);
            if (resource) {
              resource.isCompleted = isCompleted;
              topic.isCompleted = topic.resources.every((r) => r.isCompleted);
              roadmapSynced = true;
            }
          } else {
            topic.isCompleted = isCompleted;
            topic.resources.forEach((r) => {
              r.isCompleted = isCompleted;
            });
            roadmapSynced = true;
          }
        }

        if (roadmapSynced) {
          const totalTopics = roadmap.topics.length;
          const completedTopics = roadmap.topics.filter((t) => t.isCompleted).length;
          roadmap.progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
          await roadmap.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      task,
      xpGained,
      levelUp,
      newlyEarnedBadges,
      roadmapSynced,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlannerEvents = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { start, end } = req.query;
    const filter: any = { userId: user.id };

    if (start && end) {
      filter.startTime = { $gte: new Date(start as string) };
      filter.endTime = { $lte: new Date(end as string) };
    }

    const events = await PlannerEvent.find(filter).sort({ startTime: 1 });
    res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    next(error);
  }
};

export const createPlannerEvent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const parseResult = createEventSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { title, description, startTime, endTime, roadmapReference } = parseResult.data;

    if (endTime.getTime() <= startTime.getTime()) {
      res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
      return;
    }

    const newEvent = await PlannerEvent.create({
      userId: user.id,
      title,
      description,
      startTime,
      endTime,
      roadmapReference,
      isCompleted: false,
    });

    res.status(201).json({
      success: true,
      message: 'Planner event scheduled successfully',
      event: newEvent,
    });
  } catch (error) {
    next(error);
  }
};

export const togglePlannerEventComplete = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { id } = req.params;
    const { isCompleted } = req.body;

    if (isCompleted === undefined) {
      res.status(400).json({ success: false, message: 'isCompleted is required' });
      return;
    }

    const event = await PlannerEvent.findOneAndUpdate(
      { _id: id, userId: user.id },
      { isCompleted },
      { new: true }
    );

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event progress updated',
      event,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlannerEvent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { id } = req.params;

    const event = await PlannerEvent.findOneAndDelete({ _id: id, userId: user.id });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getProductivityAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Weekly completion aggregation
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const tasksAnalytics = await Task.aggregate([
      {
        $match: {
          userId: user._id,
          isCompleted: true,
          completedAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          completedCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalTasks = await Task.countDocuments({ userId: user.id });
    const completedTasks = await Task.countDocuments({ userId: user.id, isCompleted: true });

    res.status(200).json({
      success: true,
      tasksStats: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      weeklyTrend: tasksAnalytics,
    });
  } catch (error) {
    next(error);
  }
};
