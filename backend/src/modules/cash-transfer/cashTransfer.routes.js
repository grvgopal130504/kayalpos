import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createCashTransferSchema, cashTransferQuerySchema } from './cashTransfer.schema.js';
import { createCashTransfer, getCashTransferReport } from './cashTransfer.service.js';

const router = Router();
router.use(requireAuth);

// Feeds the Cashier Panel's Cash Transfer report — stat tiles, Transfer
// Summary / Transfer Summary (By Purpose) cards, the purpose donut, and
// the paginated Recent Cash Transfer Transactions table. Scoped to the
// cashier's own outlet (from their JWT) so one cashier never sees another
// outlet's cash drawer. See cashTransfer.service.js's getCashTransferReport
// for exactly which figures are all-time vs. scoped to the `date` query param.
router.get('/summary', validateRequest(cashTransferQuerySchema, 'query'), async (req, res, next) => {
  try {
    const report = await getCashTransferReport(req.user.tenantId, req.user.outletId, req.query);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

// Records a cash transfer out of the drawer to a named destination.
// outletId/cashierId/cashierName come from the cashier's own JWT
// (req.user), never from the request body — see cashTransfer.service.js's
// createCashTransfer for the "must have an open shift" and "can't exceed
// available cash" validations, both re-enforced server-side.
router.post('/', validateRequest(createCashTransferSchema), async (req, res, next) => {
  try {
    const transfer = await createCashTransfer(req.user.tenantId, req.user.outletId, req.body, req.user);
    res.status(201).json({ success: true, data: transfer });
  } catch (err) {
    next(err);
  }
});

export default router;
