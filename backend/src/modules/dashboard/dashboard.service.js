/**
 * TEMPORARY MOCK DASHBOARD DATA
 * -------------------------------------------------------------------------
 * No Sales/Stock/Expense modules (and no Prisma models) exist yet, so there
 * is no real transactional data to aggregate. These endpoints return
 * realistic placeholder numbers shaped exactly like the real response will
 * be, so the frontend can be built against a stable contract now and only
 * needs its data source swapped (not its UI) once those modules land.
 *
 * Replace the bodies of getHomeSummary / getManagementSummary with real
 * Prisma aggregations module by module (Sales first, then Stock, then
 * Expenses) — do not add more mock fields here in the meantime.
 */

const TOP_SELLING_ITEMS = [
  { id: 'kayal-ponni-rice-25kg', name: 'Kayal Ponni Rice 25kg', qty: 1500, unit: 'Bag', salesAmount: 345000 },
  { id: 'kayal-idly-rice-25kg', name: 'Kayal Idly Rice 25kg', qty: 1200, unit: 'Bag', salesAmount: 265000 },
  { id: 'kayal-ghee-1l', name: 'Kayal Ghee 1L', qty: 980, unit: 'Nos', salesAmount: 185200 },
  { id: 'kayal-groundnut-oil-1l', name: 'Kayal Groundnut Oil 1L', qty: 750, unit: 'Nos', salesAmount: 132000 },
  { id: 'kayal-toor-dhal-1kg', name: 'Kayal Toor Dhal 1kg', qty: 620, unit: 'Pcs', salesAmount: 86800 },
];

const LOW_STOCK_ITEMS = [
  { id: 'toor-dhal', name: 'Kayal Toor Dhal 1kg', currentStock: 5, currentStockUnit: 'Pcs', reorderLevel: 20, reorderUnit: 'Pcs', status: 'Low Stock' },
  { id: 'ghee', name: 'Kayal Ghee 1L', currentStock: 6, currentStockUnit: 'Nos', reorderLevel: 15, reorderUnit: 'Nos', status: 'Low Stock' },
  { id: 'groundnut-oil', name: 'Kayal Groundnut Oil 1L', currentStock: 8, currentStockUnit: 'Nos', reorderLevel: 20, reorderUnit: 'Nos', status: 'Low Stock' },
  { id: 'idly-rice', name: 'Kayal Idly Rice 25kg', currentStock: 10, currentStockUnit: 'Bag', reorderLevel: 25, reorderUnit: 'Bag', status: 'Low Stock' },
  { id: 'ponni-rice', name: 'Kayal Ponni Rice 25kg', currentStock: 12, currentStockUnit: 'Bag', reorderLevel: 30, reorderUnit: 'Bag', status: 'Low Stock' },
];

const RECENT_TRANSACTIONS = [
  { id: 'INV-250524-0001', invoiceNo: 'INV-250524-0001', type: 'Sale', customer: 'Walk-in Customer', amount: 2450, time: '10:35 AM', status: 'Completed' },
  { id: 'INV-250524-0002', invoiceNo: 'INV-250524-0002', type: 'Sale', customer: 'Siva Traders', amount: 5780, time: '10:28 AM', status: 'Completed' },
  { id: 'RET-250524-0001', invoiceNo: 'RET-250524-0001', type: 'Return', customer: 'Walk-in Customer', amount: 650, time: '10:20 AM', status: 'Completed' },
  { id: 'INV-250524-0003', invoiceNo: 'INV-250524-0003', type: 'Sale', customer: 'Gopi Stores', amount: 3230, time: '10:15 AM', status: 'Completed' },
  { id: 'INV-250524-0004', invoiceNo: 'INV-250524-0004', type: 'Sale', customer: 'Walk-in Customer', amount: 1890, time: '10:10 AM', status: 'Completed' },
];

const SALES_TREND = {
  categories: ['1 May', '6 May', '11 May', '16 May', '21 May', '26 May', '31 May'],
  values: [42000, 58000, 51000, 72000, 61000, 118000, 132000],
};

