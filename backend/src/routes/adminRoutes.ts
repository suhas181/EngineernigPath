import { Router } from 'express';
import {
  getAllUsers,
  createUserByAdmin,
  getAdminStats,
  getAdminNotifications,
  broadcastNotification,
  deleteAdminNotification,
} from '../controllers/adminController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Protect all admin routes: require valid JWT & admin role
router.use(protect);
router.use(restrictTo('admin'));

router.get('/users', getAllUsers);
router.post('/users', createUserByAdmin);
router.get('/stats', getAdminStats);

// Admin Notification Broadcasting
router.get('/notifications', getAdminNotifications);
router.post('/notifications', broadcastNotification);
router.delete('/notifications/:id', deleteAdminNotification);

export default router;
