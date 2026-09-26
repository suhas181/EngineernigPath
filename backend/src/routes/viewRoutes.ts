import { Router } from 'express';
import { trackView, getViewCounts } from '../controllers/viewController';

const router = Router();

// POST /api/views/track -> record a view on a resource or roadmap
router.post('/track', trackView);

// GET /api/views?entityType=resource|roadmap -> fetch view counts
router.get('/', getViewCounts);

export default router;
