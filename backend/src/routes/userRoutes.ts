import { Router } from 'express';
import { getProfile, updateProfile, uploadAvatar } from '../controllers/userController';
import { protect } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// All user routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.post('/profile/image', upload.single('image'), uploadAvatar);

export default router;
