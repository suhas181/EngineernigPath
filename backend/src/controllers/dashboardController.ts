import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { Roadmap } from '../models/Roadmap';
import { UserResourceState } from '../models/UserResourceState';
import { Resource } from '../models/Resource';

export const getDashboardData = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Fetch the user's actual roadmap to calculate progress metrics
    const roadmap = await Roadmap.findOne({ userId: user.id });

    const progressSummary = {
      overallProgress: roadmap ? roadmap.progress : 0,
      completedTopics: roadmap ? roadmap.topics.filter((t) => t.isCompleted).length : 0,
      totalTopics: roadmap ? roadmap.topics.length : 0,
      dsaProblemsSolved: 24, // keep mocked for now
      projectsBuilt: 1, // keep mocked for now
    };

    // Calculate real-time study hours and category counts from completed resources
    const completedStates = await UserResourceState.find({ userId: user.id, isCompleted: true });
    const completedResourceIds = completedStates.map((s) => s.resourceId);
    const completedResourcesList = await Resource.find({ _id: { $in: completedResourceIds } });
    
    const totalMinutes = completedResourcesList.reduce((sum, r) => sum + (r.estimatedTime || 0), 0);
    const totalStudyHours = Math.round((totalMinutes / 60) * 10) / 10;

    const categoryCounts: Record<string, number> = { video: 0, article: 0, documentation: 0, practice: 0, course: 0 };
    completedResourcesList.forEach((r) => {
      if (categoryCounts[r.category] !== undefined) {
        categoryCounts[r.category]++;
      }
    });

    const recommendedTopics = [
      {
        id: 'rec-1',
        title: 'Data Structures: Arrays and Linked Lists',
        category: 'DSA',
        difficulty: 'Beginner',
        estimatedTime: '3 hours',
      },
      {
        id: 'rec-2',
        title: 'Git Version Control Basics',
        category: 'Tools',
        difficulty: 'Beginner',
        estimatedTime: '2 hours',
      },
    ];

    const upcomingDeadlines = [
      {
        id: 'dead-1',
        title: 'Uber SDE Internship Application Deadline',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        type: 'internship',
        company: 'Uber',
      },
      {
        id: 'dead-2',
        title: 'Weekly Coding Contest #42',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        type: 'contest',
        company: 'LeetCode',
      },
    ];

    const recentActivities = [
      {
        id: 'act-1',
        description: 'Completed "Introduction to Web Development"',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'act-2',
        description: 'Uploaded and analyzed resume',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    res.status(200).json({
      message: 'Dashboard data retrieved successfully',
      stats: {
        ...progressSummary,
        totalStudyHours,
        categoryCounts,
      },
      recommendations: recommendedTopics,
      deadlines: upcomingDeadlines,
      activities: recentActivities,
    });
  } catch (error) {
    next(error);
  }
};
export default getDashboardData;
