import { Router } from 'express';
import { prisma } from '../../config/prisma.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createCrudRouter } from '../../utils/crudFactory.js';
import {
  createWarehouseSchema, updateWarehouseSchema, warehouseContactSchema, updateWarehouseContactSchema,
} from './warehouse.schema.js';
import { addWarehouseContact, updateWarehouseContact, deleteWarehouseContact } from './warehouse.service.js';

const router = Router();

// Contact Person sub-resource for the Warehouse Details tab — same shape as
// Outlet/Company's own contacts. Defined directly on this router (outside
// the createCrudRouter sub-router below, which only applies requireAuth to
// itself), so each needs its own requireAuth.
router.post('/:warehouseId/contacts', requireAuth, validateRequest(warehouseContactSchema), async (req, res, next) => {
  try {
    const contact = await addWarehouseContact(req.user.tenantId, req.params.warehouseId, req.body);
    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
});

router.put('/:warehouseId/contacts/:contactId', requireAuth, validateRequest(updateWarehouseContactSchema), async (req, res, next) => {
  try {
    const contact = await updateWarehouseContact(req.user.tenantId, req.params.warehouseId, req.params.contactId, req.body);
    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
});

router.delete('/:warehouseId/contacts/:contactId', requireAuth, async (req, res, next) => {
  try {
    const result = await deleteWarehouseContact(req.user.tenantId, req.params.warehouseId, req.params.contactId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Everything else (list/get/create/update/delete) is the normal
// authenticated, tenant-scoped CRUD used for managing warehouses from the
// Masters > Warehouse List page. `listSelect` folds in the parent Outlet's
// name (via a nested Prisma `select`) so the list page can show an "Outlet"
// column without a second round trip; `detailInclude` pulls both the
// Contact Person rows and the full Outlet row into the single-warehouse
// GET /:id response the detail/edit page reads.
router.use(
  createCrudRouter({
    model: prisma.warehouse,
    createSchema: createWarehouseSchema,
    updateSchema: updateWarehouseSchema,
    searchFields: ['code', 'name'],
    codePrefix: 'WH',
    listSelect: {
      id: true,
      code: true,
      name: true,
      isActive: true,
      warehouseType: true,
      location: true,
      state: true,
      country: true,
      capacityUnit: true,
      totalCapacity: true,
      usedCapacity: true,
      createdAt: true,
      outlet: { select: { id: true, name: true } },
    },
    detailInclude: {
      contacts: { orderBy: { createdAt: 'asc' } },
      outlet: { select: { id: true, name: true } },
    },
  }),
);

export default router;
