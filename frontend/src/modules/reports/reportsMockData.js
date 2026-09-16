import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
 *
 * `label`/`description` are stored as i18next keys (`i18nKey`, resolved
 * under `reports.*` in src/i18n/locales/*.json); use `useReportItems()`
 * below to get this list with translated `label`/`description` filled in.
 */

export const CASHIER = { name: 'Karthik', code: 'C001' };

export const REPORT_ITEMS = [
  { key: 'sales-report', i18nKey: 'salesReport', icon: BarChartOutlinedIcon, color: '#2563EB', path: '/reports/sales' },
  { key: 'inventory-report', i18nKey: 'inventoryReport', icon: Inventory2OutlinedIcon, color: '#8B5CF6', path: '/reports/inventory' },
  { key: 'purchase-report', i18nKey: 'purchaseReport', icon: ShoppingCartOutlinedIcon, color: '#F26B21', path: '/reports/purchase' },
  { key: 'cashier-reports', i18nKey: 'cashierReports', icon: BadgeOutlinedIcon, color: '#0EA5A4', path: '/reports/cashier' },
  { key: 'financial-reports', i18nKey: 'financialReports', icon: AccountBalanceOutlinedIcon, color: '#22A06B', path: '/reports/financial' },
  { key: 'sap-reports', i18nKey: 'sapReports', icon: CloudQueueOutlinedIcon, color: '#5B6472', path: '/reports/sap' },
];

/** REPORT_ITEMS with `label`/`description` translated into the active language. */
export function useReportItems() {
  const { t, i18n } = useTranslation();
  return useMemo(
    () => REPORT_ITEMS.map((item) => ({
      ...item,
      label: t(`reports.${item.i18nKey}.label`),
      description: t(`reports.${item.i18nKey}.description`),
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );
}
