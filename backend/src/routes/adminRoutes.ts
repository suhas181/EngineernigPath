import { Router } from 'express';
import { getAllUsers, createUserByAdmin, getAdminStats } from '../controllers/adminController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Protect all admin routes: require valid JWT & admin role
router.use(protect);
router.use(restrictTo('admin'));

router.get('/users', getAllUsers);
router.post('/users', createUserByAdmin);
router.get('/stats', getAdminStats);

export default router;
