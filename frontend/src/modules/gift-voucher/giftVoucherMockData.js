/**
 * TEMPORARY mock data for the Gift Voucher list page. The Gift Voucher
 * module hasn't been built on the backend yet, so this static list + summary
 * stand in for `useGetGiftVouchersQuery()` / `useGetGiftVoucherQuery(id)`.
 * Replace with real API data once that module exists — do not add more mock
 * data here in the meantime.
 */

export const SUMMARY = {
  totalVouchers: { value: 186, caption: 'All Time' },
  activeVouchers: { value: 124, caption: 'Currently Valid' },
  expiredVouchers: { value: 42, caption: 'Already Ended' },
  redeemedThisMonth: { value: 58, caption: 'This Month' },
  valueIssued: { value: 186500, caption: 'This Month' },
  outstandingValue: { value: 94200, caption: 'Unredeemed' },
};

const HAND_AUTHORED_VOUCHERS = [
  {
    code: 'GV-0001', name: 'Welcome Bonus Voucher', type: 'Amount Off', value: '₹250.00',
    validFrom: '01 May 2026', validTill: '31 May 2026', status: 'active', usage: 312,
  },
  {
    code: 'GV-0002', name: 'Festive Gift Card', type: 'Amount Off', value: '₹500.00',
    validFrom: '10 May 2026', validTill: '30 Jun 2026', status: 'active', usage: 186,
  },
  {
    code: 'GV-0003', name: 'Loyalty Reward 10%', type: 'Percentage Off', value: '10%',
    validFrom: '01 Jan 2026', validTill: '31 Dec 2026', status: 'active', usage: 89,
  },
  {
    code: 'GV-0004', name: 'Anniversary Special', type: 'Amount Off', value: '₹1000.00',
    validFrom: '15 Apr 2026', validTill: '15 May 2026', status: 'active', usage: 34,
  },
];

const ACTIVE_FILLER_NAMES = [
  'Summer Shopping Voucher', 'Referral Reward Card', 'Bulk Purchase Bonus', 'Republic Day Voucher',
  'First Purchase Gift Card', 'Clearance Sale Voucher', 'Diwali Sweet Bundle', 'Membership Renewal Bonus',
];
const ACTIVE_FILLER_TYPES = [
  { type: 'Amount Off', value: '₹150.00' },
  { type: 'Percentage Off', value: '5%' },
  { type: 'Amount Off', value: '₹300.00' },
  { type: 'Percentage Off', value: '15%' },
];
const activeFiller = ACTIVE_FILLER_NAMES.map((name, i) => {
  const t = ACTIVE_FILLER_TYPES[i % ACTIVE_FILLER_TYPES.length];
  return {
    code: `GV-${String(i + 5).padStart(4, '0')}`,
    name,
    type: t.type,
    value: t.value,
    validFrom: '01 Apr 2026',
    validTill: '30 Apr 2026',
    status: 'active',
    usage: Math.max(15, 60 - i * 5),
  };
});

const EXPIRED_VOUCHERS = [
  {
    code: 'GV-0013', name: 'New Year Gift Card', type: 'Amount Off', value: '₹500.00',
    validFrom: '25 Dec 2025', validTill: '05 Jan 2026', status: 'expired', usage: 245,
  },
  {
    code: 'GV-0014', name: "Valentine's Voucher", type: 'Percentage Off', value: '10%',
    validFrom: '07 Feb 2026', validTill: '14 Feb 2026', status: 'expired', usage: 96,
  },
  {
    code: 'GV-0015', name: 'Pongal Special Voucher', type: 'Amount Off', value: '₹200.00',
    validFrom: '10 Jan 2026', validTill: '17 Jan 2026', status: 'expired', usage: 128,
  },
  {
    code: 'GV-0016', name: 'Holi Discount Card', type: 'Percentage Off', value: '15%',
    validFrom: '01 Mar 2026', validTill: '15 Mar 2026', status: 'expired', usage: 71,
  },
];

const INACTIVE_VOUCHERS = [
  {
    code: 'GV-0017', name: 'Trial Promo Voucher', type: 'Amount Off', value: '₹100.00',
    validFrom: '01 Feb 2026', validTill: '28 Feb 2026', status: 'inactive', usage: 12,
  },
  {
    code: 'GV-0018', name: 'Staff Discount Card', type: 'Percentage Off', value: '20%',
    validFrom: '01 Jan 2026', validTill: '31 Dec 2026', status: 'inactive', usage: 4,
  },
];

export const VOUCHERS = [...HAND_AUTHORED_VOUCHERS, ...activeFiller, ...EXPIRED_VOUCHERS, ...INACTIVE_VOUCHERS]
  .sort((a, b) => a.code.localeCompare(b.code));

export const TOTAL_VOUCHER_COUNT = 186;

export const VOUCHER_DETAILS = {
  code: 'GV-0001',
  name: 'Welcome Bonus Voucher',
  status: 'active',
  type: 'Amount Off',
  value: '₹250.00',
  description: 'Welcome bonus voucher issued automatically to first-time customers.',
  validFrom: '01 May 2026',
  validTill: '31 May 2026',
  minimumBillAmount: '₹500.00',
  maximumUsage: 'Single Use',
  applicableTo: 'All Items',
  usage: 312,
  redemptionsTillDate: 312,
  valueRedeemed: 78000,
};
