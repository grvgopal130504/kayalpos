import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createExpenseSchema, expenseQuerySchema } from './expense.schema.js';
import { createExpense, getExpenseReport } from './expense.service.js';

const router = Router();
router.use(requireAuth);

// Feeds the Expenses Book page — stat tiles, Expense Summary, the
// Expenses by Category / Expenses by Payment Mode donuts, and the
// paginated Recent Expense Transactions table. Scoped to the cashier's
// own outlet (from their JWT). See expense.service.js's getExpenseReport
// for exactly which figures are all-time vs. scoped to the `date` query
// param.
router.get('/summary', validateRequest(expenseQuerySchema, 'query'), async (req, res, next) => {
  try {
    const report = await getExpenseReport(req.user.tenantId, req.user.outletId, req.query);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

// Logs a new expense entry. outletId/cashierId/cashierName come from the
// cashier's own JWT (req.user), never from the request body — see
// expense.service.js's createExpense. Unlike the cash-drawer movements,
// this has no "must have an open shift" guard.
router.post('/', validateRequest(createExpenseSchema), async (req, res, next) => {
  try {
    const expense = await createExpense(req.user.tenantId, req.user.outletId, req.body, req.user);
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
});

export default router;
