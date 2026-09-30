import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { homeDashboardQuerySchema } from './dashboard.schema.js';
import { getHomeSummaryHandler, getManagementSummaryHandler } from './dashboard.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/home', validateRequest(homeDashboardQuerySchema, 'query'), getHomeSummaryHandler);
router.get('/management', getManagementSummaryHandler);

export default router;
