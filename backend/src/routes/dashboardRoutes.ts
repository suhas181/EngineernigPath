import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { protect } from '../middlewares/auth';

const router = Router();

router.get('/', protect, getDashboardData);
router.get('/summary', protect, getDashboardData);

export default router;
