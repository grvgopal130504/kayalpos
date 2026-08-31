import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ViewInArOutlinedIcon from '@mui/icons-material/ViewInArOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

/**
 * TEMPORARY mock data for the Stock Sync screen. There's no Stock Sync
 * backend module yet, so this static snapshot stands in for a
 * `useGetStockSyncMenuQuery()`. Replace with real API data once that
 * module exists — do not add more mock data here in the meantime.
 */

export const CASHIER = { name: 'Karthik', code: 'C001' };

export const OUTLET_OPTIONS = [
  'Main Outlet', 'Head Office', 'Saravanampatti', 'Peelamedu', 'Singanallur',
];

export const SYNC_STATUS_OPTIONS = ['Success', 'Failed', 'Pending'];

export const DEFAULT_DATE_RANGE = { from: '2026-05-26', to: '2026-05-26' };

export const STOCK_SYNC_ITEMS = [
  { key: 'stock-sync-status', label: 'Stock Sync Status', description: 'View stock synchronization status and last sync details.', icon: CloudSyncOutlinedIcon, color: '#2563EB' },
  { key: 'successful-syncs', label: 'Successful Syncs', description: 'View successfully synced stock transactions.', icon: CheckCircleOutlinedIcon, color: '#22A06B' },
  { key: 'failed-syncs', label: 'Failed Syncs', description: 'View failed stock sync transactions and error summary.', icon: CancelOutlinedIcon, color: '#E5484D' },
  { key: 'pending-syncs', label: 'Pending Syncs', description: 'View pending stock sync transactions awaiting processing.', icon: AccessTimeOutlinedIcon, color: '#F26B21' },
  { key: 'stock-sync-log', label: 'Stock Sync Log', description: 'View detailed stock sync logs and error messages.', icon: PendingActionsOutlinedIcon, color: '#7C3AED' },
  { key: 'stock-reconciliation', label: 'Stock Reconciliation', description: 'Compare POS and SAP stock and view variance details.', icon: ViewInArOutlinedIcon, color: '#0EA5A4' },
  { key: 'sap-document-reference', label: 'SAP Document Reference', description: 'View SAP document references for synced stock data.', icon: DescriptionOutlinedIcon, color: '#F5A623' },
];
