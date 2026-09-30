import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { getCashierPanelSummary } from './cashierPanel.service.js';

const router = Router();
router.use(requireAuth);

// Feeds the Cashier Panel landing page — the top stat strip, Current
// Shift Details, Payment Summary (Today), Cash Summary (Today), Recent
// Transactions, and Alerts. Read only, no query params: this dashboard
// always reflects "right now" (the outlet's currently OPEN shift, if any,
// and today's real Sale/SalesReturn/CashWithdrawal/CashDeposit/
// CashTransfer rows) — see cashierPanel.service.js's
// getCashierPanelSummary.
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await getCashierPanelSummary(req.user.tenantId, req.user.outletId);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

export default router;
