import { prisma } from '../../config/prisma.js';
import { createCrudRouter } from '../../utils/crudFactory.js';
import { createBrandSchema, updateBrandSchema } from './brand.schema.js';

const router = createCrudRouter({
  model: prisma.brand,
  createSchema: createBrandSchema,
  updateSchema: updateBrandSchema,
  searchFields: ['code', 'name'],
  codePrefix: 'BR',
});

export default router;
