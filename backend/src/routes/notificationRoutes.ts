import { Router } from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
} from '../controllers/notificationController';
import { protect } from '../middlewares/auth';

const router = Router();

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllNotificationsRead);
router.put('/:id/read', protect, markNotificationRead);
router.post('/', protect, createNotification);

export default router;
