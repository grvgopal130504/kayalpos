import { Router } from 'express';
import { prisma } from '../../config/prisma.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createCrudRouter } from '../../utils/crudFactory.js';
import {
  createOutletSchema, updateOutletSchema, outletContactSchema, updateOutletContactSchema,
} from './outlet.schema.js';
import { addOutletContact, updateOutletContact, deleteOutletContact } from './outlet.service.js';

const router = Router();

// Public on purpose: the login screen's "Select Outlet" dropdown has to be
// populated BEFORE the user is authenticated (there's no token yet to scope
// a tenant by). It only ever returns id/name for active outlets — never
// anything sensitive — so this is safe to leave unauthenticated.
router.get('/public', async (req, res, next) => {
  try {
    const outlets = await prisma.outlet.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: outlets });
  } catch (err) {
    next(err);
  }
});

// Contact Person sub-resource for the Outlet Details tab — same shape as
// Company's own contacts (see company.routes.js), just scoped by
// tenantId + outletId instead of tenantId alone since Outlet isn't a
// singleton. Defined directly on this router (outside the createCrudRouter
// sub-router below, which only applies requireAuth to itself), so each
// needs its own requireAuth.
router.post('/:outletId/contacts', requireAuth, validateRequest(outletContactSchema), async (req, res, next) => {
  try {
    const contact = await addOutletContact(req.user.tenantId, req.params.outletId, req.body);
    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
});

router.put('/:outletId/contacts/:contactId', requireAuth, validateRequest(updateOutletContactSchema), async (req, res, next) => {
  try {
    const contact = await updateOutletContact(req.user.tenantId, req.params.outletId, req.params.contactId, req.body);
    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
});

router.delete('/:outletId/contacts/:contactId', requireAuth, async (req, res, next) => {
  try {
    const result = await deleteOutletContact(req.user.tenantId, req.params.outletId, req.params.contactId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Everything else (list/get/create/update/delete) is the normal
// authenticated, tenant-scoped CRUD used for managing outlets from the
// Masters > Outlet List page. `detailInclude` pulls the Contact Person rows
// into the single-outlet GET /:id response the detail/edit page reads —
// the list itself doesn't need them.
router.use(
  createCrudRouter({
    model: prisma.outlet,
    createSchema: createOutletSchema,
    updateSchema: updateOutletSchema,
    searchFields: ['code', 'name'],
    codePrefix: 'OUT',
    detailInclude: { contacts: { orderBy: { createdAt: 'asc' } } },
  }),
);

export default router;
