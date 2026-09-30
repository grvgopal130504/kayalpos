import { prisma } from '../../config/prisma.js';
import { createCrudRouter } from '../../utils/crudFactory.js';
import { createUomGroupSchema, updateUomGroupSchema } from './uomGroup.schema.js';

const router = createCrudRouter({
  model: prisma.uomGroup,
  createSchema: createUomGroupSchema,
  updateSchema: updateUomGroupSchema,
  searchFields: ['code', 'name'],
  codePrefix: 'GRP',
});

export default router;
