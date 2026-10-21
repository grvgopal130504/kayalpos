import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { holdBillSchema } from './heldBill.schema.js';
import {
  listHeldBills, createHeldBill, updateHeldBill, resumeHeldBill, cancelHeldBill,
} from './heldBill.service.js';

const router = Router();
router.use(requireAuth);

// Bills the cashier can resume — scoped server-side to their own outlet
// (from the JWT) and, for non-admin roles, to their own bills.
router.get('/', async (req, res, next) => {
  try {
    res.json({ success: true, data: await listHeldBills(req.user) });
  } catch (err) {
    next(err);
  }
});

// Park the current cart. Not a sale: no payment, invoice or stock movement.
router.post('/', validateRequest(holdBillSchema), async (req, res, next) => {
  try {
    res.status(201).json({ success: true, data: await createHeldBill(req.user, req.body) });
  } catch (err) {
    next(err);
  }
});

// Re-park a resumed bill in place (replaces its lines — never a duplicate).
router.put('/:id', validateRequest(holdBillSchema), async (req, res, next) => {
  try {
    res.json({ success: true, data: await updateHeldBill(req.user, req.params.id, req.body) });
  } catch (err) {
    next(err);
  }
});

// Claim a held bill and return its full contents. Atomic: of two
// simultaneous resumes only one succeeds (409 for the other).
router.post('/:id/resume', async (req, res, next) => {
  try {
    res.json({ success: true, data: await resumeHeldBill(req.user, req.params.id) });
  } catch (err) {
    next(err);
  }
});

// Discard a held bill.
router.delete('/:id', async (req, res, next) => {
  try {
    res.json({ success: true, data: await cancelHeldBill(req.user, req.params.id) });
  } catch (err) {
    next(err);
  }
});

export default router;
