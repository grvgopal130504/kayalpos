import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createCashDepositSchema, cashDepositQuerySchema } from './cashDeposit.schema.js';
import { createCashDeposit, getCashDepositReport } from './cashDeposit.service.js';

const router = Router();
router.use(requireAuth);

// Feeds the Cashier Panel's Cash Deposit report — stat tiles, Deposit
// Summary / Deposit Summary (By Purpose) cards, the purpose donut, and the
// paginated Recent Cash Deposit Transactions table. Scoped to the cashier's
// own outlet (from their JWT) so one cashier never sees another outlet's
// cash drawer. See cashDeposit.service.js's getCashDepositReport for
// exactly which figures are all-time vs. scoped to the `date` query param.
router.get('/summary', validateRequest(cashDepositQuerySchema, 'query'), async (req, res, next) => {
  try {
    const report = await getCashDepositReport(req.user.tenantId, req.user.outletId, req.query);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

// Records a cash deposit out of the drawer. outletId/cashierId/cashierName
// come from the cashier's own JWT (req.user), never from the request body
// — see cashDeposit.service.js's createCashDeposit for the "must have an
// open shift" and "can't exceed available cash" validations, both
// re-enforced server-side.
router.post('/', validateRequest(createCashDepositSchema), async (req, res, next) => {
  try {
    const deposit = await createCashDeposit(req.user.tenantId, req.user.outletId, req.body, req.user);
    res.status(201).json({ success: true, data: deposit });
  } catch (err) {
    next(err);
  }
});

export default router;
