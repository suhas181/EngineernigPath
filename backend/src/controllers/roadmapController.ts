import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { Roadmap } from '../models/Roadmap';
import { generateRoadmapWithAI, EnrichedProfileInput } from '../services/geminiService';
import mongoose from 'mongoose';

// Schema for toggling a topic/resource completion
const toggleRoadmapItemSchema = z.object({
  topicId: z.string({ required_error: 'topicId is required' }).min(1),
  resourceId: z.string().optional(),
  isCompleted: z.boolean({ required_error: 'isCompleted is required' }),
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
    res.status(200).json({ success: true, roadmap });
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

    // Validate body request with Zod
    const parseResult = toggleRoadmapItemSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { topicId, resourceId, isCompleted } = parseResult.data;

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

    if (resourceId) {
      // Toggle a specific resource
      const resource = topic.resources.find((r) => r.id === resourceId);
      if (!resource) {
        res.status(404).json({ success: false, message: 'Resource not found in topic' });
        return;
      }
      resource.isCompleted = isCompleted;

      // Auto update topic status based on resource completion
      if (topic.resources.length > 0) {
        topic.isCompleted = topic.resources.every((r) => r.isCompleted);
      }
    } else {
      // Toggle entire topic and sync all its children resources
      topic.isCompleted = isCompleted;
      topic.resources.forEach((r) => {
        r.isCompleted = isCompleted;
      });
    }

    // Recalculate progress: percentage of completed topics
    const totalTopics = roadmap.topics.length;
    const completedTopics = roadmap.topics.filter((t) => t.isCompleted).length;
    roadmap.progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

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
