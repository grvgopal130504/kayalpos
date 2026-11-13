import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined';

/**
 * Tile catalogue for the Sales Reports landing screen. `wired` tiles open a
 * real report at /reports/sales/:key (see salesReportConfig.js); the others
 * are still "coming soon". Outlet / cashier / date filters are NOT mocked any
 * more — they come from the real data (useSalesReportFiltersQuery).
 */

export const SALES_REPORT_ITEMS = [
  { key: 'daily-sales', wired: true, label: 'Daily Sales', description: 'View daily sales summary and details for selected date.', icon: CalendarTodayOutlinedIcon, color: '#2563EB' },
  { key: 'monthly-sales', wired: true, label: 'Monthly Sales', description: 'View monthly sales summary and details for selected month.', icon: EventAvailableOutlinedIcon, color: '#22A06B' },
  { key: 'outlet-wise-sales', wired: true, label: 'Outlet-wise Sales', description: 'Compare sales performance across all outlets.', icon: StorefrontIcon, color: '#F26B21' },
  { key: 'cashier-wise-sales', wired: true, label: 'Cashier-wise Sales', description: 'View sales performance of individual cashiers.', icon: PersonOutlineOutlinedIcon, color: '#7C3AED' },
  { key: 'item-wise-sales', wired: true, label: 'Item-wise Sales', description: 'View sales details of individual items.', icon: Inventory2OutlinedIcon, color: '#2563EB' },
  { key: 'category-wise-sales', wired: true, label: 'Category-wise Sales', description: 'View sales summary by item categories.', icon: LabelOutlinedIcon, color: '#0EA5A4' },
  { key: 'brand-wise-sales', wired: true, label: 'Brand-wise Sales', description: 'View sales summary by brands.', icon: SellOutlinedIcon, color: '#E5484D' },
  { key: 'customer-wise-sales', wired: true, label: 'Customer-wise Sales', description: 'View sales summary by customers.', icon: PeopleAltOutlinedIcon, color: '#22A06B' },
  { key: 'hourly-sales', label: 'Hourly Sales', description: 'View hourly sales trend and performance.', icon: AccessTimeOutlinedIcon, color: '#F26B21' },
  { key: 'payment-wise-sales', label: 'Payment-wise Sales', description: 'View sales summary by payment modes.', icon: CreditCardOutlinedIcon, color: '#7C3AED' },
  { key: 'discount-report', label: 'Discount Report', description: 'View discounts given during sales.', icon: PercentOutlinedIcon, color: '#F5A623' },
  { key: 'tax-report', label: 'Tax Report', description: 'View tax collected details and summary.', icon: ReceiptOutlinedIcon, color: '#2563EB' },
  { key: 'return-report', label: 'Return Report', description: 'View sales returns summary and details.', icon: KeyboardReturnOutlinedIcon, color: '#E5484D' },
];
