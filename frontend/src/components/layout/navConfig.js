import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import CloudQueueOutlinedIcon from '@mui/icons-material/CloudQueueOutlined';

/**
 * Single source of truth for the sidebar + "Quick Access" grid on Home.
 * Every module tile in Home's Quick Access reuses this list instead of
 * duplicating labels/icons/routes, so the sidebar and the dashboard tiles
 * can never drift apart.
 *
 * `section` groups items visually (a divider is drawn between groups in the
 * sidebar), matching the spacing break seen in the reference between
 * "Stock Count" and "Cashier Panel".
 */
export const NAV_SECTIONS = [
  {
    key: 'main',
    items: [
      { key: 'home', label: 'Home', icon: HomeOutlinedIcon, path: '/home' },
      { key: 'management-dashboard', label: 'Dashboard', icon: SpaceDashboardOutlinedIcon, path: '/dashboard' },
      { key: 'line-sale', label: 'Line Sale', icon: PointOfSaleOutlinedIcon, path: '/line-sale', quickAccess: true },
      { key: 'sales-return', label: 'Sales Return', icon: AssignmentReturnOutlinedIcon, path: '/sales-return', quickAccess: true },
      { key: 'promotion', label: 'Promotion', icon: CampaignOutlinedIcon, path: '/promotion', quickAccess: true },
      { key: 'gift-voucher', label: 'Gift Voucher', icon: CardGiftcardOutlinedIcon, path: '/gift-voucher', quickAccess: true },
      { key: 'loyalty', label: 'Loyalty', icon: FavoriteBorderOutlinedIcon, path: '/loyalty', quickAccess: true },
      { key: 'customer', label: 'Customer', icon: PeopleAltOutlinedIcon, path: '/customer', quickAccess: true },
      { key: 'sales-quotation', label: 'Sales Quotation', icon: DescriptionOutlinedIcon, path: '/sales-quotation', quickAccess: true },
      { key: 'sales-order', label: 'Sales Order', icon: ReceiptLongOutlinedIcon, path: '/sales-order', quickAccess: true },
      { key: 'sales-invoice', label: 'Sales Invoice', icon: ReceiptOutlinedIcon, path: '/sales-invoice', quickAccess: true },
      { key: 'barcode-label', label: 'Barcode & Lable', icon: QrCode2OutlinedIcon, path: '/barcode-label', quickAccess: true },
      { key: 'stock-indent', label: 'Stock Indent', icon: PlaylistAddCheckOutlinedIcon, path: '/stock-indent', quickAccess: true },
      { key: 'stock-transfer', label: 'Stock Transfer', icon: LocalShippingOutlinedIcon, path: '/stock-transfer', quickAccess: true },
      { key: 'stock-receipt', label: 'Stock Receipt', icon: MoveToInboxOutlinedIcon, path: '/stock-receipt', quickAccess: true },
      { key: 'stock-return', label: 'Stock Return', icon: KeyboardReturnOutlinedIcon, path: '/stock-return', quickAccess: true },
      { key: 'stock-wastage', label: 'Stock Wastage', icon: DeleteOutlineOutlinedIcon, path: '/stock-wastage', quickAccess: true },
      { key: 'stock-count', label: 'Stock Count', icon: FactCheckOutlinedIcon, path: '/stock-count', quickAccess: true },
    ],
  },
  {
    key: 'operations',
    items: [
      { key: 'cashier-panel', label: 'Cashier Panel', icon: BadgeOutlinedIcon, path: '/cashier-panel', quickAccess: true },
      { key: 'shift-open', label: 'Shift Open', icon: LockOpenOutlinedIcon, path: '/shift-open', quickAccess: true },
      { key: 'shift-close', label: 'Shift Close', icon: LockOutlinedIcon, path: '/shift-close', quickAccess: true },
      { key: 'expenses-book', label: 'Expenses Book', icon: MenuBookOutlinedIcon, path: '/expenses-book', quickAccess: true },
      { key: 'reports', label: 'Reports', icon: BarChartOutlinedIcon, path: '/reports' },
      { key: 'master-sync', label: 'Master Sync', icon: CloudDoneOutlinedIcon, path: '/master-sync', quickAccess: true },
      { key: 'stock-sync', label: 'Stock Sync', icon: CloudSyncOutlinedIcon, path: '/stock-sync', quickAccess: true },
      { key: 'sap-sync', label: 'SAP Sync', icon: CloudQueueOutlinedIcon, path: '/sap-sync', quickAccess: true },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

// Modules with a Quick Access tile on the Home page, in reference order.
export const QUICK_ACCESS_ITEMS = ALL_NAV_ITEMS.filter((item) => item.quickAccess);
