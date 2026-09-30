import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createCashWithdrawalSchema, cashWithdrawalQuerySchema } from './cashWithdrawal.schema.js';
import { createCashWithdrawal, getCashWithdrawalReport } from './cashWithdrawal.service.js';

const router = Router();
router.use(requireAuth);

// Feeds the Cashier Panel's Cash Withdrawal report — stat tiles, Withdrawal
// Summary / Withdrawal Summary (By Purpose) cards, the purpose donut, and
// the paginated Recent Cash Withdrawal Transactions table. Scoped to the
// cashier's own outlet (from their JWT) so one cashier never sees another
// outlet's cash drawer. See cashWithdrawal.service.js's
// getCashWithdrawalReport for exactly which figures are all-time vs. scoped
// to the `date` query param.
router.get('/summary', validateRequest(cashWithdrawalQuerySchema, 'query'), async (req, res, next) => {
  try {
    const report = await getCashWithdrawalReport(req.user.tenantId, req.user.outletId, req.query);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

// Records a cash withdrawal from the drawer. outletId/cashierId/cashierName
// come from the cashier's own JWT (req.user), never from the request body
// — see cashWithdrawal.service.js's createCashWithdrawal for the "must have
// an open shift" and "can't exceed available cash" validations, both
// re-enforced server-side.
router.post('/', validateRequest(createCashWithdrawalSchema), async (req, res, next) => {
  try {
    const withdrawal = await createCashWithdrawal(req.user.tenantId, req.user.outletId, req.body, req.user);
    res.status(201).json({ success: true, data: withdrawal });
  } catch (err) {
    next(err);
  }
});

export default router;
