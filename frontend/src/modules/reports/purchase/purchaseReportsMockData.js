import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import OutboxOutlinedIcon from '@mui/icons-material/OutboxOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';

/**
 * TEMPORARY mock data for the Purchase Reports screen. There's no Reports
 * backend module yet, so this static snapshot stands in for a
 * `useGetPurchaseReportsMenuQuery()`. Replace with real API data once that
 * module exists — do not add more mock data here in the meantime.
 */

export const CASHIER = { name: 'Karthik', code: 'C001' };

export const SUPPLIER_OPTIONS = [
  'Shree Ganesh Traders', 'Vijay Agencies', 'S.K. Distributors', 'Sri Lakshmi Foods', 'Metro Wholesalers',
];

export const WAREHOUSE_OPTIONS = ['Main Warehouse', 'Coimbatore Warehouse', 'Erode Warehouse', 'Madurai Warehouse'];

export const DEFAULT_DATE_RANGE = { from: '2026-05-26', to: '2026-05-26' };

export const PURCHASE_REPORT_ITEMS = [
  { key: 'purchase-summary', label: 'Purchase Summary', description: 'View overall purchase summary and details.', icon: AssignmentOutlinedIcon, color: '#2563EB' },
  { key: 'supplier-wise-purchase', label: 'Supplier-wise Purchase', description: 'View purchase summary by individual suppliers.', icon: PeopleAltOutlinedIcon, color: '#22A06B' },
  { key: 'grn-report', label: 'GRN Report', description: 'View Goods Receipt Note (GRN) details.', icon: LocalShippingOutlinedIcon, color: '#F26B21' },
  { key: 'pending-grn', label: 'Pending GRN', description: 'View GRNs that are pending for receipt.', icon: HourglassEmptyOutlinedIcon, color: '#7C3AED' },
  { key: 'purchase-return', label: 'Purchase Return', description: 'View purchase return summary and details.', icon: AssignmentReturnOutlinedIcon, color: '#E5484D' },
  { key: 'purchase-price-variance', label: 'Purchase Price Variance', description: 'View price variance between PO and GRN.', icon: CurrencyRupeeOutlinedIcon, color: '#0EA5A4' },
  { key: 'stock-indent', label: 'Stock Indent', description: 'View stock indent requests and details.', icon: PlaylistAddCheckOutlinedIcon, color: '#F5A623' },
  { key: 'stock-transfer', label: 'Stock Transfer', description: 'View stock transfer between warehouses.', icon: SwapHorizOutlinedIcon, color: '#2563EB' },
  { key: 'stock-receipt', label: 'Stock Receipt', description: 'View stock receipts and transaction details.', icon: MoveToInboxOutlinedIcon, color: '#22A06B' },
  { key: 'stock-return', label: 'Stock Return', description: 'View stock return details and summary.', icon: OutboxOutlinedIcon, color: '#E5484D' },
  { key: 'stock-count', label: 'Stock Count', description: 'View stock count sheets and physical count summary.', icon: FactCheckOutlinedIcon, color: '#7C3AED' },
];
