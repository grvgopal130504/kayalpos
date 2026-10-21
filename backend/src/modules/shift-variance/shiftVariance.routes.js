import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { shiftVarianceQuerySchema } from './shiftVariance.schema.js';
import { getShiftVarianceReport, getShiftVarianceTransactions, listVarianceFilterOptions } from './shiftVariance.service.js';

const router = Router();
router.use(requireAuth);

// Read-only: built from real ShiftSession / Sale / SalesReturn /
// CashWithdrawal / CashDeposit / CashTransfer rows. Nothing is written.
router.get('/', validateRequest(shiftVarianceQuerySchema, 'query'), async (req, res, next) => {
  try {
    res.json({ success: true, data: await getShiftVarianceReport(req.user, req.query) });
  } catch (err) {
    next(err);
  }
});

// Outlet + cashier dropdown options for the filter bar.
router.get('/filters', async (req, res, next) => {
  try {
    res.json({ success: true, data: await listVarianceFilterOptions(req.user) });
  } catch (err) {
    next(err);
  }
});

// Drill-down: every transaction behind one shift's figures.
router.get('/:shiftId/transactions', async (req, res, next) => {
  try {
    res.json({ success: true, data: await getShiftVarianceTransactions(req.user, req.params.shiftId) });
  } catch (err) {
    next(err);
  }
});

export default router;
