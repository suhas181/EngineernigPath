import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  getInternshipsList,
  getInternshipById as fetchInternshipById,
  refreshInternships as runRefreshService,
  toggleUserBookmark,
  getRecommendedInternships,
  getSyncHealthStatus,
} from '../services/internshipService';

/**
 * Controller to fetch paginated & filtered internship listings
 */
export const getInternships = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await getInternshipsList(req.query, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch detailed info for a single internship
 */
export const getInternshipById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const internship = await fetchInternshipById(id, userId);

    if (!internship) {
      res.status(404).json({ success: false, message: 'Internship listing not found' });
      return;
    }

    res.status(200).json({ success: true, internship });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch personalized internship recommendations for a student
 */
export const getRecommendations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(200).json({ success: true, recommendations: [] });
      return;
    }

    const limit = parseInt(String(req.query.limit || '3'), 10) || 3;
    const recommendations = await getRecommendedInternships(userId, limit);
    res.status(200).json({ success: true, recommendations });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch overall synchronization status and health
 * Read-only summary accessible for monitoring
 */
export const getSyncHealth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const health = await getSyncHealthStatus();
    res.status(200).json({ success: true, health });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for emergency/operator maintenance or external cron webhook
 * Requires Admin authentication or valid x-cron-secret header. Students are strictly forbidden.
 */
export const refreshInternships = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cronSecretHeader = req.headers['x-cron-secret'];
    const expectedSecret = process.env.CRON_SECRET;
    const isCronSecretValid = Boolean(expectedSecret && cronSecretHeader === expectedSecret);
    const isAdmin = Boolean(req.user && req.user.role === 'admin');

    if (!isAdmin && !isCronSecretValid) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Admin role or valid CRON_SECRET is required to manually trigger sync.',
      });
      return;
    }

    const triggerType = isCronSecretValid ? 'WEBHOOK' : 'MANUAL_TRIGGER';
    const triggeredBy = req.user?.email || 'EXTERNAL_CRON_JOB';

    const stats = await runRefreshService(triggerType, triggeredBy);
    res.status(200).json({
      success: true,
      message: `Internship sync completed with status '${stats.status}'. ${stats.added} new added, ${stats.updated} updated.`,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to toggle saved/bookmarked status of an internship
 */
export const toggleBookmark = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const result = await toggleUserBookmark(userId, id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
