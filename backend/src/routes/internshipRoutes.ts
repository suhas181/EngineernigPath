import { Router } from 'express';
import {
  getInternships,
  getInternshipById,
  getRecommendations,
  getSyncHealth,
  refreshInternships,
  toggleBookmark,
} from '../controllers/internshipController';
import { protect, optionalAuth } from '../middlewares/auth';

const router = Router();

// Public / student endpoints
router.get('/', optionalAuth, getInternships);
router.get('/health', optionalAuth, getSyncHealth);
router.get('/recommendations', protect, getRecommendations);
router.get('/:id', optionalAuth, getInternshipById);
router.post('/:id/bookmark', protect, toggleBookmark);

// Emergency maintenance / external cron webhook endpoint (Guarded in controller against student access)
router.post('/refresh', optionalAuth, refreshInternships);

export default router;
