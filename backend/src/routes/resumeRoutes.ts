import { Router } from 'express';
import {
  uploadResume,
  getResumes,
  getResume,
  matchJob,
  syncSkills,
} from '../controllers/resumeController';
import { optionalAuth } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// Allow optional authentication (supports both authenticated & guest exploration)
router.use(optionalAuth);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.post('/:id/match-job', matchJob);
router.post('/:id/sync-skills', syncSkills);

export default router;
