import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const CODE_PREFIX = 'GV';
const CODE_LENGTH = 4;

/**
 * Status is never stored — derived live from startDate/endDate/noExpiry
 * against "now" (same rule as Promotion's computeStatus()), except a
 * manually-deactivated voucher (`isActive: false`) always reads "inactive"
 * regardless of what its dates say. Mirrors the frontend's own status
 * expectations in GiftVoucherTable/GiftVoucherDetailsCard exactly.
 */
export function computeStatus({ startDate, endDate, noExpiry, isActive }) {
  if (!isActive) return 'inactive';
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

async function nextVoucherCode(tenantId) {
  const count = await prisma.giftVoucher.count({ where: { tenantId } });
  return `${CODE_PREFIX}-${String(count + 1).padStart(CODE_LENGTH, '0')}`;
}

export async function nextCodePreview(tenantId) {
  return nextVoucherCode(tenantId);
}

export async function listGiftVouchers(tenantId, { status, search } = {}) {
  const where = { tenantId };
  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: 'insensitive' } },
      { code: { contains: String(search), mode: 'insensitive' } },
    ];
  }

  const rows = await prisma.giftVoucher.findMany({ where, orderBy: { createdAt: 'desc' }, take: 1000 });
  const shaped = rows.map(toApiShape);

  // Status filtering happens after the live computation above (not in the
  // Prisma `where`), since status isn't a real column — see computeStatus().
  if (status && status !== 'all' && status !== 'All') {
    return shaped.filter((row) => row.status === String(status).toLowerCase());
  }
  return shaped;
}

export async function getGiftVoucher(tenantId, id) {
  const row = await prisma.giftVoucher.findFirst({ where: { id, tenantId } });
  if (!row) throw new ApiError(404, 'Gift voucher not found');
  return toApiShape(row);
}

// Maps the wire-facing field name (`voucherName`, kept domain-specific like
// Promotion's `promotionName`) onto the Prisma model's actual column
// (`name`) — every other field name already matches 1:1.
function toRowData(data) {
  const { voucherName, ...rest } = data;
  return { ...rest, name: voucherName };
}

export async function createGiftVoucher(tenantId, data) {
  const code = data.code || await nextVoucherCode(tenantId);
  try {
    const row = await prisma.giftVoucher.create({ data: { ...toRowData(data), code, tenantId } });
    return toApiShape(row);
  } catch (err) {
    throw prismaKnownError(err);
  }
}

export async function updateGiftVoucher(tenantId, id, data) {
  const existing = await prisma.giftVoucher.findFirst({ where: { id, tenantId } });
  if (!existing) throw new ApiError(404, 'Gift voucher not found');

  try {
    // The code, once assigned, is never rewritten by an edit — only the
    // rest of the voucher's fields are updatable.
    const { code, ...rest } = toRowData(data);
    const row = await prisma.giftVoucher.update({ where: { id }, data: rest });
    return toApiShape(row);
  } catch (err) {
    throw prismaKnownError(err);
  }
}

export async function deleteGiftVoucher(tenantId, id) {
  const existing = await prisma.giftVoucher.findFirst({ where: { id, tenantId } });
  if (!existing) throw new ApiError(404, 'Gift voucher not found');
  await prisma.giftVoucher.delete({ where: { id } });
  return { id };
}

function prismaKnownError(err) {
  if (err?.code === 'P2002') {
    return new ApiError(409, 'A gift voucher with that code already exists', err.meta);
  }
  return err;
}
