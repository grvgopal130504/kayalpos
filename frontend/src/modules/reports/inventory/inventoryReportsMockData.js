import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';

/**
 * TEMPORARY mock data for the Inventory Reports screen. There's no Reports
 * backend module yet, so this static snapshot stands in for a
 * `useGetInventoryReportsMenuQuery()`. Replace with real API data once that
 * module exists — do not add more mock data here in the meantime.
 */

export const CASHIER = { name: 'Karthik', code: 'C001' };

export const OUTLET_OPTIONS = [
  'Main Outlet', 'Head Office', 'Saravanampatti', 'Peelamedu', 'Singanallur',
];

export const WAREHOUSE_OPTIONS = ['Main Warehouse', 'Coimbatore Warehouse', 'Erode Warehouse', 'Madurai Warehouse'];

export const DEFAULT_DATE_RANGE = { from: '2026-05-26', to: '2026-05-26' };

export const INVENTORY_REPORT_ITEMS = [
  { key: 'current-stock', label: 'Current Stock', description: 'View current stock summary for all items.', icon: Inventory2OutlinedIcon, color: '#2563EB' },
  { key: 'low-stock', label: 'Low Stock', description: 'View items that are below reorder level.', icon: TrendingDownOutlinedIcon, color: '#22A06B' },
  { key: 'out-of-stock', label: 'Out-of-Stock', description: 'View items that are currently out of stock.', icon: Inventory2OutlinedIcon, color: '#F26B21' },
  { key: 'stock-movement', label: 'Stock Movement', description: 'View detailed stock movement and transaction history.', icon: SwapHorizOutlinedIcon, color: '#7C3AED' },
  { key: 'stock-valuation', label: 'Stock Valuation', description: 'View stock valuation and inventory value summary.', icon: CurrencyRupeeOutlinedIcon, color: '#0EA5A4' },
  { key: 'stock-adjustment', label: 'Stock Adjustment', description: 'View stock adjustments and correction history.', icon: TuneOutlinedIcon, color: '#E5484D' },
  { key: 'wastage', label: 'Wastage', description: 'View wastage details and write-off items.', icon: DeleteOutlineOutlinedIcon, color: '#F5A623' },
  { key: 'batch-expiry', label: 'Batch Expiry', description: 'View batch expiry details and upcoming expiries.', icon: EventAvailableOutlinedIcon, color: '#22A06B' },
  { key: 'slow-moving-items', label: 'Slow Moving Items', description: 'View slow moving items based on sales and movement.', icon: HourglassEmptyOutlinedIcon, color: '#7C3AED' },
  { key: 'fast-moving-items', label: 'Fast Moving Items', description: 'View fast moving items based on sales and movement.', icon: RocketLaunchOutlinedIcon, color: '#2563EB' },
  { key: 'physical-stock-variance', label: 'Physical Stock Variance', description: 'View physical stock variance and comparison report.', icon: AssignmentOutlinedIcon, color: '#F26B21' },
];
