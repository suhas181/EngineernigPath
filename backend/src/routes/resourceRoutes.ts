import { Router } from 'express';
import {
  getResources,
  toggleBookmark,
  toggleComplete,
  getAIRecommendations,
  recordRecentResource,
  getRecentResources,
} from '../controllers/resourceController';
import { protect, optionalAuth } from '../middlewares/auth';

const router = Router();

// Public / General Resource Exploration
router.get('/', optionalAuth, getResources);
router.get('/recommendations', optionalAuth, getAIRecommendations);

// Recently Opened Resources (Scoped strictly to authenticated user; guest fallback supported in controller)
router.get('/recent', optionalAuth, getRecentResources);
router.post('/recent', protect, recordRecentResource);

// Bookmark and completion actions
router.patch('/:id/bookmark', protect, toggleBookmark);
router.patch('/:id/toggle-complete', protect, toggleComplete);

export default router;
