import { Router } from 'express';
import {
  getResources,
  toggleBookmark,
  toggleComplete,
  getAIRecommendations,
} from '../controllers/resourceController';
import { protect } from '../middlewares/auth';

const router = Router();

// Apply auth middleware to protect all resource endpoints
router.use(protect);

router.get('/', getResources);
router.get('/recommendations', getAIRecommendations);
router.patch('/:id/bookmark', toggleBookmark);
router.patch('/:id/toggle-complete', toggleComplete);

export default router;
