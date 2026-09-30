import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const CODE_PREFIX = 'LP';
const CODE_LENGTH = 4;

async function nextProgramCode(tenantId) {
  const count = await prisma.loyaltyProgram.count({ where: { tenantId } });
  return `${CODE_PREFIX}-${String(count + 1).padStart(CODE_LENGTH, '0')}`;
}

export async function nextCodePreview(tenantId) {
  return nextProgramCode(tenantId);
}

export async function listLoyaltyPrograms(tenantId, { status, search } = {}) {
  const where = { tenantId };
  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: 'insensitive' } },
      { code: { contains: String(search), mode: 'insensitive' } },
    ];
  }
  // Unlike Promotion/GiftVoucher, `status` is a real stored column here (a
  // loyalty program has no validity window of its own to compute it from —
  // see the schema.prisma doc comment), so it can be filtered directly in
  // the query instead of after a live-status computation.
  if (status && status !== 'all' && status !== 'All') {
    where.status = String(status).toLowerCase() === 'active' ? 'Active' : 'Inactive';
  }

  return prisma.loyaltyProgram.findMany({ where, orderBy: { createdAt: 'desc' }, take: 1000 });
}

export async function getLoyaltyProgram(tenantId, id) {
  const row = await prisma.loyaltyProgram.findFirst({ where: { id, tenantId } });
  if (!row) throw new ApiError(404, 'Loyalty program not found');
  return row;
}

// Maps the wire-facing field name (`programName`, kept domain-specific like
// Promotion's `promotionName`) onto the Prisma model's actual column
// (`name`) — every other field name already matches 1:1.
function toRowData(data) {
  const { programName, ...rest } = data;
  return { ...rest, name: programName };
}

export async function createLoyaltyProgram(tenantId, data) {
  const code = data.code || await nextProgramCode(tenantId);
  try {
    return await prisma.loyaltyProgram.create({ data: { ...toRowData(data), code, tenantId } });
  } catch (err) {
    throw prismaKnownError(err);
  }
}

export async function updateLoyaltyProgram(tenantId, id, data) {
  const existing = await prisma.loyaltyProgram.findFirst({ where: { id, tenantId } });
  if (!existing) throw new ApiError(404, 'Loyalty program not found');

  try {
    // The code, once assigned, is never rewritten by an edit — only the
    // rest of the program's fields are updatable.
    const { code, ...rest } = toRowData(data);
    return await prisma.loyaltyProgram.update({ where: { id }, data: rest });
  } catch (err) {
    throw prismaKnownError(err);
  }
}

export async function deleteLoyaltyProgram(tenantId, id) {
  const existing = await prisma.loyaltyProgram.findFirst({ where: { id, tenantId } });
  if (!existing) throw new ApiError(404, 'Loyalty program not found');
  await prisma.loyaltyProgram.delete({ where: { id } });
  return { id };
}

function prismaKnownError(err) {
  if (err?.code === 'P2002') {
    return new ApiError(409, 'A loyalty program with that code already exists', err.meta);
  }
  return err;
}
