import { Router } from 'express';
import { getRoadmap, generateRoadmap, toggleRoadmapItem, submitWeeklyReview, selectActiveRoadmap, getLearningCurriculum } from '../controllers/roadmapController';
import { protect, optionalAuth } from '../middlewares/auth';

const router = Router();

router.get('/curriculum', optionalAuth, getLearningCurriculum);
router.get('/', protect, getRoadmap);
router.post('/generate', protect, generateRoadmap);
router.patch('/toggle', protect, toggleRoadmapItem);
router.post('/weekly-review', protect, submitWeeklyReview);
router.post('/select-active', protect, selectActiveRoadmap);

export default router;

