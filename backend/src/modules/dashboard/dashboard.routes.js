import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { getHomeSummaryHandler, getManagementSummaryHandler } from './dashboard.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/home', getHomeSummaryHandler);
router.get('/management', getManagementSummaryHandler);

export default router;
