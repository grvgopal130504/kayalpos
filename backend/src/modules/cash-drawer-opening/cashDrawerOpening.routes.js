import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { cashDrawerOpeningQuerySchema } from './cashDrawerOpening.schema.js';
import { getCashDrawerOpeningReport } from './cashDrawerOpening.service.js';

const router = Router();
router.use(requireAuth);

// Feeds the Cashier Panel's Cash Drawer Opening report — stat tiles,
// Opening Summary / Opening Summary (By Time) cards, the by-time donut,
// and the paginated Recent Cash Drawer Opening Transactions table. Read
// only: a drawer opening is created by the Shift Opening screen (see
// modules/shift-session's POST /shift-sessions), not here — see
// cashDrawerOpening.service.js's getCashDrawerOpeningReport for exactly
// which figures are all-time vs. scoped to the `date` query param.
router.get('/summary', validateRequest(cashDrawerOpeningQuerySchema, 'query'), async (req, res, next) => {
  try {
    const report = await getCashDrawerOpeningReport(req.user.tenantId, req.user.outletId, req.query);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

export default router;
