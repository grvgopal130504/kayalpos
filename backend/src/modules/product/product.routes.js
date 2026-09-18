import { prisma } from '../../config/prisma.js';
import { createCrudRouter } from '../../utils/crudFactory.js';
import { createProductSchema, updateProductSchema } from './product.schema.js';

const router = createCrudRouter({
  model: prisma.product,
  createSchema: createProductSchema,
  updateSchema: updateProductSchema,
  searchFields: ['code', 'name'],
  codePrefix: 'PROD',
  codeLength: 4,
});

export default router;
