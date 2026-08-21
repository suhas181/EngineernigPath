import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  getInternshipsList,
  getInternshipById as fetchInternshipById,
  refreshInternships as runRefreshService,
  toggleUserBookmark,
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
 * Controller to trigger backend sync/refresh of Adzuna job listings
 */
export const refreshInternships = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await runRefreshService();
    res.status(200).json({
      success: true,
      message: `Internship refresh cycle completed successfully. ${stats.added} new added, ${stats.updated} updated.`,
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
