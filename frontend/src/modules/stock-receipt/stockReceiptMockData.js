/**
 * TEMPORARY mock data for the Stock Receipt module. There's no Stock
 * Receipt backend module yet, so this static list stands in for
 * `useGetReceiptsQuery()`. RECEIPTS also drives the next receipt number on
 * the Create screen (`nextReceiptCode()` in CreateStockReceiptPage takes the
 * max existing code) — keep RCPT-00030 as the highest code when adding more
 * rows. Replace all of this with real API data once that module exists.
 */

export const SUMMARY = {
  totalReceipts: { value: 30, caption: 'All Time' },
  draftReceipts: { value: 6, caption: 'Not Yet Received' },
  receivedReceipts: { value: 24, caption: 'Completed' },
  receivedThisMonth: { value: 12, caption: 'This Month' },
  valueReceived: { value: 486500, caption: 'This Month' },
};

const HAND_AUTHORED_RECEIPTS = [
  {
    code: 'RCPT-00030', date: '25 May 2026', supplier: 'Anna Nagar Distributors', purchaseType: 'Local Purchase',
    invoiceNo: 'INV-4521', items: 12, totalValue: 48250.0, status: 'draft',
  },
  {
    code: 'RCPT-00029', date: '24 May 2026', supplier: 'Sri Krishna Traders', purchaseType: 'Local Purchase',
    invoiceNo: 'INV-4498', items: 8, totalValue: 22650.5, status: 'received',
  },
  {
    code: 'RCPT-00028', date: '21 May 2026', supplier: 'Metro Wholesale Foods', purchaseType: 'Interstate Purchase',
    invoiceNo: 'INV-4470', items: 20, totalValue: 96500.0, status: 'received',
  },
  {
    code: 'RCPT-00027', date: '18 May 2026', supplier: 'Coimbatore Agro Traders', purchaseType: 'Local Purchase',
    invoiceNo: 'INV-4432', items: 15, totalValue: 61200.75, status: 'received',
  },
];

const FILLER_SUPPLIERS = [
  'Kayal Foods Pvt Ltd', 'Saravana Wholesale Mart', 'Ganesh Agro Distributors', 'Tirupur Grocery Suppliers',
  'Coastal Spice Traders', 'Nilgiris Fresh Produce',
];
const FILLER_TYPES = ['Local Purchase', 'Interstate Purchase', 'Import'];

function generateFillerReceipts(count, startNum) {
  return Array.from({ length: count }, (_, i) => {
    const num = startNum - i;
    return {
      code: `RCPT-${String(num).padStart(5, '0')}`,
      date: '0' + ((i % 9) + 1) + ' May 2026',
      supplier: FILLER_SUPPLIERS[i % FILLER_SUPPLIERS.length],
      purchaseType: FILLER_TYPES[i % FILLER_TYPES.length],
      invoiceNo: `INV-${4400 - i * 7}`,
      items: 5 + ((i * 3) % 18),
      totalValue: Number((15000 + (i * 4231) % 60000).toFixed(2)),
      status: i % 5 === 0 ? 'draft' : 'received',
    };
  });
}

export const RECEIPTS = [
  ...HAND_AUTHORED_RECEIPTS,
  ...generateFillerReceipts(26, 26),
];

export const TOTAL_RECEIPT_COUNT = 30;

export const RECEIPT_DETAILS = {
  code: 'RCPT-00030',
  date: '25 May 2026',
  status: 'draft',
  supplier: 'Anna Nagar Distributors',
  purchaseType: 'Local Purchase',
  invoiceNo: 'INV-4521',
  invoiceDate: '24 May 2026',
  grnDcNo: 'GRN-8821',
  fromOutlet: 'Main Warehouse',
  contactPerson: 'Suresh Rajan',
  mobileNo: '9876501234',
  items: 12,
  totalValue: 48250.0,
  vehicleNo: 'TN 39 AB 4521',
  transporter: 'VRL Logistics',
};
