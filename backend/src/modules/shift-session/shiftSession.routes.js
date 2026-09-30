import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createShiftOpeningSchema, closeShiftSchema } from './shiftSession.schema.js';
import { getShiftStatus, getShiftSession, openShift, closeShift } from './shiftSession.service.js';

const router = Router();
router.use(requireAuth);

// Status strip for the Shift Opening screen: is a shift already open for
// this cashier's outlet, what was the last closed shift, what's the next
// shift number, and what's the real previous closing cash to carry forward
// — everything the page needs to render before the cashier types anything.
router.get('/status', async (req, res, next) => {
  try {
    const status = await getShiftStatus(req.user.tenantId, req.user.outletId);
    res.json({ success: true, data: status });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await getShiftSession(req.user.tenantId, req.user.outletId, req.params.id);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

// outletId/cashierId/cashierName come from req.user (the verified JWT), not
// the body — see shiftSession.service.js's openShift().
router.post('/', validateRequest(createShiftOpeningSchema), async (req, res, next) => {
  try {
    const row = await openShift(req.user.tenantId, req.user.outletId, req.body, req.user);
    res.status(201).json({ success: true, data: row });
  } catch (err) { next(err); }
});

// Closes the outlet's currently OPEN shift — see shiftSession.service.js's
// closeShift(). No :id in the path: same "act on req.user's outlet, never
// a client-supplied id" rule the status/open routes already follow.
router.post('/close', validateRequest(closeShiftSchema), async (req, res, next) => {
  try {
    const row = await closeShift(req.user.tenantId, req.user.outletId, req.body, req.user);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

export default router;
