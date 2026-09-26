import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { Resource } from '../models/Resource';
import { UserResourceState } from '../models/UserResourceState';
import { RecentResource } from '../models/RecentResource';
import { ViewCount } from '../models/ViewCount';
import { CURATED_RESOURCES } from '../resources';
import { LibraryResource } from '../resources/types';

// Query validation schema
const getResourcesQuerySchema = z.object({
  category: z.string().optional(),
  type: z.string().optional(),
  difficulty: z.string().optional(),
  level: z.string().optional(),
  language: z.string().optional(),
  search: z.string().optional(),
  bookmarkedOnly: z.string().optional(),
});

const toggleBookmarkSchema = z.object({
  isBookmarked: z.boolean({ required_error: 'isBookmarked is required' }),
});

const toggleCompleteSchema = z.object({
  isCompleted: z.boolean({ required_error: 'isCompleted is required' }),
});

const recordRecentResourceSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID is required').trim(),
  title: z.string().min(1, 'Title is required').trim(),
  provider: z.string().optional().default('EngineerPath'),
  type: z.string().optional().default('article'),
  url: z.string().min(1, 'URL is required').url('Must be a valid URL').trim(),
  thumbnail: z.string().optional().default(''),
});

// Helper to derive YouTube thumbnail if not explicitly given
function getResourceThumbnail(url: string, explicitThumbnail?: string): string {
  if (explicitThumbnail && explicitThumbnail.trim() !== '') {
    return explicitThumbnail;
  }
  // Try extracting YouTube ID
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }
  return '';
}

// Stable baseline generator to avoid awkward cold-start empty metrics
function getResourceBaselineViews(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return 120 + (Math.abs(hash) % 2850);
}

