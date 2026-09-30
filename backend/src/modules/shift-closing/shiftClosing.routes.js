import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { shiftClosingQuerySchema } from './shiftClosing.schema.js';
import { getShiftClosingReport } from './shiftClosing.service.js';

const router = Router();
router.use(requireAuth);

// Feeds the Cashier Panel's Shift Closing report — stat tiles, Closing
// Summary / Closing Summary (By Shift) cards, the by-shift donut, and the
// paginated Recent Shift Closing Transactions table. Read only: a shift is
// closed by POST /shift-sessions/close (see modules/shift-session), not
// here — see shiftClosing.service.js's getShiftClosingReport for exactly
// which figures are all-time vs. scoped to the `date` query param.
router.get('/summary', validateRequest(shiftClosingQuerySchema, 'query'), async (req, res, next) => {
  try {
    const report = await getShiftClosingReport(req.user.tenantId, req.user.outletId, req.query);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

export default router;
