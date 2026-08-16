import { Router } from 'express';
import {
  getResources,
  toggleBookmark,
  toggleComplete,
  getAIRecommendations,
} from '../controllers/resourceController';
import { protect, optionalAuth } from '../middlewares/auth';

const router = Router();

router.get('/', optionalAuth, getResources);
router.get('/recommendations', optionalAuth, getAIRecommendations);
router.patch('/:id/bookmark', protect, toggleBookmark);
router.patch('/:id/toggle-complete', protect, toggleComplete);

export default router;