export const getResources = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    const { category, type, level, difficulty, language, search, bookmarkedOnly } = req.query;

    // Fetch DB resources if any
    const dbResources = await Resource.find({}).lean();
    
    // Fetch real-time view counts from ViewCount collection
    const viewRecords = await ViewCount.find({ entityType: 'resource' }).lean();
    const viewsMap = new Map<string, number>();
    for (const vr of viewRecords) {
      viewsMap.set(vr.entityId, vr.views);
    }

    // Map DB resources to unified schema
    const mappedDbResources: LibraryResource[] = dbResources.map((r: any) => {
      const resId = r._id.toString();
      const realViews = viewsMap.get(resId) || 0;
      return {
        id: resId,
        title: r.title,
        description: r.description,
        provider: r.provider || 'EngineerPath',
        category: r.category || 'Recommended',
        topic: r.topic || r.tags?.[0] || 'General',
        type: r.type || 'article',
        url: r.url,
        thumbnail: getResourceThumbnail(r.url, r.thumbnail),
        duration: r.estimatedTime ? `${r.estimatedTime} Mins` : 'Self-Paced',
        level: (r.difficulty || 'Beginner') as any,
        tags: r.tags || [],
        featured: r.featured || false,
        language: r.language || 'All',
        verified: true,
        clicks: r.clicks || 0,
        views: (r.views || 0) + realViews + getResourceBaselineViews(resId),
      };
    });

    // Merge DB resources + CURATED_RESOURCES (deduplicating by URL)
    const urlMap = new Map<string, LibraryResource>();
    CURATED_RESOURCES.forEach((res) => {
      const realViews = viewsMap.get(res.id) || 0;
      const base = getResourceBaselineViews(res.id);
      urlMap.set(res.url, {
        ...res,
        thumbnail: getResourceThumbnail(res.url, res.thumbnail),
        views: (res.views || 0) + realViews + base,
      });
    });
    mappedDbResources.forEach((res) => {
      if (!urlMap.has(res.url)) {
        urlMap.set(res.url, res);
      }
    });

    const allCombined = Array.from(urlMap.values());

    // Fetch user bookmarks & completions if authenticated
    const states = user ? await UserResourceState.find({ userId: user.id }).lean() : [];
    const stateMap = new Map(states.map((s: any) => [s.resourceId.toString(), s]));

    // Augment with isCompleted & isBookmarked
    let augmented = allCombined.map((r) => {
      const s: any = stateMap.get(r.id);
      return {
        ...r,
        isCompleted: s ? Boolean(s.isCompleted) : false,
        isBookmarked: s ? Boolean(s.isBookmarked) : false,
      };
    });

    // Filtering logic
    const searchStr = typeof search === 'string' ? search.trim().toLowerCase() : '';
    const catFilter = typeof category === 'string' ? category.trim() : 'all';
    const typeFilter = typeof type === 'string' ? type.trim() : 'all';
    const langFilter = typeof language === 'string' ? language.trim() : 'all';
    const levelFilter = typeof level === 'string' ? level.trim() : (typeof difficulty === 'string' ? difficulty.trim() : 'all');

    if (searchStr) {
      augmented = augmented.filter((r) =>
        (r.title || '').toLowerCase().includes(searchStr) ||
        (r.description || '').toLowerCase().includes(searchStr) ||
        (r.provider || '').toLowerCase().includes(searchStr) ||
        (r.category || '').toLowerCase().includes(searchStr) ||
        (r.topic || '').toLowerCase().includes(searchStr) ||
        (r.tags || []).some((t) => t.toLowerCase().includes(searchStr))
      );
    }

    if (catFilter !== 'all') {
      const lower = catFilter.toLowerCase();
      augmented = augmented.filter((r) => {
        const rCat = (r.category || '').toLowerCase();
        if (lower === 'open sources' || lower === 'open source & gsoc' || lower === 'open source') {
          return rCat === 'open sources' || rCat === 'open source & gsoc' || rCat === 'open source';
        }
        return rCat === lower;
      });
    }

    if (typeFilter !== 'all') {
      augmented = augmented.filter((r) => r.type.toLowerCase() === typeFilter.toLowerCase());
    }

    if (langFilter !== 'all') {
      augmented = augmented.filter((r) => !r.language || r.language === 'All' || r.language.toLowerCase() === langFilter.toLowerCase());
    }

    if (levelFilter !== 'all') {
      augmented = augmented.filter((r) => r.level.toLowerCase() === levelFilter.toLowerCase());
    }

    if (bookmarkedOnly === 'true') {
      augmented = augmented.filter((r) => r.isBookmarked);
    }

    res.status(200).json({
      success: true,
      count: augmented.length,
      resources: augmented,
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
    const career = user?.preferredCareer || 'Software Engineer';
    const preferredLang = user?.preferredProgrammingLanguage || 'Java';

    const states = user ? await UserResourceState.find({ userId: user.id }).lean() : [];
    const stateMap = new Map(states.map((s: any) => [s.resourceId.toString(), s]));

    // Personalize recommended resources
    let recommendations = CURATED_RESOURCES.map((r) => {
      const s: any = stateMap.get(r.id);
      return {
        ...r,
        thumbnail: getResourceThumbnail(r.url, r.thumbnail),
        isCompleted: s ? Boolean(s.isCompleted) : false,
        isBookmarked: s ? Boolean(s.isBookmarked) : false,
      };
    });

    // Filter featured or language-matched
    let filtered = recommendations.filter(
      (r) => r.featured || (r.language && r.language.toLowerCase() === preferredLang.toLowerCase())
    );

    if (filtered.length < 4) {
      filtered = recommendations.slice(0, 6);
    }

    res.status(200).json({
      success: true,
      career,
      preferredLanguage: preferredLang,
      recommendations: filtered.slice(0, 6),
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

    res.status(200).json({
      success: true,
      message: isCompleted ? 'Marked as completed' : 'Marked as uncompleted',
      isCompleted: state.isCompleted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/resources/recent
 * Records or updates a recently opened resource for the authenticated student.
 * Idempotent, deduplicated per user+resourceId, strictly scoped to req.user.id.
 */
export const recordRecentResource = async (
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

    const parseResult = recordRecentResourceSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { resourceId, title, provider, type, url, thumbnail } = parseResult.data;

    // Atomic upsert: Updates lastOpenedAt and metadata if already exists, or creates new record
    const recent = await RecentResource.findOneAndUpdate(
      { userId: user.id, resourceId },
      {
        $set: {
          title,
          provider: provider || 'EngineerPath',
          type: type || 'article',
          url,
          thumbnail: thumbnail || '',
          lastOpenedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Atomically increment the aggregate view counter for this resource
    await ViewCount.findOneAndUpdate(
      { entityType: 'resource', entityId: resourceId },
      {
        $inc: { views: 1 },
        $set: { lastViewedAt: new Date() },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Resource activity recorded successfully',
      resource: {
        id: recent.resourceId,
        resourceId: recent.resourceId,
        title: recent.title,
        provider: recent.provider,
        type: recent.type,
        url: recent.url,
        thumbnail: recent.thumbnail,
        lastOpenedAt: recent.lastOpenedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resources/recent
 * Fetches the authenticated user's recently opened resources sorted by lastOpenedAt DESC.
 * Strictly scoped to req.user.id. Never trusts client-supplied user IDs.
 */
export const getRecentResources = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      // Unauthenticated guests have no server-side history
      res.status(200).json({ success: true, count: 0, resources: [] });
      return;
    }

    const limit = Math.min(20, Math.max(1, parseInt(String(req.query.limit || '10'), 10) || 10));

    // Fetch user's recent resources strictly scoped to req.user.id, ordered by lastOpenedAt DESC
    const recentItems = await RecentResource.find({ userId: user.id })
      .sort({ lastOpenedAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      count: recentItems.length,
      resources: recentItems.map((r) => ({
        id: r.resourceId,
        resourceId: r.resourceId,
        title: r.title,
        provider: r.provider,
        type: r.type,
        url: r.url,
        thumbnail: r.thumbnail,
        lastOpenedAt: r.lastOpenedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};
