import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { reportParamsSchema, reportQuerySchema } from './salesReports.schema.js';
import { getSalesReport, getSalesReportFilters } from './salesReports.service.js';

const router = Router();
router.use(requireAuth);

// Dropdown data (outlets + cashiers) for the Sales Reports filter bar.
router.get('/filters', async (req, res, next) => {
  try {
    res.json({ success: true, data: await getSalesReportFilters(req.user.tenantId) });
  } catch (err) { next(err); }
});

// One endpoint for all eight reports: daily | monthly | outlet | cashier |
// item | category | brand | customer. Read-only; built from real Linesales /
// LinesaleItemDetails / SalesReturn rows (see salesReports.service.js).
router.get(
  '/:report',
  validateRequest(reportParamsSchema, 'params'),
  validateRequest(reportQuerySchema, 'query'),
  async (req, res, next) => {
    try {
      const data = await getSalesReport(req.user.tenantId, req.params.report, req.query);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
);

export default router;
