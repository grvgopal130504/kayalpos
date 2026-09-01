export const SUMMARY = {
  totalCustomers: 1248,
  activeCustomers: 1102,
  loyalCustomers: 346,
  totalSalesThisMonth: 548230.5,
  outstandingAmount: 123450.75,
};

// Ten hand-authored rows matching the reference screenshot exactly, plus a
// generated tail so pagination ("Showing 1 to 10 of 1,248 entries") behaves
// realistically. The Customer backend module doesn't exist yet — this is all
// TEMPORARY mock data, to be replaced by RTK Query hooks later.
const HAND_AUTHORED_CUSTOMERS = [
  { code: 'CUS-0001', name: 'Ramesh Kumar', mobile: '9876543210', email: 'ramesh.kumar@email.com', loyaltyPoints: 250, totalPurchase: 12450.75, outstanding: 1250.5, status: 'active' },
  { code: 'CUS-0002', name: 'Priya Enterprises', mobile: '9887766554', email: 'priya.enterprises@email.com', loyaltyPoints: 680, totalPurchase: 45780.3, outstanding: 8450.0, status: 'active' },
  { code: 'CUS-0003', name: 'Suresh Babu', mobile: '9994455663', email: 'suresh.babu@email.com', loyaltyPoints: 120, totalPurchase: 6230.0, outstanding: 0.0, status: 'active' },
  { code: 'CUS-0004', name: 'Kavitha Stores', mobile: '9966332211', email: 'kavitha.stores@email.com', loyaltyPoints: 450, totalPurchase: 28560.5, outstanding: 2150.0, status: 'active' },
  { code: 'CUS-0005', name: 'Vijay Traders', mobile: '9944112233', email: 'vijay.traders@email.com', loyaltyPoints: 0, totalPurchase: 1250.0, outstanding: 1250.0, status: 'inactive' },
  { code: 'CUS-0006', name: 'Anand Retail', mobile: '9900112233', email: 'anand.retail@email.com', loyaltyPoints: 310, totalPurchase: 15780.2, outstanding: 0.0, status: 'active' },
  { code: 'CUS-0007', name: 'Meena Super Store', mobile: '9899887766', email: 'meena.store@email.com', loyaltyPoints: 560, totalPurchase: 32450.4, outstanding: 4200.25, status: 'active' },
  { code: 'CUS-0008', name: 'Balaji Provision', mobile: '9844556677', email: 'balaji.provision@email.com', loyaltyPoints: 75, totalPurchase: 3560.0, outstanding: 560.0, status: 'inactive' },
  { code: 'CUS-0009', name: 'Ganesh Agency', mobile: '9822334455', email: 'ganesh.agency@email.com', loyaltyPoints: 210, totalPurchase: 8760.75, outstanding: 760.75, status: 'active' },
  { code: 'CUS-0010', name: 'Lakshmi Stores', mobile: '9811223344', email: 'lakshmi.stores@email.com', loyaltyPoints: 390, totalPurchase: 21450.8, outstanding: 0.0, status: 'active' },
];

const FILLER_NAMES = [
  'Sri Ganesh Traders', 'Annapurna Stores', 'Deepak Enterprises', 'Krishna Provisions',
  'Sai Ram Retail', 'Malar Stores', 'Nithya Agencies', 'Bharat Super Mart',
  'Chennai Fresh Mart', 'Sunrise Traders', 'Global Mart', 'City Grocers',
];

function generateFillerCustomers(count, startIndex) {
  return Array.from({ length: count }, (_, i) => {
    const idx = startIndex + i;
    const name = FILLER_NAMES[i % FILLER_NAMES.length];
    return {
      code: `CUS-${String(idx).padStart(4, '0')}`,
      name,
      mobile: `98${String(10000000 + idx * 37).slice(0, 8)}`,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@email.com`,
      loyaltyPoints: (idx * 17) % 700,
      totalPurchase: Number((1200 + (idx * 733) % 42000).toFixed(2)),
      outstanding: Number(((idx * 211) % 6000).toFixed(2)),
      status: idx % 6 === 0 ? 'inactive' : 'active',
    };
  });
}

export const CUSTOMERS = [
  ...HAND_AUTHORED_CUSTOMERS,
  ...generateFillerCustomers(38, 11),
];

export const TOTAL_CUSTOMER_COUNT = 1248;

export const CUSTOMER_BY_CODE = Object.fromEntries(CUSTOMERS.map((c) => [c.code, c]));

export const CUSTOMER_DETAILS = {
  code: 'CUS-0001',
  name: 'Ramesh Kumar',
  initials: 'RK',
  status: 'active',
  mobile: '9876543210',
  email: 'ramesh.kumar@email.com',
  address: '23, West Street, RS Puram, Coimbatore - 641002, Tamil Nadu',
  dateOfJoining: '15 Feb 2024',
  loyaltyPoints: 250,
  totalPurchase: 12450.75,
  outstandingAmount: 1250.5,
};

export const RECENT_TRANSACTIONS = [
  { date: '26 May 2026', type: 'Invoice', invoiceNo: 'INV-000125', amount: 2450.0, payment: 'Credit', status: 'paid' },
  { date: '22 May 2026', type: 'Invoice', invoiceNo: 'INV-000118', amount: 1850.5, payment: 'Cash', status: 'paid' },
  { date: '18 May 2026', type: 'Invoice', invoiceNo: 'INV-000109', amount: 3250.75, payment: 'Credit', status: 'paid' },
  { date: '15 May 2026', type: 'Payment', invoiceNo: 'PAY-000045', amount: 1000.0, payment: 'Cash', status: 'received' },
  { date: '12 May 2026', type: 'Invoice', invoiceNo: 'INV-000097', amount: 1560.5, payment: 'Credit', status: 'paid' },
];

export const LOYALTY_SUMMARY = {
  availablePoints: 250,
  totalEarnedPoints: 1000,
  totalRedeemedPoints: 750,
  transactions: 25,
};

/**
 * Full detail shape for a customer code, for the View/Edit pages and
 * CustomerPage's own detail panel. Only CUS-0001 has hand-authored extras
 * (address, dateOfJoining) in CUSTOMER_DETAILS — every other row falls back
 * to reusing that shape with its own CUSTOMERS fields swapped in, since
 * there's no backend yet to hold real per-customer detail records.
 */
export function getCustomerDetails(code) {
  const row = CUSTOMER_BY_CODE[code];
  if (!row) return null;
  if (code === CUSTOMER_DETAILS.code) return CUSTOMER_DETAILS;
  return {
    ...CUSTOMER_DETAILS,
    code: row.code,
    name: row.name,
    initials: row.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
    status: row.status,
    mobile: row.mobile,
    email: row.email,
    loyaltyPoints: row.loyaltyPoints,
    totalPurchase: row.totalPurchase,
    outstandingAmount: row.outstanding,
  };
}
