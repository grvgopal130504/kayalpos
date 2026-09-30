/**
 * Shared "real GiftVoucher row -> UI shape" mapping, used by GiftVoucherPage
 * (list + selected-row detail panel) and GiftVoucherViewPage (the standalone
 * view screen) so the two never drift into showing different labels for the
 * same record — same pattern as promotion/promotionDisplay.js.
 *
 * `redemptionsTillDate`/`valueRedeemed` are honestly derived from the real
 * `usageCount` column, which always reads 0 today because nothing in the
 * app applies a voucher at checkout yet (Line Sale has no "redeem voucher"
 * step). Once that wiring exists and increments usageCount, these figures
 * update automatically instead of needing another change here.
 */

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MAXIMUM_USAGE_LABELS = {
  'no-limit': 'No Limit',
  once: 'Single Use',
  limited: 'Limited Count',
};

const APPLICABLE_TO_LABELS = { all: 'All Items', specific: 'Specific Items', category: 'Category' };

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

/** "₹250.00" for a currency-valued voucher, "10%" for a percentage one. */
function formatValueDisplay(voucher) {
  const value = Number(voucher.voucherValue || 0);
  return voucher.voucherType === 'Percentage Discount' ? `${value}%` : `₹${value.toFixed(2)}`;
}

/** Builds the flat row shape GiftVoucherTable reads, from a real API record. */
export function toGiftVoucherRow(voucher) {
  return {
    id: voucher.id,
    code: voucher.code,
    name: voucher.name,
    type: voucher.voucherType,
    value: formatValueDisplay(voucher),
    validFrom: formatDate(voucher.startDate),
    validTill: voucher.noExpiry ? 'No Expiry' : formatDate(voucher.endDate),
    status: voucher.status,
    usage: voucher.usageCount || 0,
  };
}

/** Builds the rich detail shape GiftVoucherDetailsCard reads, from a real
 * API record. */
export function toGiftVoucherDetails(voucher) {
  const value = Number(voucher.voucherValue || 0);
  const isCurrency = voucher.voucherType !== 'Percentage Discount';
  const usageCount = voucher.usageCount || 0;
  return {
    id: voucher.id,
    code: voucher.code,
    name: voucher.name,
    status: voucher.status,
    type: voucher.voucherType,
    value: formatValueDisplay(voucher),
    description: voucher.description || '',
    validFrom: formatDate(voucher.startDate),
    validTill: voucher.noExpiry ? 'No Expiry' : formatDate(voucher.endDate),
    minimumBillAmount: `₹${Number(voucher.minimumBillAmount || 0).toFixed(2)}`,
    maximumUsage: MAXIMUM_USAGE_LABELS[voucher.maximumUsage] || 'No Limit',
    applicableTo: APPLICABLE_TO_LABELS[voucher.applicableTo] || 'All Items',
    usage: usageCount,
    redemptionsTillDate: usageCount,
    // Percentage vouchers have no fixed currency value to sum, so their
    // "value redeemed" is honestly 0 rather than a guessed amount.
    valueRedeemed: isCurrency ? value * usageCount : 0,
  };
}

/** Builds the six summary tiles GiftVoucherSummaryCards reads, entirely from
 * real voucher rows (as returned by GET /api/gift-vouchers) — an empty table
 * correctly produces all-zero tiles instead of the page's old static mock
 * numbers. "Value Issued"/"Outstanding Value" only sum currency-valued
 * voucher types (Fixed Amount / Digital / Physical Gift Card) since a
 * Percentage Discount voucher has no fixed face value to add up. */
export function buildGiftVoucherSummary(vouchers) {
  const total = vouchers.length;
  const active = vouchers.filter((v) => v.status === 'active').length;
  const expired = vouchers.filter((v) => v.status === 'expired').length;
  const redeemedCount = vouchers.reduce((sum, v) => sum + (v.usageCount || 0), 0);

  const currencyVouchers = vouchers.filter((v) => v.voucherType !== 'Percentage Discount');
  const totalValue = currencyVouchers.reduce((sum, v) => sum + Number(v.voucherValue || 0), 0);
  const redeemedValue = currencyVouchers.reduce(
    (sum, v) => sum + Number(v.voucherValue || 0) * (v.usageCount || 0),
    0,
  );
  const outstandingValue = Math.max(0, totalValue - redeemedValue);

  return {
    totalVouchers: { value: total, caption: 'All Time' },
    activeVouchers: { value: active, caption: 'Currently Valid' },
    expiredVouchers: { value: expired, caption: 'Already Ended' },
    redeemedThisMonth: { value: redeemedCount, caption: 'Till Date' },
    valueIssued: { value: totalValue, caption: 'Fixed-amount vouchers' },
    outstandingValue: { value: outstandingValue, caption: 'Unredeemed' },
  };
}
