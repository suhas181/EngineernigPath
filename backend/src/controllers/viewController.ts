import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ViewCount, ViewEntityType } from '../models/ViewCount';

const trackViewSchema = z.object({
  entityType: z.enum(['resource', 'roadmap']),
  entityId: z.string().min(1, 'entityId is required').trim(),
});

// In-memory cooldown cache: key = `${clientIp}_${entityType}_${entityId}`, value = timestamp
const recentViewsCache = new Map<string, number>();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes cooldown per client per entity

// Periodic cleanup of expired entries in memory every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentViewsCache.entries()) {
    if (now - timestamp > COOLDOWN_MS) {
      recentViewsCache.delete(key);
    }
  }
}, 15 * 60 * 1000);

export const trackView = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = trackViewSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { entityType, entityId } = parseResult.data;

    // Rate-limiting check based on IP and entity
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
    const cacheKey = `${clientIp}_${entityType}_${entityId}`;
    const now = Date.now();
    const lastTracked = recentViewsCache.get(cacheKey);

    if (lastTracked && now - lastTracked < COOLDOWN_MS) {
      // Cooldown active: fetch current views without incrementing to prevent inflation
      const existing = await ViewCount.findOne({ entityType, entityId }).lean();
      res.status(200).json({
        success: true,
        message: 'View already recorded recently (cooldown active)',
        entityType,
        entityId,
        views: existing?.views || 1,
      });
      return;
    }

    // Register timestamp in cooldown cache
    recentViewsCache.set(cacheKey, now);

    // Atomically increment views
    const record = await ViewCount.findOneAndUpdate(
      { entityType, entityId },
      {
        $inc: { views: 1 },
        $set: { lastViewedAt: new Date() },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'View counted successfully',
      entityType,
      entityId,
      views: record.views,
    });
  } catch (error) {
    next(error);
  }
};

export const getViewCounts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const entityType = req.query.entityType as ViewEntityType | undefined;

    const filter: Record<string, any> = {};
    if (entityType && ['resource', 'roadmap'].includes(entityType)) {
      filter.entityType = entityType;
    }

    const counts = await ViewCount.find(filter).lean();
    const viewsMap: Record<string, number> = {};

    for (const item of counts) {
      viewsMap[item.entityId] = item.views;
    }

    res.status(200).json({
      success: true,
      entityType: entityType || 'all',
      count: counts.length,
      views: viewsMap,
    });
  } catch (error) {
    next(error);
  }
};
