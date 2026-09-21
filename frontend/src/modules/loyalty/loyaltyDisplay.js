/**
 * Shared "real LoyaltyProgram row -> UI shape" mapping, used by LoyaltyPage
 * (list + selected-row detail panel) and LoyaltyViewPage (the standalone
 * view screen) so the two never drift into showing different labels for the
 * same record — same pattern as promotion/promotionDisplay.js and
 * gift-voucher/giftVoucherDisplay.js.
 *
 * `membersEnrolled`/`pointsIssuedTillDate`/`pointsRedeemedTillDate` are
 * honestly derived from the real columns of the same names, which always
 * read 0 today because nothing in the app enrolls a customer or posts
 * loyalty points at checkout yet (Line Sale has no "earn/redeem points"
 * step). Once that wiring exists, these figures update automatically
 * instead of needing another change here.
 */

import {
  EARN_POINTS_ON_OPTIONS, POINTS_TYPE_OPTIONS, REDEMPTION_TYPE_OPTIONS, POINTS_EXPIRY_OPTIONS,
} from './createLoyaltyProgramSchema';

function optionLabel(options, value) {
  return options.find((o) => o.value === value)?.label || value;
}

/** "1 point(s) per ₹100 spent" for a fixed-points program, "5% of bill" for
 * a percentage one, matching the create form's own example copy. */
function formatEarnRule(program) {
  const value = Number(program.pointsValue || 0);
  if (program.pointsType === 'percentage') return `${value}% of bill`;
  if (program.earnPointsOn === 'visit') return `${value} pt(s) per visit`;
  return `${value} pt(s) per ₹100 spent`;
}

/** "1 point = ₹X discount/cashback" or "Free Item", matching the create
 * form's Redemption Type + Value fields. */
function formatRedemptionRule(program) {
  if (program.redemptionType === 'free-item') return 'Free Item';
  const value = Number(program.redemptionValue || 0).toFixed(2);
  return program.redemptionType === 'cashback' ? `1 point = ₹${value} cashback` : `1 point = ₹${value} discount`;
}

function formatMembershipValidity(program) {
  if (program.membershipValidity === 'lifetime') return 'Lifetime';
  return `Fixed Period (${program.validityPeriodMonths || 0} mo)`;
}

/** Builds the flat row shape LoyaltyTable reads, from a real API record. */
export function toLoyaltyRow(program) {
  return {
    id: program.id,
    code: program.code,
    name: program.name,
    earnRule: formatEarnRule(program),
    redemptionRule: formatRedemptionRule(program),
    membershipValidity: formatMembershipValidity(program),
    members: program.membersEnrolled || 0,
    status: program.status,
  };
}

/** Builds the rich detail shape LoyaltyDetailsCard reads, from a real API
 * record. */
export function toLoyaltyDetails(program) {
  return {
    id: program.id,
    code: program.code,
    name: program.name,
    status: program.status,
    description: program.description || '',
    earnPointsOn: optionLabel(EARN_POINTS_ON_OPTIONS, program.earnPointsOn),
    pointsType: optionLabel(POINTS_TYPE_OPTIONS, program.pointsType),
    pointsValue: formatEarnRule(program),
    redemptionType: optionLabel(REDEMPTION_TYPE_OPTIONS, program.redemptionType),
    redemptionValue: formatRedemptionRule(program),
    minimumPointsRequired: program.minimumPointsRequired || 0,
    membershipValidity: formatMembershipValidity(program),
    pointsExpiry: optionLabel(POINTS_EXPIRY_OPTIONS, program.pointsExpiry),
    members: program.membersEnrolled || 0,
    pointsIssuedTillDate: program.pointsIssuedTillDate || 0,
    pointsRedeemedTillDate: program.pointsRedeemedTillDate || 0,
  };
}

/** Builds the six summary tiles LoyaltySummaryCards reads, entirely from
 * real program rows (as returned by GET /api/loyalty-programs) — an empty
 * table correctly produces all-zero tiles instead of this page's old static
 * mock numbers. Captions say "Till Date" rather than "This Month" since
 * nothing here tracks a monthly breakdown. */
export function buildLoyaltySummary(programs) {
  const total = programs.length;
  const active = programs.filter((p) => p.status === 'Active').length;
  const inactive = programs.filter((p) => p.status === 'Inactive').length;
  const membersEnrolled = programs.reduce((sum, p) => sum + (p.membersEnrolled || 0), 0);
  const pointsIssued = programs.reduce((sum, p) => sum + (p.pointsIssuedTillDate || 0), 0);
  const pointsRedeemed = programs.reduce((sum, p) => sum + (p.pointsRedeemedTillDate || 0), 0);

  return {
    totalPrograms: { value: total, caption: 'All Time' },
    activePrograms: { value: active, caption: 'Currently Running' },
    inactivePrograms: { value: inactive, caption: 'Not Running' },
    membersEnrolled: { value: membersEnrolled, caption: 'All Time' },
    pointsIssued: { value: pointsIssued, caption: 'Till Date' },
    pointsRedeemed: { value: pointsRedeemed, caption: 'Till Date' },
  };
}
