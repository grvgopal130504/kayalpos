import { prisma } from '../../config/prisma.js';
import { createCrudRouter } from '../../utils/crudFactory.js';
import { createEmployeeSchema, updateEmployeeSchema } from './employee.schema.js';

// Masters > Employee. Plain crudFactory-based module (unlike Selling
// Price/Price List/Batch-Serial) — the only extra behavior it needs is
// folding in the related Outlet's name for the "Location" column, and
// crudFactory's `listSelect`/`detailInclude` already cover that (same
// pattern as Warehouse's own router), so a hand-written service isn't
// needed here.
const router = createCrudRouter({
  model: prisma.employee,
  createSchema: createEmployeeSchema,
  updateSchema: updateEmployeeSchema,
  searchFields: ['code', 'name', 'phone', 'email'],
  codePrefix: 'EMP',
  listSelect: {
    id: true,
    code: true,
    name: true,
    type: true,
    phone: true,
    email: true,
    loginUsername: true,
    joiningDate: true,
    status: true,
    createdAt: true,
    outlet: { select: { id: true, name: true } },
  },
  detailInclude: {
    outlet: { select: { id: true, name: true } },
  },
});

export default router;
