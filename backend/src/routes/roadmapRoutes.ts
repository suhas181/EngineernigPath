import { Router } from 'express';
import { getRoadmap, generateRoadmap, toggleRoadmapItem, submitWeeklyReview } from '../controllers/roadmapController';
import { protect } from '../middlewares/auth';

const router = Router();

// Apply auth protection middleware to all roadmap endpoints
router.use(protect);

router.get('/', getRoadmap);
router.post('/generate', generateRoadmap);
router.patch('/toggle', toggleRoadmapItem);
router.post('/weekly-review', submitWeeklyReview);

export default router;
