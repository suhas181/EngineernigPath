import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { Roadmap } from '../models/Roadmap';
import { UserResourceState } from '../models/UserResourceState';
import { Resource } from '../models/Resource';
import { PlannerEvent } from '../models/PlannerEvent';
import { Task } from '../models/Task';
import { Resume } from '../models/Resume';
import { getActiveRoadmap } from '../services/roadmapHelper';

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

    // 1. Fetch User Active Roadmap using single source of truth helper
    const roadmap = await getActiveRoadmap(user.id);

    // 2. Calculate Completed Resources & Real Study Hours
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

    // 3. Real DSA Problems Solved (LeetCode profile counts + completed roadmap practice problems + practice resources)
    const leetcodeTotal = (user.leetcodeEasyCount || 0) + (user.leetcodeMediumCount || 0) + (user.leetcodeHardCount || 0);
    const roadmapPracticeSolved = roadmap && roadmap.topics
      ? roadmap.topics.reduce((acc, t) => acc + (t.practiceProblems ? t.practiceProblems.filter((p) => p.isCompleted).length : 0), 0)
      : 0;
    const practiceResourcesCount = completedResourcesList.filter((r) => r.category === 'practice').length;
    const dsaProblemsSolved = leetcodeTotal + roadmapPracticeSolved + practiceResourcesCount;

    // 4. Real Projects Built (User profile projects + Roadmap completed month projects)
    const userProjectsBuilt = user.projects
      ? user.projects.filter((p) => p.isCompleted || (p.githubLink && p.githubLink.trim() !== '') || (p.liveLink && p.liveLink.trim() !== '')).length
      : 0;
    const roadmapProjectsBuilt = roadmap && roadmap.topics
      ? roadmap.topics.filter((t) => t.project && (t.project.isCompleted || (t.project.githubSubmission && t.project.githubSubmission.trim() !== ''))).length
      : 0;
    const projectsBuilt = userProjectsBuilt + roadmapProjectsBuilt;

    // 5. Intelligent Active Roadmap Metadata & Progress (Strictly from user's active roadmap)
    let hasActiveRoadmap = false;
    let activeCareerPath = user.preferredCareer || 'Engineering Pathway';
    let targetGoal = (user as any).careerGoal || 'Placement';
    let durationMonths = (user as any).placementTimeline || '6 Months';
    let estimatedCompletionDate: Date | null = null;

    let currentMonth: string | null = null;
    let currentModule: string | null = null;
    let currentTopic: string | null = null;
    let completionPercentage = 0;
    let estimatedHoursRemaining = 0;
    let recommendedTopics: Array<{
      id: string;
      title: string;
      category: string;
      difficulty: string;
      estimatedTime: string;
    }> = [];
    let nextTask: any = null;

    if (roadmap) {
      hasActiveRoadmap = true;
      completionPercentage = roadmap.progress || 0;
      activeCareerPath = roadmap.careerTrack || user.preferredCareer || roadmap.title;
      targetGoal = roadmap.targetGoal || (user as any).careerGoal || 'Placement';
      durationMonths = roadmap.durationMonths || (user as any).placementTimeline || '6 Months';
      estimatedCompletionDate = roadmap.estimatedCompletionDate || null;

      if (roadmap.topics && roadmap.topics.length > 0) {
        // Filter UNFINISHED topics ONLY
        const uncompletedTopics = roadmap.topics.filter((t) => !t.isCompleted);
        estimatedHoursRemaining = uncompletedTopics.reduce((sum, t) => sum + (t.estimatedStudyHours || 2), 0);

        if (uncompletedTopics.length > 0) {
          const activeTopic = uncompletedTopics[0];
          currentMonth = activeTopic.title;
          currentModule = activeTopic.whyThisMonth || (activeTopic.weeklyStudyPlan && activeTopic.weeklyStudyPlan.length > 0 ? activeTopic.weeklyStudyPlan[0] : activeTopic.description);
          currentTopic = activeTopic.weeklyStudyPlan && activeTopic.weeklyStudyPlan.length > 0 ? activeTopic.weeklyStudyPlan[0] : activeTopic.title;

          // Recommendations derived strictly from uncompleted topics of user's active roadmap
          recommendedTopics = uncompletedTopics.slice(0, 3).map((t, idx) => ({
            id: t.id || `rec-topic-${idx}`,
            title: t.title,
            category: activeCareerPath,
            difficulty: t.project?.difficulty || 'Intermediate',
            estimatedTime: t.estimatedStudyHours ? `${t.estimatedStudyHours} hours` : '2 hours',
          }));

          nextTask = recommendedTopics[0] || null;
        } else {
          currentMonth = 'All Roadmap Topics Completed!';
          currentModule = 'Mastery Achieved';
          currentTopic = 'Placement Ready';
        }
      }
    }

    const progressSummary = {
      overallProgress: completionPercentage,
      completedTopics: roadmap ? roadmap.topics.filter((t) => t.isCompleted).length : 0,
      totalTopics: roadmap ? (roadmap.topics ? roadmap.topics.length : 0) : 0,
      dsaProblemsSolved,
      projectsBuilt,
    };

    // 6. Dynamic Upcoming Deadlines (Planner Events, Tasks with due dates, Bookmarked opportunities)
    const now = new Date();
    const [upcomingEvents, upcomingTasks, bookmarkedStates] = await Promise.all([
      PlannerEvent.find({ userId: user.id, endTime: { $gte: now } }).sort({ endTime: 1 }).limit(5),
      Task.find({ userId: user.id, isCompleted: false, dueDate: { $gte: now } }).sort({ dueDate: 1 }).limit(5),
      UserResourceState.find({ userId: user.id, isBookmarked: true }).populate('resourceId').limit(5),
    ]);

    const combinedDeadlines: Array<{
      id: string;
      title: string;
      date: string;
      type: string;
      company: string;
    }> = [];

    upcomingEvents.forEach((ev) => {
      combinedDeadlines.push({
        id: ev._id.toString(),
        title: ev.title,
        date: ev.endTime.toISOString(),
        type: 'Planner Event',
        company: 'Planner',
      });
    });

    upcomingTasks.forEach((t) => {
      combinedDeadlines.push({
        id: t._id.toString(),
        title: t.title,
        date: t.dueDate.toISOString(),
        type: t.type === 'daily' ? 'Daily Task' : 'Weekly Target',
        company: 'Checklist',
      });
    });

    bookmarkedStates.forEach((bState) => {
      const resObj = bState.resourceId as any;
      if (resObj && resObj.title) {
        combinedDeadlines.push({
          id: bState._id.toString(),
          title: resObj.title,
          date: bState.bookmarkedAt ? bState.bookmarkedAt.toISOString() : bState.createdAt.toISOString(),
          type: resObj.category || 'Bookmark',
          company: 'Opportunity',
        });
      }
    });

    // Sort by date ascending and take top 5
    combinedDeadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const upcomingDeadlines = combinedDeadlines.slice(0, 5);

    // 7. Dynamic Recent Activities (Completed resources, completed roadmap topics, uploaded resumes)
    const [recentCompletedStates, recentResumes] = await Promise.all([
      UserResourceState.find({ userId: user.id, isCompleted: true })
        .sort({ updatedAt: -1 })
        .limit(4)
        .populate('resourceId'),
      Resume.find({ userId: user.id }).sort({ createdAt: -1 }).limit(2),
    ]);

    const combinedActivities: Array<{
      id: string;
      description: string;
      date: string;
    }> = [];

    // Roadmap Topic Completions
    if (roadmap && roadmap.topics) {
      roadmap.topics.filter((t) => t.isCompleted).forEach((topic, idx) => {
        combinedActivities.push({
          id: topic.id || `topic-completed-${idx}`,
          description: `Mastered roadmap topic "${topic.title}"`,
          date: (roadmap.updatedAt || roadmap.createdAt).toISOString(),
        });
      });
    }

    // Resource Completions
    recentCompletedStates.forEach((state) => {
      const resObj = state.resourceId as any;
      if (resObj && resObj.title) {
        combinedActivities.push({
          id: state._id.toString(),
          description: `Completed resource "${resObj.title}"`,
          date: (state.completedAt || state.updatedAt || state.createdAt).toISOString(),
        });
      }
    });

    // Resume Uploads & Analyses
    recentResumes.forEach((resume) => {
      combinedActivities.push({
        id: resume._id.toString(),
        description: `Uploaded & analyzed resume "${resume.fileName}"`,
        date: resume.createdAt.toISOString(),
      });
    });

    // Sort by date descending and take top 4
    combinedActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recentActivities = combinedActivities.slice(0, 4);

    res.status(200).json({
      message: 'Dashboard data retrieved successfully',
      hasActiveRoadmap,
      activeCareerPath,
      targetGoal,
      durationMonths,
      estimatedCompletionDate,
      currentMonth,
      currentModule,
      currentTopic,
      completionPercentage,
      nextTask,
      estimatedHoursRemaining,
      continueLearningRoute: '/roadmaps',
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
