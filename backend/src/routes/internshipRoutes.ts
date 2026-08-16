import { Router } from 'express';
import {
  getInternships,
  getInternshipById,
  refreshInternships,
  toggleBookmark,
} from '../controllers/internshipController';
import { protect, optionalAuth } from '../middlewares/auth';

const router = Router();

router.get('/', optionalAuth, getInternships);
router.post('/refresh', optionalAuth, refreshInternships);
router.get('/:id', optionalAuth, getInternshipById);
router.post('/:id/bookmark', protect, toggleBookmark);

export default router;
