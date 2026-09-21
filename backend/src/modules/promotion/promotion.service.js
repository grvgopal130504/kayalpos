import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const CODE_PREFIX = 'PROMO';
const CODE_LENGTH = 4;

/**
 * Status is never stored — it's derived from startDate/endDate/noExpiry
 * against "now" every time a row is read, so a promotion that quietly
 * crosses its start or end date shows the right status immediately instead
 * of waiting on some background job to update a column. Mirrors the
 * frontend's own computePromotionStatus() in createPromotionSchema.js
 * exactly, so a promotion never appears "active" on one side and
 * "expired" on the other.
 */
export function computeStatus({ startDate, endDate, noExpiry }) {
  const now = new Date();
  const start = new Date(startDate);
  if (start > now) return 'upcoming';
  if (!noExpiry && endDate) {
    const end = new Date(endDate);
    if (end < now) return 'expired';
  }
  return 'active';
}

function toApiShape(row) {
  return { ...row, status: computeStatus(row) };
}

async function nextPromotionCode(tenantId) {
  const count = await prisma.promotion.count({ where: { tenantId } });
  return `${CODE_PREFIX}-${String(count + 1).padStart(CODE_LENGTH, '0')}`;
}

export async function nextCodePreview(tenantId) {
  return nextPromotionCode(tenantId);
}

export async function listPromotions(tenantId, { status, search } = {}) {
  const where = { tenantId };
  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: 'insensitive' } },
      { code: { contains: String(search), mode: 'insensitive' } },
    ];
  }

  const rows = await prisma.promotion.findMany({ where, orderBy: { createdAt: 'desc' }, take: 1000 });
  const shaped = rows.map(toApiShape);

  // Status filtering happens after the live computation above (not in the
  // Prisma `where`), since status isn't a real column — see computeStatus().
  if (status && status !== 'all' && status !== 'All') {
    return shaped.filter((row) => row.status === String(status).toLowerCase());
  }
  return shaped;
}

export async function getPromotion(tenantId, id) {
  const row = await prisma.promotion.findFirst({ where: { id, tenantId } });
  if (!row) throw new ApiError(404, 'Promotion not found');
  return toApiShape(row);
}

// Maps the wire-facing field name (`promotionName`, kept domain-specific on
// the API instead of the generic `name`) onto the Prisma model's actual
// column (`name`) — every other field name already matches 1:1. Without
// this, prisma.promotion.create/update would receive an unknown
// `promotionName` argument and throw instead of ever writing a row.
function toRowData(data) {
  const { promotionName, ...rest } = data;
  return { ...rest, name: promotionName };
}

export async function createPromotion(tenantId, data) {
  const code = data.code || await nextPromotionCode(tenantId);
  try {
    const row = await prisma.promotion.create({ data: { ...toRowData(data), code, tenantId } });
    return toApiShape(row);
  } catch (err) {
    throw prismaKnownError(err);
  }
}

export async function updatePromotion(tenantId, id, data) {
  const existing = await prisma.promotion.findFirst({ where: { id, tenantId } });
  if (!existing) throw new ApiError(404, 'Promotion not found');

  try {
    // The code, once assigned, is never rewritten by an edit — only the
    // rest of the promotion's fields are updatable.
    const { code, ...rest } = toRowData(data);
    const row = await prisma.promotion.update({ where: { id }, data: rest });
    return toApiShape(row);
  } catch (err) {
    throw prismaKnownError(err);
  }
}

export async function deletePromotion(tenantId, id) {
  const existing = await prisma.promotion.findFirst({ where: { id, tenantId } });
  if (!existing) throw new ApiError(404, 'Promotion not found');
  await prisma.promotion.delete({ where: { id } });
  return { id };
}

function prismaKnownError(err) {
  if (err?.code === 'P2002') {
    return new ApiError(409, 'A promotion with that code already exists', err.meta);
  }
  return err;
}
