import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { shortageExcessQuerySchema } from './shortageExcess.schema.js';
import { getShortageExcessReport } from './shortageExcess.service.js';

const router = Router();
router.use(requireAuth);

// Feeds the Cashier Panel's Shortage / Excess report — stat tiles,
// Shortage / Excess Summary, the by-type donut (with its Net Amount
// legend), and the paginated Recent Shortage / Excess Transactions table.
// Read only: a shortage/excess entry is just the non-zero-variance
// subset of a closed shift's real reconciliation — see modules/shift-
// session's POST /shift-sessions/close for where the variance is
// actually computed and stored — this route only re-reads, filters, and
// reshapes that same data (see shortageExcess.service.js's
// getShortageExcessReport).
router.get('/summary', validateRequest(shortageExcessQuerySchema, 'query'), async (req, res, next) => {
  try {
    const report = await getShortageExcessReport(req.user.tenantId, req.user.outletId, req.query);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

export default router;
