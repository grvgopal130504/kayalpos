import { prisma } from '../../config/prisma.js';
import { createCrudRouter } from '../../utils/crudFactory.js';
import { createHsnSacSchema, updateHsnSacSchema } from './hsnSac.schema.js';

// No `codePrefix` here — like UOM, an HSN/SAC code is user-entered (a real
// externally-defined classification code), so the CRUD factory's
// auto-generation is skipped and the client-supplied code is used as-is.
const router = createCrudRouter({
  model: prisma.hsnSac,
  createSchema: createHsnSacSchema,
  updateSchema: updateHsnSacSchema,
  searchFields: ['code', 'description'],
});

export default router;
