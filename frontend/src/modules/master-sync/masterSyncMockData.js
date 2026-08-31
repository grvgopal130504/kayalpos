import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';

/**
 * TEMPORARY mock data for the Master Sync screen. There's no Master Sync
 * backend module yet, so this static snapshot stands in for a
 * `useGetMasterSyncStatusQuery()`. Replace with real API data once that
 * module exists — do not add more mock data here in the meantime.
 */

export const CASHIER = { name: 'Karthik', code: 'C001' };

export const MASTER_SYNC_ITEMS = [
  { key: 'item-master', label: 'Item Master Sync', description: 'Sync item master data from POS to SAP.', icon: Inventory2OutlinedIcon, color: '#2563EB', lastSync: '2026-05-14T10:30:00', status: 'success' },
  { key: 'customer-master', label: 'Customer Master Sync', description: 'Sync customer master data from POS to SAP.', icon: PeopleOutlineOutlinedIcon, color: '#22A06B', lastSync: '2026-05-14T10:32:00', status: 'success' },
  { key: 'supplier-master', label: 'Supplier Master Sync', description: 'Sync supplier master data from POS to SAP.', icon: LocalShippingOutlinedIcon, color: '#F26B21', lastSync: '2026-05-14T10:34:00', status: 'success' },
  { key: 'category-master', label: 'Category Master Sync', description: 'Sync category master data from POS to SAP.', icon: CategoryOutlinedIcon, color: '#7C3AED', lastSync: '2026-05-14T10:36:00', status: 'success' },
  { key: 'uom-master', label: 'UoM Master Sync', description: 'Sync unit of measurement data from POS to SAP.', icon: LocalOfferOutlinedIcon, color: '#0EA5A4', lastSync: '2026-05-14T10:38:00', status: 'success' },
  { key: 'warehouse-master', label: 'Warehouse Master Sync', description: 'Sync warehouse master data from POS to SAP.', icon: WarehouseOutlinedIcon, color: '#E5484D', lastSync: '2026-05-14T10:40:00', status: 'success' },
  { key: 'salesperson-master', label: 'Salesperson Master Sync', description: 'Sync salespreson master data from POS to SAP.', icon: PeopleAltOutlinedIcon, color: '#F5A623', lastSync: '2026-05-14T10:42:00', status: 'success' },
  { key: 'other-master', label: 'Other Master Sync', description: 'Sync other master data from POS to SAP.', icon: MoreHorizOutlinedIcon, color: '#9B87F5', lastSync: '2026-05-14T10:44:00', status: 'success' },
];
