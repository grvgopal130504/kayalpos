import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';

/**
 * TEMPORARY mock data for the Masters module. There's no unified Masters
 * backend module yet (each master — company, outlet, product, etc. —
 * belongs to its own API slice), so this static snapshot stands in for a
 * `useGetMastersMenuQuery()`. Replace with real API data once that module
 * exists — do not add more mock data here in the meantime.
 */

export const CASHIER = { name: 'Karthik', code: 'C001' };

export const MASTER_ITEMS = [
  { key: 'company', label: 'Company', description: 'Manage company details and settings.', icon: SettingsOutlinedIcon, color: '#2563EB', path: '/masters/company' },
  { key: 'outlet', label: 'Outlet', description: 'Manage outlets or business locations.', icon: StorefrontIcon, color: '#22A06B', path: '/masters/outlet' },
  { key: 'warehouse', label: 'Warehouse', description: 'Manage warehouses and locations.', icon: MoveToInboxOutlinedIcon, color: '#8B5CF6', path: '/masters/warehouse' },
  { key: 'product', label: 'Product', description: 'Create and manage inventory items.', icon: Inventory2OutlinedIcon, color: '#F26B21', path: '/masters/product' },
  { key: 'brand', label: 'Brand', description: 'Manage item brands and brand details.', icon: CardGiftcardOutlinedIcon, color: '#E5484D', path: '/masters/brand' },
  { key: 'uom', label: 'UOM', description: 'Define units of measure and UOM groups.', icon: PlaylistAddCheckOutlinedIcon, color: '#0EA5A4', path: '/masters/uom' },
  { key: 'tax-code', label: 'Tax Code', description: 'Create and manage tax codes.', icon: ReceiptOutlinedIcon, color: '#F5A623', path: '/masters/tax-code' },
  { key: 'hsn-sac', label: 'HSN/SAC', description: 'Maintain HSN/SAC codes for items.', icon: DescriptionOutlinedIcon, color: '#0EA5A4', path: '/masters/hsn-sac' },
  { key: 'selling-price', label: 'Selling Price', description: 'Set and manage selling prices.', icon: CurrencyRupeeOutlinedIcon, color: '#22A06B', path: '/masters/selling-price' },
  { key: 'price-list', label: 'Price List', description: 'Create and manage multiple price lists.', icon: ReceiptLongOutlinedIcon, color: '#8B5CF6', path: '/masters/price-list' },
  { key: 'batch-serial', label: 'Batch or Serial Number', description: 'Track batch and serial numbers for items.', icon: NumbersOutlinedIcon, color: '#7C3AED', path: '/masters/batch-serial' },
  { key: 'supplier', label: 'Supplier', description: 'Manage supplier master details.', icon: LocalShippingOutlinedIcon, color: '#F26B21', path: '/masters/supplier' },
  { key: 'employee', label: 'Employee', description: 'Manage employees and user details.', icon: BadgeOutlinedIcon, color: '#0EA5A4', path: '/masters/employee' },
];
