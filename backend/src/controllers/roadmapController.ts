import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { Roadmap } from '../models/Roadmap';
import { generateRoadmapWithAI, EnrichedProfileInput } from '../services/geminiService';
import mongoose from 'mongoose';

// Schema for toggling a topic/resource/problem/project completion
const toggleRoadmapItemSchema = z.object({
  topicId: z.string({ required_error: 'topicId is required' }).min(1),
  resourceId: z.string().optional(),
  problemId: z.string().optional(),
  project: z.object({
    githubSubmission: z.string().optional(),
    liveDemoSubmission: z.string().optional(),
    isCompleted: z.boolean().optional(),
  }).optional(),
  isCompleted: z.boolean().optional(),
});

// Schema for generating a roadmap
const generateRoadmapSchema = z.object({
  regenerate: z.boolean().optional(),
});

export const getRoadmap = async (
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

    const roadmap = await Roadmap.findOne({ userId: user.id });
    let pendingWeeklyReview = false;
    if (roadmap) {
      const lastReview = roadmap.lastWeeklyReviewDate || roadmap.createdAt;
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - new Date(lastReview).getTime() >= oneWeekMs) {
        pendingWeeklyReview = true;
      }
      if (req.query.debugWeeklyReview === 'true') {
        pendingWeeklyReview = true;
      }
    }

    res.status(200).json({ success: true, roadmap, pendingWeeklyReview });
  } catch (error) {
    next(error);
  }
};

