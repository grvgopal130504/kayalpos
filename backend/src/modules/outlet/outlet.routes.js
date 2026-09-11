import { Router } from 'express';
import { prisma } from '../../config/prisma.js';
import { createCrudRouter } from '../../utils/crudFactory.js';
import { createOutletSchema, updateOutletSchema } from './outlet.schema.js';

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

// Everything else (list/get/create/update/delete) is the normal
// authenticated, tenant-scoped CRUD used for managing outlets from the
// Masters > Outlet screen.
router.use(
  createCrudRouter({
    model: prisma.outlet,
    createSchema: createOutletSchema,
    updateSchema: updateOutletSchema,
    searchFields: ['code', 'name'],
    codePrefix: 'OUT',
  }),
);

export default router;
