import { Router } from 'express';
import { getRoadmap, generateRoadmap, toggleRoadmapItem, submitWeeklyReview, selectActiveRoadmap } from '../controllers/roadmapController';
import { protect } from '../middlewares/auth';

const router = Router();

// Apply auth protection middleware to all roadmap endpoints
router.use(protect);

router.get('/', getRoadmap);
router.post('/generate', generateRoadmap);
router.patch('/toggle', toggleRoadmapItem);
router.post('/weekly-review', submitWeeklyReview);
router.post('/select-active', selectActiveRoadmap);

export default router;
