import { Router } from 'express';
import { getProfile, updateProfile, uploadAvatar, refreshLeetCodeStatsController } from '../controllers/userController';
import { optionalAuth } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// Allow optional authentication for guest exploration & profile settings
router.use(optionalAuth);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.post('/profile/image', upload.single('image'), uploadAvatar);
router.post('/leetcode/refresh', refreshLeetCodeStatsController);

export default router;
