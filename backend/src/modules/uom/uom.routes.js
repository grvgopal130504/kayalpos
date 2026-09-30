import { prisma } from '../../config/prisma.js';
import { createCrudRouter } from '../../utils/crudFactory.js';
import { createUomSchema, updateUomSchema } from './uom.schema.js';

// No `codePrefix` here — unlike Brand/UomGroup, a UOM's `code` is
// user-entered (KG, PC, LTR, ...) and validated as required in
// createUomSchema.js, so the CRUD factory's auto-generation is skipped and
// the client-supplied code is used as-is (see crudFactory.js's
// `if (codePrefix && !data[codeField])` guard).
const router = createCrudRouter({
  model: prisma.uom,
  createSchema: createUomSchema,
  updateSchema: updateUomSchema,
  searchFields: ['code', 'name'],
  listSelect: {
    id: true,
    code: true,
    name: true,
    baseUom: true,
    conversionFactor: true,
    status: true,
    createdAt: true,
    group: { select: { id: true, name: true } },
  },
  detailInclude: {
    group: { select: { id: true, name: true } },
  },
});

export default router;
