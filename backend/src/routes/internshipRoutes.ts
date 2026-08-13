import { Router } from 'express';
import {
  getInternships,
  getInternshipById,
  refreshInternships,
  toggleBookmark,
} from '../controllers/internshipController';
import { protect } from '../middlewares/auth';

const router = Router();

// Apply auth middleware to protect all internship endpoints
router.use(protect);

router.get('/', getInternships);
router.post('/refresh', refreshInternships);
router.get('/:id', getInternshipById);
router.post('/:id/bookmark', toggleBookmark);

export default router;