export function getHomeSummary(outletId) {
  return {
    outletId,
    stats: {
      totalSalesToday: { value: 125430, deltaPct: 12.5, direction: 'up' },
      ordersToday: { value: 256, deltaPct: 8.3, direction: 'up' },
      totalItems: { value: 1245 },
      lowStockItems: { value: 23 },
      totalCustomers: { value: 856, deltaPct: 5.6, direction: 'up' },
    },
    salesOverview: SALES_TREND,
    topSellingItems: TOP_SELLING_ITEMS,
    paymentSummary: {
      total: 125430,
      breakdown: [
        { method: 'Cash', amount: 45230 },
        { method: 'UPI', amount: 32400 },
        { method: 'Card', amount: 25600 },
        { method: 'Wallet', amount: 12500 },
        { method: 'Credit', amount: 9700 },
      ],
    },
    recentTransactions: RECENT_TRANSACTIONS,
    lowStockDetails: LOW_STOCK_ITEMS,
  };
}

export function getManagementSummary() {
  return {
    stats: {
      totalSalesToday: { value: 125430, deltaPct: 12.5, direction: 'up' },
      totalPurchaseToday: { value: 78560, deltaPct: 6.3, direction: 'up' },
      grossProfitToday: { value: 46870, deltaPct: 14.2, direction: 'up' },
      netProfitToday: { value: 28340, deltaPct: 13.6, direction: 'up' },
      totalExpensesToday: { value: 18530, deltaPct: 5.7, direction: 'down' },
      stockValue: { value: 456830 },
    },
    salesTrend: SALES_TREND,
    salesByOutlet: {
      total: 1875430,
      breakdown: [
        { outlet: 'Main Outlet', amount: 645230 },
        { outlet: 'Saravanampatti', amount: 425110 },
        { outlet: 'Peelamedu', amount: 325780 },
        { outlet: 'Singanallur', amount: 285660 },
        { outlet: 'Others', amount: 293650 },
      ],
    },
    paymentMethodSummary: {
      total: 125430,
      breakdown: [
        { method: 'Cash', amount: 45230 },
        { method: 'UPI', amount: 32400 },
        { method: 'Card', amount: 25600 },
        { method: 'Wallet', amount: 12500 },
        { method: 'Credit', amount: 9700 },
      ],
    },
    alerts: {
      lowStockItems: 23,
      outOfStockItems: 12,
      pendingIndents: 18,
      pendingGrns: 7,
      pendingTransfers: 11,
      pendingApprovals: 15,
      sapSyncStatus: 'Connected',
      sapLastSyncAt: '10:30 AM',
    },
    topSellingItems: TOP_SELLING_ITEMS,
    outletPerformance: [
      { id: 'main', outlet: 'Main Outlet', sales: 45230, transactions: 128, avgBillValue: 353.36, achievementPct: 90 },
      { id: 'saravanampatti', outlet: 'Saravanampatti', sales: 28400, transactions: 86, avgBillValue: 330.23, achievementPct: 85 },
      { id: 'peelamedu', outlet: 'Peelamedu', sales: 22150, transactions: 74, avgBillValue: 299.32, achievementPct: 78 },
      { id: 'singanallur', outlet: 'Singanallur', sales: 17860, transactions: 56, avgBillValue: 318.21, achievementPct: 72 },
      { id: 'others', outlet: 'Others', sales: 11790, transactions: 38, avgBillValue: 310.26, achievementPct: 65 },
    ],
    expenseSummary: {
      total: 583700,
      breakdown: [
        { category: 'Staff Salary', amount: 245600 },
        { category: 'Rent', amount: 120000 },
        { category: 'Transport', amount: 85000 },
        { category: 'Utilities', amount: 42300 },
        { category: 'Marketing', amount: 35200 },
        { category: 'Others', amount: 55600 },
      ],
    },
    inventorySummary: {
      totalItems: 1245,
      activeItems: 1102,
      stockInHand: 4568230,
      stockMovementToday: 625430,
      breakdown: [
        { status: 'In Stock', count: 1102 },
        { status: 'Low Stock', count: 98 },
        { status: 'Out of Stock', count: 12 },
        { status: 'Blocked', count: 33 },
      ],
    },
    receivablesPayables: {
      receivables: { total: 1245230, overdue: 235600, customersDue: 86 },
      payables: { total: 785430, overdue: 145320, suppliersDue: 42 },
    },
    profitOverview: {
      totalSales: 1875430,
      totalPurchase: 1022560,
      grossProfit: 852870,
      totalExpenses: 583700,
      netProfit: 269170,
    },
  };
}
