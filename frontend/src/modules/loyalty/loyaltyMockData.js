/**
 * TEMPORARY mock data for the Loyalty list page. The Loyalty module hasn't
 * been built on the backend yet, so this static list + summary stand in for
 * `useGetLoyaltyProgramsQuery()` / `useGetLoyaltyProgramQuery(id)`. Replace
 * with real API data once that module exists — do not add more mock data
 * here in the meantime.
 */

export const SUMMARY = {
  totalPrograms: { value: 14, caption: 'All Time' },
  activePrograms: { value: 9, caption: 'Currently Running' },
  inactivePrograms: { value: 5, caption: 'Not Running' },
  membersEnrolled: { value: 3260, caption: 'All Time' },
  pointsIssued: { value: 128400, caption: 'This Month' },
  pointsRedeemed: { value: 46250, caption: 'This Month' },
};

const HAND_AUTHORED_PROGRAMS = [
  {
    code: 'LP-0001', name: 'Standard Rewards', earnRule: '1 pt / ₹100 spent', redemptionRule: '1 pt = ₹1 discount',
    membershipValidity: 'Lifetime', status: 'Active', members: 1450,
  },
  {
    code: 'LP-0002', name: 'Premium Member Club', earnRule: '2 pt / ₹100 spent', redemptionRule: '1 pt = ₹1 cashback',
    membershipValidity: 'Fixed Period (12 mo)', status: 'Active', members: 620,
  },
  {
    code: 'LP-0003', name: 'Weekend Bonus Points', earnRule: '5% of bill', redemptionRule: '1 pt = ₹0.50 discount',
    membershipValidity: 'Lifetime', status: 'Active', members: 385,
  },
  {
    code: 'LP-0004', name: 'New Customer Welcome', earnRule: '100 pts on enrollment', redemptionRule: 'Free item',
    membershipValidity: 'Fixed Period (6 mo)', status: 'Active', members: 210,
  },
];

const FILLER_NAMES = [
  'Festive Bonus Program', 'Referral Rewards', 'Corporate Loyalty Plan', 'Family Membership Club',
  'Silver Tier Rewards', 'Gold Tier Rewards',
];
const FILLER_RULES = [
  { earnRule: '1 pt / ₹150 spent', redemptionRule: '1 pt = ₹1 discount' },
  { earnRule: '3% of bill', redemptionRule: '1 pt = ₹0.75 cashback' },
  { earnRule: '1 pt / visit', redemptionRule: 'Free item' },
];
const activeFiller = FILLER_NAMES.slice(0, 3).map((name, i) => {
  const r = FILLER_RULES[i % FILLER_RULES.length];
  return {
    code: `LP-${String(i + 5).padStart(4, '0')}`,
    name,
    earnRule: r.earnRule,
    redemptionRule: r.redemptionRule,
    membershipValidity: i % 2 === 0 ? 'Lifetime' : 'Fixed Period (12 mo)',
    status: 'Active',
    members: Math.max(60, 320 - i * 60),
  };
});

const INACTIVE_PROGRAMS = FILLER_NAMES.slice(3).map((name, i) => {
  const r = FILLER_RULES[i % FILLER_RULES.length];
  return {
    code: `LP-${String(i + 8).padStart(4, '0')}`,
    name,
    earnRule: r.earnRule,
    redemptionRule: r.redemptionRule,
    membershipValidity: 'Fixed Period (6 mo)',
    status: 'Inactive',
    members: Math.max(10, 90 - i * 20),
  };
}).concat([
  {
    code: 'LP-0011', name: 'Old Loyalty Scheme', earnRule: '1 pt / ₹200 spent', redemptionRule: '1 pt = ₹1 discount',
    membershipValidity: 'Lifetime', status: 'Inactive', members: 540,
  },
  {
    code: 'LP-0012', name: 'Trial Points Program', earnRule: '1 pt / ₹100 spent', redemptionRule: 'Free item',
    membershipValidity: 'Fixed Period (3 mo)', status: 'Inactive', members: 45,
  },
  {
    code: 'LP-0013', name: 'Discontinued VIP Plan', earnRule: '5 pt / ₹100 spent', redemptionRule: '1 pt = ₹2 cashback',
    membershipValidity: 'Lifetime', status: 'Inactive', members: 95,
  },
  {
    code: 'LP-0014', name: 'Legacy Punch Card', earnRule: '1 pt / visit', redemptionRule: 'Free item',
    membershipValidity: 'Fixed Period (12 mo)', status: 'Inactive', members: 30,
  },
]);

export const PROGRAMS = [...HAND_AUTHORED_PROGRAMS, ...activeFiller, ...INACTIVE_PROGRAMS]
  .sort((a, b) => a.code.localeCompare(b.code));

export const TOTAL_PROGRAM_COUNT = 14;

export const PROGRAM_DETAILS = {
  code: 'LP-0001',
  name: 'Standard Rewards',
  status: 'Active',
  description: 'Default loyalty program enrolling every customer at checkout.',
  earnPointsOn: 'Total Bill Amount',
  pointsType: 'Fixed Points',
  pointsValue: '1 point per ₹100 spent',
  redemptionType: 'Discount on Bill',
  redemptionValue: '1 point = ₹1.00',
  minimumPointsRequired: 50,
  membershipValidity: 'Lifetime',
  pointsExpiry: 'Never',
  members: 1450,
  pointsIssuedTillDate: 42500,
  pointsRedeemedTillDate: 18600,
};
