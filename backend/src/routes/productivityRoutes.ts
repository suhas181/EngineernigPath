import { Router } from 'express';
import {
  getUserStats,
  getTasks,
  createTask,
  toggleTaskComplete,
  getPlannerEvents,
  createPlannerEvent,
  togglePlannerEventComplete,
  deletePlannerEvent,
  getProductivityAnalytics,
} from '../controllers/productivityController';
import { protect } from '../middlewares/auth';

const router = Router();

// Wrap all endpoints with JWT Auth Protection
router.use(protect);

router.get('/stats', getUserStats);
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.patch('/tasks/:id/toggle', toggleTaskComplete);
router.get('/planner', getPlannerEvents);
router.post('/planner', createPlannerEvent);
router.patch('/planner/:id/toggle', togglePlannerEventComplete);
router.delete('/planner/:id', deletePlannerEvent);
router.get('/analytics', getProductivityAnalytics);

export default router;
