import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import CloudQueueOutlinedIcon from '@mui/icons-material/CloudQueueOutlined';

/**
 * TEMPORARY mock data for the Reports module. There's no unified Reports
 * backend module yet (each report — sales, inventory, purchase, etc. —
 * will belong to its own API slice once built), so this static snapshot
 * stands in for a `useGetReportsMenuQuery()`. Replace with real API data
 * once that module exists — do not add more mock data here in the
 * meantime.
 */

export const CASHIER = { name: 'Karthik', code: 'C001' };

export const REPORT_ITEMS = [
  { key: 'sales-report', label: 'Sales Report', description: 'View sales performance across outlets and periods.', icon: BarChartOutlinedIcon, color: '#2563EB', path: '/reports/sales' },
  { key: 'inventory-report', label: 'Inventory Report', description: 'Track stock levels, movement and valuation.', icon: Inventory2OutlinedIcon, color: '#8B5CF6', path: '/reports/inventory' },
  { key: 'purchase-report', label: 'Purchase Report', description: 'Review purchases, receipts and supplier spend.', icon: ShoppingCartOutlinedIcon, color: '#F26B21', path: '/reports/purchase' },
  { key: 'cashier-reports', label: 'Cashier Reports', description: 'Analyze cashier-wise sales and shift activity.', icon: BadgeOutlinedIcon, color: '#0EA5A4', path: '/reports/cashier' },
  { key: 'financial-reports', label: 'Financial Reports', description: 'Profit, expenses and receivables/payables summary.', icon: AccountBalanceOutlinedIcon, color: '#22A06B', path: '/reports/financial' },
  { key: 'sap-reports', label: 'SAP Reports', description: 'Sync status and data exchanged with SAP.', icon: CloudQueueOutlinedIcon, color: '#5B6472', path: '/reports/sap' },
];
