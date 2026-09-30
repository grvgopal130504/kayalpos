import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { cashReconciliationQuerySchema } from './cashReconciliation.schema.js';
import { getCashReconciliationReport } from './cashReconciliation.service.js';

const router = Router();
router.use(requireAuth);

// Feeds the Cashier Panel's Cash Reconciliation report — stat tiles,
// Reconciliation Summary, the Variance Summary (By Type) donut, and the
// paginated Recent Cash Reconciliation Transactions table. Read only: a
// reconciliation IS the closed-shift row itself — see modules/shift-
// session's POST /shift-sessions/close for where System Cash/Counted
// Cash/Variance are actually computed and stored — this route only
// re-reads and reshapes that same data (see cashReconciliation.
// service.js's getCashReconciliationReport).
router.get('/summary', validateRequest(cashReconciliationQuerySchema, 'query'), async (req, res, next) => {
  try {
    const report = await getCashReconciliationReport(req.user.tenantId, req.user.outletId, req.query);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

export default router;
