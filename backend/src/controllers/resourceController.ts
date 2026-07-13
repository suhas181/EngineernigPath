import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { Resource } from '../models/Resource';
import { UserResourceState } from '../models/UserResourceState';
import { Roadmap } from '../models/Roadmap';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const isApiKeyConfigured = apiKey && apiKey !== 'your-gemini-api-key' && apiKey.trim() !== '';
const genAI = isApiKeyConfigured ? new GoogleGenerativeAI(apiKey) : null;

// Schemas for input validation
const getResourcesQuerySchema = z.object({
  category: z.enum(['video', 'article', 'documentation', 'practice', 'course']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  search: z.string().optional(),
  bookmarkedOnly: z.string().optional(), // 'true' or 'false'
});

const toggleBookmarkSchema = z.object({
  isBookmarked: z.boolean({ required_error: 'isBookmarked is required' }),
});

const toggleCompleteSchema = z.object({
  isCompleted: z.boolean({ required_error: 'isCompleted is required' }),
});

export const getResources = async (
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

    // Validate query inputs
    const parseResult = getResourcesQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { category, difficulty, search, bookmarkedOnly } = parseResult.data;

    // Build static filter
    const filter: any = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    // Keyword Text search
    if (search && search.trim() !== '') {
      filter.$text = { $search: search };
    }

    // Query resources
    const resources = await Resource.find(filter);

    // Get the user's specific states (completions / bookmarks)
    const states = await UserResourceState.find({ userId: user.id });
    const stateMap = new Map(states.map((s) => [s.resourceId.toString(), s]));

    // Join database records with user activity logs
    let augmentedResources = resources.map((r) => {
      const state = stateMap.get(r._id.toString());
      return {
        id: r._id,
        title: r.title,
        description: r.description,
        url: r.url,
        category: r.category,
        difficulty: r.difficulty,
        estimatedTime: r.estimatedTime,
        tags: r.tags,
        clicks: r.clicks,
        isCompleted: state ? state.isCompleted : false,
        isBookmarked: state ? state.isBookmarked : false,
      };
    });

    // Apply client filter for bookmarks if toggled
    if (bookmarkedOnly === 'true') {
      augmentedResources = augmentedResources.filter((r) => r.isBookmarked);
    }

    res.status(200).json({
      success: true,
      count: augmentedResources.length,
      resources: augmentedResources,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleBookmark = async (
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

    // Validate request body
    const parseResult = toggleBookmarkSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { isBookmarked } = parseResult.data;

    // Ensure resource exists
    const resource = await Resource.findById(id);
    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    // Update or create user state for this resource
    let state = await UserResourceState.findOne({ userId: user.id, resourceId: id });
    if (!state) {
      state = new UserResourceState({
        userId: user.id,
        resourceId: id,
      });
    }

    state.isBookmarked = isBookmarked;
    state.bookmarkedAt = isBookmarked ? new Date() : undefined;
    await state.save();

    res.status(200).json({
      success: true,
      message: isBookmarked ? 'Resource bookmarked' : 'Bookmark removed',
      isBookmarked: state.isBookmarked,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleComplete = async (
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

    // Validate request body
    const parseResult = toggleCompleteSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { isCompleted } = parseResult.data;

    // Ensure resource exists
    const resource = await Resource.findById(id);
    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    // 1. Update User State
    let state = await UserResourceState.findOne({ userId: user.id, resourceId: id });
    if (!state) {
      state = new UserResourceState({
        userId: user.id,
        resourceId: id,
      });
    }

    state.isCompleted = isCompleted;
    state.completedAt = isCompleted ? new Date() : undefined;
    await state.save();

    // Increment click/popularity metric
    if (isCompleted) {
      resource.clicks += 1;
      await resource.save();
    }

    // 2. Synchronize with AI Roadmap: if any inline topic resource matches this URL, sync its completion
    const roadmap = await Roadmap.findOne({ userId: user.id });
    let roadmapUpdated = false;

    if (roadmap) {
      roadmap.topics.forEach((topic) => {
        let topicUpdated = false;
        topic.resources.forEach((r) => {
          if (r.url === resource.url) {
            r.isCompleted = isCompleted;
            topicUpdated = true;
            roadmapUpdated = true;
          }
        });

        // Recalculate topic completion based on resources
        if (topicUpdated && topic.resources.length > 0) {
          topic.isCompleted = topic.resources.every((r) => r.isCompleted);
        }
      });

      if (roadmapUpdated) {
        // Recalculate overall progress percentage
        const totalTopics = roadmap.topics.length;
        const completedTopics = roadmap.topics.filter((t) => t.isCompleted).length;
        roadmap.progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
        await roadmap.save();
      }
    }

    res.status(200).json({
      success: true,
      message: isCompleted ? 'Resource marked complete' : 'Resource marked incomplete',
      isCompleted: state.isCompleted,
      roadmapUpdated,
    });
  } catch (error) {
    next(error);
  }
};

export const getAIRecommendations = async (
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

    const userCareer = user.preferredCareer || 'Software Engineer (SDE)';
    const userSkills = user.skills || [];
    const userInterests = user.interests || [];

    // Ensure some baseline resources exist in the database (Seed if completely empty)
    const baseCount = await Resource.countDocuments();
    if (baseCount === 0) {
      await seedDefaultResources();
    }

    let recommendations: any[] = [];

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
You are an expert AI Career Mentor. Give me a list of exactly 3 tags or query terms that an engineering student interested in "${userCareer}" should search for.
The student has current skills: [${userSkills.join(', ')}] and interests: [${userInterests.join(', ')}].
Provide terms that help bridge their skill gap.
Output format must be strictly a JSON array of strings, e.g. ["React Hooks", "Docker Containers", "REST APIs"].
`;
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        });

        const text = result.response.text();
        if (text) {
          const searchTags = JSON.parse(text.trim());
          if (Array.isArray(searchTags) && searchTags.length > 0) {
            // Find resources matching AI tags
            const matched = await Resource.find({
              $or: [
                { tags: { $in: searchTags.map((t) => new RegExp(t, 'i')) } },
                { title: { $in: searchTags.map((t) => new RegExp(t, 'i')) } },
              ],
            }).limit(3);
            
            recommendations = matched;
          }
        }
      } catch (err) {
        console.error('Gemini AI resource recommendation failed, falling back to static database suggestions:', err);
      }
    }

    // Fallback: If AI recommendations failed or returned no matches from DB, get top clicked ones
    if (recommendations.length < 3) {
      const neededCount = 3 - recommendations.length;
      const additional = await Resource.find({
        _id: { $not: { $in: recommendations.map((r) => r._id) } },
      })
        .sort({ clicks: -1 })
        .limit(neededCount);

      recommendations = [...recommendations, ...additional];
    }

    // Augment completion and bookmark flags
    const states = await UserResourceState.find({ userId: user.id });
    const stateMap = new Map(states.map((s) => [s.resourceId.toString(), s]));

    const augmented = recommendations.map((r) => {
      const state = stateMap.get(r._id.toString());
      return {
        id: r._id,
        title: r.title,
        description: r.description,
        url: r.url,
        category: r.category,
        difficulty: r.difficulty,
        estimatedTime: r.estimatedTime,
        tags: r.tags,
        isCompleted: state ? state.isCompleted : false,
        isBookmarked: state ? state.isBookmarked : false,
      };
    });

    res.status(200).json({
      success: true,
      recommendations: augmented,
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Dynamically Seed Default Mock database resources to satisfy cold-start
const seedDefaultResources = async () => {
  const defaults = [
    {
      title: 'freeCodeCamp - React Course for Beginners',
      description: 'Learn React JS from scratch. Master hooks, components, rendering, and API fetches in this comprehensive tutorial.',
      url: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
      category: 'video',
      difficulty: 'beginner',
      estimatedTime: 240, // 4 hours
      tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
    },
    {
      title: 'MDN Web Docs - JavaScript Guide',
      description: 'The standard and comprehensive guide to modern JavaScript syntax, paradigms, structures, and tools.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
      category: 'documentation',
      difficulty: 'beginner',
      estimatedTime: 120,
      tags: ['JavaScript', 'Web Development', 'Documentation'],
    },
    {
      title: 'LeetCode - Array and String Card',
      description: 'Solve coding puzzles, understand memory complexities, and master standard algorithms for technical interviews.',
      url: 'https://leetcode.com/explore/learn/card/array-and-string/',
      category: 'practice',
      difficulty: 'intermediate',
      estimatedTime: 90,
      tags: ['DSA', 'LeetCode', 'Algorithms', 'Java', 'Python'],
    },
    {
      title: 'A Complete Guide to CSS Grid Layout',
      description: 'Deep dive into grid layouts, alignment, template areas, and build responsive responsive pages.',
      url: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
      category: 'article',
      difficulty: 'beginner',
      estimatedTime: 30,
      tags: ['CSS', 'HTML', 'Frontend'],
    },
    {
      title: 'Namaste JavaScript Season 1',
      description: 'Master JS fundamentals: closures, scope chain, event loops, hoisting, prototype chains, and callback queues.',
      url: 'https://youtube.com/playlist?list=PLlasXeu85E9cQ32gLCgSeGtxmFVCglaCx',
      category: 'video',
      difficulty: 'advanced',
      estimatedTime: 300,
      tags: ['JavaScript', 'Web Development'],
    },
  ];

  try {
    await Resource.insertMany(defaults, { ordered: false });
    console.log('[RESOURCE SEED] Dynamic default resources seeded successfully.');
  } catch (err) {
    console.log('[RESOURCE SEED] Resource entries already exist or duplicate keys were skipped.');
  }
};
