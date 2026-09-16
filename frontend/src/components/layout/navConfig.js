import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import CloudQueueOutlinedIcon from '@mui/icons-material/CloudQueueOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

/**
 * Single source of truth for the sidebar + "Quick Access" grid on Home.
 * Every module tile in Home's Quick Access reuses this list instead of
 * duplicating labels/icons/routes, so the sidebar and the dashboard tiles
 * can never drift apart.
 *
 * `section` groups items visually (a divider is drawn between groups in the
 * sidebar), matching the spacing break seen in the reference between
 * "Stock Count" and "Cashier Panel".
 *
 * Labels are stored as `labelKey` (an i18next key under `nav.*`, see
 * src/i18n/locales/*.json) rather than a hardcoded English string, so the
 * menu re-renders in whichever language is active. Use the `useNavSections`
 * / `useAllNavItems` / `useQuickAccessItems` hooks below to get the same
 * shape with a translated `label` filled in — don't read `label` off the
 * raw NAV_SECTIONS/ALL_NAV_ITEMS/QUICK_ACCESS_ITEMS constants directly.
 */
export const NAV_SECTIONS = [
  {
    key: 'main',
    items: [
      { key: 'home', labelKey: 'nav.home', icon: HomeOutlinedIcon, path: '/home' },
      { key: 'management-dashboard', labelKey: 'nav.dashboard', icon: SpaceDashboardOutlinedIcon, path: '/dashboard' },
      { key: 'line-sale', labelKey: 'nav.lineSale', icon: PointOfSaleOutlinedIcon, path: '/line-sale', quickAccess: true },
      { key: 'sales-return', labelKey: 'nav.salesReturn', icon: AssignmentReturnOutlinedIcon, path: '/sales-return', quickAccess: true },
      { key: 'promotion', labelKey: 'nav.promotion', icon: CampaignOutlinedIcon, path: '/promotion', quickAccess: true },
      { key: 'gift-voucher', labelKey: 'nav.giftVoucher', icon: CardGiftcardOutlinedIcon, path: '/gift-voucher', quickAccess: true },
      { key: 'loyalty', labelKey: 'nav.loyalty', icon: FavoriteBorderOutlinedIcon, path: '/loyalty', quickAccess: true },
      { key: 'customer', labelKey: 'nav.customer', icon: PeopleAltOutlinedIcon, path: '/customer', quickAccess: true },
      { key: 'sales-quotation', labelKey: 'nav.salesQuotation', icon: DescriptionOutlinedIcon, path: '/sales-quotation', quickAccess: true },
      { key: 'sales-order', labelKey: 'nav.salesOrder', icon: ReceiptLongOutlinedIcon, path: '/sales-order', quickAccess: true },
      { key: 'sales-invoice', labelKey: 'nav.salesInvoice', icon: ReceiptOutlinedIcon, path: '/sales-invoice', quickAccess: true },
      { key: 'barcode-label', labelKey: 'nav.barcodeLabel', icon: QrCode2OutlinedIcon, path: '/barcode-label', quickAccess: true },
      { key: 'stock-indent', labelKey: 'nav.stockIndent', icon: PlaylistAddCheckOutlinedIcon, path: '/stock-indent', quickAccess: true },
      { key: 'stock-transfer', labelKey: 'nav.stockTransfer', icon: LocalShippingOutlinedIcon, path: '/stock-transfer', quickAccess: true },
      { key: 'stock-receipt', labelKey: 'nav.stockReceipt', icon: MoveToInboxOutlinedIcon, path: '/stock-receipt', quickAccess: true },
      { key: 'stock-return', labelKey: 'nav.stockReturn', icon: KeyboardReturnOutlinedIcon, path: '/stock-return', quickAccess: true },
      { key: 'stock-wastage', labelKey: 'nav.stockWastage', icon: DeleteOutlineOutlinedIcon, path: '/stock-wastage', quickAccess: true },
      { key: 'stock-count', labelKey: 'nav.stockCount', icon: FactCheckOutlinedIcon, path: '/stock-count', quickAccess: true },
    ],
  },
  {
    key: 'operations',
    items: [
      { key: 'cashier-panel', labelKey: 'nav.cashierPanel', icon: BadgeOutlinedIcon, path: '/cashier-panel', quickAccess: true },
      { key: 'expenses-book', labelKey: 'nav.expensesBook', icon: MenuBookOutlinedIcon, path: '/expenses-book', quickAccess: true },
      { key: 'reports', labelKey: 'nav.reports', icon: BarChartOutlinedIcon, path: '/reports' },
      { key: 'masters', labelKey: 'nav.masters', icon: SettingsOutlinedIcon, path: '/masters' },
      { key: 'master-sync', labelKey: 'nav.masterSync', icon: CloudDoneOutlinedIcon, path: '/master-sync', quickAccess: true },
      { key: 'stock-sync', labelKey: 'nav.stockSync', icon: CloudSyncOutlinedIcon, path: '/stock-sync', quickAccess: true },
      { key: 'sap-sync', labelKey: 'nav.sapSync', icon: CloudQueueOutlinedIcon, path: '/sap-sync', quickAccess: true },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

// Modules with a Quick Access tile on the Home page, in reference order.
export const QUICK_ACCESS_ITEMS = ALL_NAV_ITEMS.filter((item) => item.quickAccess);

function withTranslatedLabel(item, t) {
  return { ...item, label: t(item.labelKey) };
}

/** NAV_SECTIONS with each item's `label` translated into the active language. */
export function useNavSections() {
  const { t, i18n } = useTranslation();
  return useMemo(
    () => NAV_SECTIONS.map((section) => ({
      ...section,
      items: section.items.map((item) => withTranslatedLabel(item, t)),
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );
}

/** ALL_NAV_ITEMS with each item's `label` translated into the active language. */
export function useAllNavItems() {
  const { t, i18n } = useTranslation();
  return useMemo(
    () => ALL_NAV_ITEMS.map((item) => withTranslatedLabel(item, t)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );
}

/** QUICK_ACCESS_ITEMS with each item's `label` translated into the active language. */
export function useQuickAccessItems() {
  const { t, i18n } = useTranslation();
  return useMemo(
    () => QUICK_ACCESS_ITEMS.map((item) => withTranslatedLabel(item, t)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );
}