export const generateRoadmap = async (
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

    // 1. Enforce user profile completeness
    if (!user.preferredCareer || !user.currentSemester) {
      res.status(400).json({
        success: false,
        message: 'Profile incomplete. Please ensure both target role and current semester are saved in Profile Setup.',
      });
      return;
    }

    // Parse options (e.g. regenerate flag)
    const parseResult = generateRoadmapSchema.safeParse(req.body);
    const regenerate = parseResult.success ? !!parseResult.data.regenerate : false;

    // 2. Enforce Idempotency: return existing roadmap unless explicitly requesting regeneration
    const existingRoadmap = await Roadmap.findOne({ userId: user.id });
    if (existingRoadmap && !regenerate) {
      res.status(200).json({
        success: true,
        message: 'Roadmap already exists (idempotent)',
        roadmap: existingRoadmap,
      });
      return;
    }

    // 3. Determine completed months for dynamic regeneration
    const completedMonths: string[] = [];
    let preservedTopics: any[] = [];

    if (existingRoadmap && regenerate) {
      // Preserve completed topics — only regenerate uncompleted future months
      existingRoadmap.topics.forEach((topic) => {
        if (topic.isCompleted) {
          completedMonths.push(topic.title);
          preservedTopics.push({
            id: topic.id,
            title: topic.title,
            description: topic.description,
            isCompleted: true,
            resources: topic.resources.map((r) => ({
              id: r.id,
              title: r.title,
              url: r.url,
              type: r.type,
              difficulty: r.difficulty,
              isCompleted: r.isCompleted,
            })),
          });
        }
      });

      console.log(`[ROADMAP-CTRL] Preserving ${completedMonths.length} completed months, regenerating future months.`);

      // Delete old roadmap — we'll recreate it with preserved + new topics
      await Roadmap.deleteOne({ userId: user.id });
    } else if (existingRoadmap) {
      await Roadmap.deleteOne({ userId: user.id });
    }

    // 4. Fetch resume score (atsScore from latest resume, if exists)
    let resumeScore = 0;
    try {
      const Resume = mongoose.model('Resume');
      const latestResume = await Resume.findOne({ userId: user.id }).sort({ createdAt: -1 }).lean() as any;
      if (latestResume && typeof latestResume.atsScore === 'number') {
        resumeScore = latestResume.atsScore;
      }
    } catch (e) {
      // Resume model may not be registered yet — not critical
      console.log('[ROADMAP-CTRL] Resume model not available, defaulting resumeScore to 0');
    }

    // 5. Build enriched profile input for the AI pipeline
    const enrichedProfile: EnrichedProfileInput = {
      name: user.name,
      preferredCareer: user.preferredCareer || '',
      currentSemester: user.currentSemester || 1,
      branch: (user as any).branch || '',
      cgpa: (user as any).cgpa || 0,

      skills: user.skills || [],
      interests: user.interests || [],
      programmingLanguages: (user as any).programmingLanguages || [],
      frameworks: (user as any).frameworks || [],

      dsaLevel: (user as any).dsaLevel || 'Beginner',
      frontendLevel: (user as any).frontendLevel || 'Beginner',
      backendLevel: (user as any).backendLevel || 'Beginner',
      databaseLevel: (user as any).databaseLevel || 'Beginner',
      csFundamentalsLevel: (user as any).csFundamentalsLevel || 'Beginner',
      aptitudeLevel: (user as any).aptitudeLevel || 'Beginner',
      communicationLevel: (user as any).communicationLevel || 'Beginner',

      leetcodeEasyCount: (user as any).leetcodeEasyCount || 0,
      leetcodeMediumCount: (user as any).leetcodeMediumCount || 0,
      leetcodeHardCount: (user as any).leetcodeHardCount || 0,

      careerGoal: (user as any).careerGoal || 'Placement',
      placementTimeline: (user as any).placementTimeline || '6 Months',
      dreamCompany: (user as any).dreamCompany || '',
      dailyStudyHours: (user as any).dailyStudyHours || 2,

      strongSubjects: (user as any).strongSubjects || [],
      weakSubjects: (user as any).weakSubjects || [],
      projects: (user as any).projects || [],

      resumeScore,
      completedMonths,
    };

    console.log('[ROADMAP-CTRL] Calling AI pipeline with enriched profile:', {
      name: enrichedProfile.name,
      careerGoal: enrichedProfile.careerGoal,
      placementTimeline: enrichedProfile.placementTimeline,
      completedMonths: enrichedProfile.completedMonths.length,
      resumeScore: enrichedProfile.resumeScore,
    });

    // 6. Call AI Service
    const generated = await generateRoadmapWithAI(enrichedProfile);

    if (!generated || !generated.topics) {
      res.status(502).json({
        success: false,
        message: 'The AI Career Mentor generated an invalid response. Please try again.',
      });
      return;
    }

    // 7. Merge preserved completed topics with newly generated topics
    const allTopics = [
      ...preservedTopics.map((topic: any) => ({
        id: topic.id,
        title: topic.title,
        description: topic.description,
        isCompleted: topic.isCompleted,
        resources: (topic.resources || []).map((res: any) => ({
          id: res.id,
          title: res.title,
          url: res.url,
          type: res.type,
          difficulty: res.difficulty,
          isCompleted: res.isCompleted,
        })),
      })),
      ...(generated.topics || []).map((topic: any, tIndex: number) => ({
        id: topic.id || `topic-${preservedTopics.length + tIndex + 1}-${Math.random().toString(36).substr(2, 5)}`,
        title: topic.title || 'Untitled Topic',
        description: topic.description || '',
        isCompleted: false,
        resources: (topic.resources || []).map((res: any, rIndex: number) => ({
          id: res.id || `res-${preservedTopics.length + tIndex + 1}-${rIndex}-${Math.random().toString(36).substr(2, 5)}`,
          title: res.title || 'Untitled Resource',
          url: res.url || '#',
          type: res.type || 'article',
          difficulty: res.difficulty || 'beginner',
          isCompleted: false,
        })),
      })),
    ];

    // 8. Save generated roadmap to database
    const completedTopics = allTopics.filter((t) => t.isCompleted).length;
    const totalTopics = allTopics.length;
    const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    const newRoadmap = await Roadmap.create({
      userId: user.id,
      title: generated.title || `Personalized Roadmap for ${user.preferredCareer}`,
      description: generated.description || 'Custom tailored learning roadmap.',
      topics: allTopics,
      progress,
      version: generated.version || '2.0.0',
    });

    console.log(`[ROADMAP-CTRL] Roadmap saved: ${allTopics.length} topics (${preservedTopics.length} preserved, ${generated.topics.length} new), progress: ${progress}%`);

    res.status(201).json({
      success: true,
      message: completedMonths.length > 0
        ? `Roadmap regenerated: ${completedMonths.length} completed months preserved, ${generated.topics.length} future months updated.`
        : 'Roadmap generated successfully',
      roadmap: newRoadmap,
      summary: generated.summary || null,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleRoadmapItem = async (
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

    const parseResult = toggleRoadmapItemSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { topicId, resourceId, problemId, project, isCompleted } = parseResult.data;

    const roadmap = await Roadmap.findOne({ userId: user.id });
    if (!roadmap) {
      res.status(404).json({ success: false, message: 'Roadmap not found' });
      return;
    }

    const topic = roadmap.topics.find((t) => t.id === topicId);
    if (!topic) {
      res.status(404).json({ success: false, message: 'Topic not found in roadmap' });
      return;
    }

    const targetVal = isCompleted !== undefined ? !!isCompleted : false;

    if (resourceId) {
      // Toggle a specific resource
      const resource = topic.resources.find((r) => r.id === resourceId);
      if (!resource) {
        res.status(404).json({ success: false, message: 'Resource not found in topic' });
        return;
      }
      resource.isCompleted = targetVal;
    } else if (problemId) {
      // Toggle a specific practice problem
      if (!topic.practiceProblems) {
        topic.practiceProblems = [];
      }
      const problem = topic.practiceProblems.find((p) => p.id === problemId);
      if (!problem) {
        res.status(404).json({ success: false, message: 'Practice problem not found in topic' });
        return;
      }
      problem.isCompleted = targetVal;
    } else if (project) {
      // Update/toggle project details
      if (!topic.project) {
        res.status(404).json({ success: false, message: 'Project not defined for this month' });
        return;
      }
      if (project.githubSubmission !== undefined) {
        topic.project.githubSubmission = project.githubSubmission;
      }
      if (project.liveDemoSubmission !== undefined) {
        topic.project.liveDemoSubmission = project.liveDemoSubmission;
      }
      if (project.isCompleted !== undefined) {
        topic.project.isCompleted = project.isCompleted;
      }
    } else if (isCompleted !== undefined) {
      // Toggle entire month and sync resources, practice problems, and projects
      topic.isCompleted = targetVal;
      topic.resources.forEach((r) => {
        r.isCompleted = targetVal;
      });
      if (topic.practiceProblems) {
        topic.practiceProblems.forEach((p) => {
          p.isCompleted = targetVal;
        });
      }
      if (topic.project) {
        topic.project.isCompleted = targetVal;
      }
    }

    // Auto-update month (topic) overall completion state based on children status
    const allResourcesDone = topic.resources.every((r) => r.isCompleted);
    const allProblemsDone = !topic.practiceProblems || topic.practiceProblems.length === 0 || topic.practiceProblems.every((p) => p.isCompleted);
    const projectDone = !topic.project || topic.project.isCompleted;

    if (resourceId || problemId || project) {
      topic.isCompleted = allResourcesDone && allProblemsDone && projectDone;
    }

    // Recalculate progress: count total items vs completed items across the entire roadmap
    let totalItems = 0;
    let completedItems = 0;

    roadmap.topics.forEach((t) => {
      // Resources
      totalItems += t.resources.length;
      completedItems += t.resources.filter((r) => r.isCompleted).length;

      // Problems
      if (t.practiceProblems && t.practiceProblems.length > 0) {
        totalItems += t.practiceProblems.length;
        completedItems += t.practiceProblems.filter((p) => p.isCompleted).length;
      }

      // Project
      if (t.project) {
        totalItems += 1;
        if (t.project.isCompleted) {
          completedItems += 1;
        }
      }
    });

    roadmap.progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    await roadmap.save();

    res.status(200).json({
      success: true,
      message: 'Roadmap progress updated',
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};

const weeklyReviewSchema = z.object({
  easySolved: z.number().int().min(0).default(0),
  mediumSolved: z.number().int().min(0).default(0),
  hardSolved: z.number().int().min(0).default(0),
  completedTopicIds: z.array(z.string()).default([]),
  difficultTopics: z.array(z.string()).default([]),
  projectCompleted: z.boolean().optional(),
  adaptRoadmap: z.boolean().optional(),
});

export const submitWeeklyReview = async (
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

    const parseResult = weeklyReviewSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { easySolved, mediumSolved, hardSolved, completedTopicIds, difficultTopics, projectCompleted, adaptRoadmap } = parseResult.data;

    // 1. Update user LeetCode solved count
    user.leetcodeEasyCount = (user.leetcodeEasyCount || 0) + easySolved;
    user.leetcodeMediumCount = (user.leetcodeMediumCount || 0) + mediumSolved;
    user.leetcodeHardCount = (user.leetcodeHardCount || 0) + hardSolved;

    // 2. Append difficultTopics to user weakSubjects (avoiding duplicates)
    const currentWeak = user.weakSubjects || [];
    const newWeakSet = new Set([...currentWeak, ...difficultTopics]);
    user.weakSubjects = Array.from(newWeakSet);

    await user.save();

    // 3. Update active Roadmap properties
    const roadmap = await Roadmap.findOne({ userId: user.id });
    if (!roadmap) {
      res.status(404).json({ success: false, message: 'Active roadmap not found' });
      return;
    }

    // Toggle completed topics/months
    if (completedTopicIds && completedTopicIds.length > 0) {
      roadmap.topics.forEach((topic) => {
        if (completedTopicIds.includes(topic.id)) {
          topic.isCompleted = true;
          topic.resources.forEach((r) => { r.isCompleted = true; });
          if (topic.practiceProblems) {
            topic.practiceProblems.forEach((p) => { p.isCompleted = true; });
          }
          if (topic.project) {
            topic.project.isCompleted = true;
          }
        }
      });
    }

    // If current month project completed is flagged, mark the active month's project as completed
    if (projectCompleted) {
      // Find the first uncompleted month and mark its project as completed
      const activeMonth = roadmap.topics.find((t) => !t.isCompleted);
      if (activeMonth && activeMonth.project) {
        activeMonth.project.isCompleted = true;
        
        // Check if that auto-completes the active month
        const allResourcesDone = activeMonth.resources.every((r) => r.isCompleted);
        const allProblemsDone = !activeMonth.practiceProblems || activeMonth.practiceProblems.every((p) => p.isCompleted);
        if (allResourcesDone && allProblemsDone) {
          activeMonth.isCompleted = true;
        }
      }
    }

    // Recalculate roadmap progress
    let totalItems = 0;
    let completedItems = 0;
    roadmap.topics.forEach((t) => {
      totalItems += t.resources.length;
      completedItems += t.resources.filter((r) => r.isCompleted).length;
      if (t.practiceProblems && t.practiceProblems.length > 0) {
        totalItems += t.practiceProblems.length;
        completedItems += t.practiceProblems.filter((p) => p.isCompleted).length;
      }
      if (t.project) {
        totalItems += 1;
        if (t.project.isCompleted) {
          completedItems += 1;
        }
      }
    });
    roadmap.progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Reset last weekly review date to now
    roadmap.lastWeeklyReviewDate = new Date();
    await roadmap.save();

    console.log(`[WEEKLY-REVIEW] Solved: +${easySolved}E/+${mediumSolved}M/+${hardSolved}H. Progress: ${roadmap.progress}%`);

    // 4. Adapt roadmap if requested
    if (adaptRoadmap) {
      res.status(200).json({
        success: true,
        message: 'Weekly review submitted. Adapting roadmap structure...',
        adaptRequired: true,
        roadmap,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Weekly review submitted successfully',
      adaptRequired: false,
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};
