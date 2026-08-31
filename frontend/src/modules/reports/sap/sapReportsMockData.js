import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ReportOutlinedIcon from '@mui/icons-material/ReportOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';

/**
 * TEMPORARY mock data for the SAP Reports screen. There's no Reports
 * backend module yet, so this static snapshot stands in for a
 * `useGetSapReportsMenuQuery()`. Replace with real API data once that
 * module exists — do not add more mock data here in the meantime.
 */

export const CASHIER = { name: 'Karthik', code: 'C001' };

export const OUTLET_OPTIONS = [
  'Main Outlet', 'Head Office', 'Saravanampatti', 'Peelamedu', 'Singanallur',
];

export const SYNC_SOURCE_OPTIONS = ['Manual Sync', 'Scheduled Sync', 'API Sync'];

export const DEFAULT_DATE_RANGE = { from: '2026-05-26', to: '2026-05-26' };

export const SAP_REPORT_ITEMS = [
  { key: 'sap-sync-status', label: 'SAP Sync Status', description: 'View overall SAP integration status and sync health.', icon: AutorenewOutlinedIcon, color: '#2563EB' },
  { key: 'successful-transactions', label: 'Successful Transactions', description: 'View successfully synced transactions and details.', icon: CheckCircleOutlinedIcon, color: '#22A06B' },
  { key: 'failed-transactions', label: 'Failed Transactions', description: 'View failed transactions and error summary.', icon: CancelOutlinedIcon, color: '#E5484D' },
  { key: 'pending-transactions', label: 'Pending Transactions', description: 'View pending transactions awaiting sync.', icon: AccessTimeOutlinedIcon, color: '#F26B21' },
  { key: 'sap-error-log', label: 'SAP Error Log', description: 'View SAP error logs and detailed error messages.', icon: ReportOutlinedIcon, color: '#7C3AED' },
  { key: 'sync-history', label: 'Sync History', description: 'View historical sync activities and execution details.', icon: CalendarMonthOutlinedIcon, color: '#0EA5A4' },
  { key: 'sap-document-reference', label: 'SAP Document Reference', description: 'View SAP document references generated during sync.', icon: DescriptionOutlinedIcon, color: '#F5A623' },
  { key: 'pos-sap-invoice-mapping', label: 'POS Invoice ↔ SAP Invoice Mapping', description: 'View mapping between POS invoices and SAP invoices.', icon: LinkOutlinedIcon, color: '#2563EB' },
];
