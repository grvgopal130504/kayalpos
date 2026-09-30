import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button, Menu, MenuItem,
  TextField, InputAdornment, InputBase, Pagination,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddIcon from '@mui/icons-material/Add';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';

import { useAppDispatch } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';
import StatCard from '../../../components/common/StatCard';
import { formatNumber } from '../../../utils/format';

import BatchSerialTable from './components/BatchSerialTable';
import BatchSerialFormDialog from './components/BatchSerialFormDialog';
import BatchSerialViewDialog from './components/BatchSerialViewDialog';
import { CASHIER } from '../mastersMockData';
import { BATCH_SERIAL_TYPE_OPTIONS } from './batchSerialMockData';
import { useGetWarehousesQuery } from '../../../api/warehouseApi';
import { useGetBatchSerialsPageQuery, useDeleteBatchSerialMutation } from '../../../api/batchSerialApi';

const PAGE_SIZE = 20;

/**
 * Batch / Serial Number Information — the Batch/Serial master's list
 * screen, reached from the Masters page's "Batch or Serial Number" card.
 * Wired to the real Batch/Serial API (see api/batchSerialApi.js) — search/
 * type/warehouse/status and pagination all run server-side; the five stat
 * tiles come from the list response's `meta.stats` (tenant-wide totals,
 * independent of the current filters — see batchSerial.service.js's
 * getBatchSerialStats). The Date Range filter stays display-only for now
 * (no matching backend query param) — same accepted gap as Price List's
 * Effective Date filter, left as a follow-up rather than guessing whether
 * it should filter by mfgDate, expiryDate, or createdAt.
 */
export default function BatchSerialPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [batchSerialType, setBatchSerialType] = useState('All');
  const [warehouse, setWarehouse] = useState('All');
  const [status, setStatus] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formDialog, setFormDialog] = useState({ open: false, mode: 'add', row: null });
  const [viewRow, setViewRow] = useState(null);

  // Warehouse is an `isActive` boolean model, not a `status` enum — see the
  // same note in BatchSerialFormDialog.jsx.
  const { data: warehouses = [] } = useGetWarehousesQuery({ isActive: true });

  const { data, isLoading, isError } = useGetBatchSerialsPageQuery({
    search: appliedSearch || undefined,
    type: batchSerialType !== 'All' ? batchSerialType.toUpperCase() : undefined,
    warehouseId: warehouse !== 'All' ? warehouse : undefined,
    status: status !== 'All' ? status.toUpperCase() : undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const [deleteBatchSerial] = useDeleteBatchSerialMutation();

  const rows = data?.rows || [];
  const meta = data?.meta;
  const stats = meta?.stats || {
    totalBatches: 0, totalSerials: 0, totalItemsTracked: 0, warehousesOutlets: 0, totalAvailableQty: 0,
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleNewBatchSerial = () => setFormDialog({ open: true, mode: 'add', row: null });
  const handleImport = () => dispatch(showToast('Import Batch/Serial records is coming soon', 'info'));
  const handleExport = () => dispatch(showToast('Export Batch/Serial records is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };
  const handleSearch = () => { setAppliedSearch(searchInput.trim()); setPage(1); };
  const handleReset = () => {
    setSearchInput('');
    setBatchSerialType('All');
    setWarehouse('All');
    setStatus('All');
    setDateFrom('');
    setDateTo('');
    setAppliedSearch('');
    setPage(1);
  };
  const handleOpenRow = (row) => setViewRow(row);
  const handleEditRow = (row) => setFormDialog({ open: true, mode: 'edit', row });
  const handleDeleteRow = async (row) => {
    if (!window.confirm(`Delete batch / serial "${row.number}"? This cannot be undone.`)) return;
    try {
      await deleteBatchSerial(row.id).unwrap();
      dispatch(showToast(`${row.number} deleted`, 'success'));
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to delete batch / serial record', 'error'));
    }
  };
  const closeFormDialog = () => setFormDialog((prev) => ({ ...prev, open: false }));

  const isFiltered = Boolean(appliedSearch) || batchSerialType !== 'All' || warehouse !== 'All' || status !== 'All'
    || Boolean(dateFrom) || Boolean(dateTo);

  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Batch / Serial Number Information</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/masters" underline="hover" color="text.secondary">Masters</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Batch / Serial Number Information</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB' }}>
            Cashier : {CASHIER.name} ({CASHIER.code})
          </Typography>
          <MuiLink
            component="button"
            type="button"
            variant="body2"
            underline="hover"
            onClick={handleLogout}
            sx={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#2563EB' }}
          >
            <LogoutOutlinedIcon fontSize="inherit" /> Logout
          </MuiLink>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', lg: 'center' }, justifyContent: 'space-between' }}>
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3, p: { xs: 1.75, sm: 2 }, display: 'flex', alignItems: 'center', gap: 1.5, flex: 1,
            bgcolor: 'rgba(37,99,235,0.06)', borderColor: 'rgba(37,99,235,0.25)',
          }}
        >
          <Box
            sx={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: '#2563EB', color: '#fff',
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Manage batch and serial numbers for your inventory items.</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Track manufacturing, expiry, warranty and other details.
            </Typography>
          </Box>
        </Paper>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={handleNewBatchSerial}>
            New Batch/Serial
          </Button>
          <Button variant="outlined" color="primary" startIcon={<MoveToInboxOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import
          </Button>
          <Button variant="outlined" color="primary" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleExport}>
            Export
          </Button>
          <Button variant="outlined" color="inherit" startIcon={<MoreVertOutlinedIcon fontSize="small" />} onClick={(e) => setMoreAnchor(e.currentTarget)}>
            More
          </Button>
          <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)}>
            <MenuItem onClick={() => handleMoreAction('Print Batch/Serial List')}>Print Batch/Serial List</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Mark Expired Batches')}>Mark Expired Batches</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Deactivate Selected')}>Deactivate Selected</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Grid container spacing={1.5} sx={{ alignItems: 'flex-end' }}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <TextField
              label="Item Code / Name"
              placeholder="Search by item code or name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
            <TextField select label="Batch / Serial Type" value={batchSerialType} onChange={(e) => setBatchSerialType(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {BATCH_SERIAL_TYPE_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
            <TextField select label="Warehouse / Outlet" value={warehouse} onChange={(e) => setWarehouse(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {warehouses.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.4 }}>
            <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.6 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              Date Range
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, height: 40, borderRadius: 1,
              }}
            >
              <InputBase
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                sx={{ fontSize: 13, flex: 1, minWidth: 0 }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>To</Typography>
              <InputBase
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                sx={{ fontSize: 13, flex: 1, minWidth: 0 }}
              />
              <CalendarTodayOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1 }}>
            <Button variant="contained" color="primary" startIcon={<SearchIcon fontSize="small" />} onClick={handleSearch} fullWidth>
              Search
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1 }}>
            <Button variant="outlined" color="inherit" startIcon={<CloseIcon fontSize="small" />} onClick={handleReset} fullWidth>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Batch / Serial Number List</Typography>

        {isError ? (
          <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', py: 3 }}>
            Failed to load batch / serial records. Please try again.
          </Typography>
        ) : (
          <Box sx={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
            <BatchSerialTable rows={rows} onOpenRow={handleOpenRow} onEditRow={handleEditRow} onDeleteRow={handleDeleteRow} />
          </Box>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Showing {rangeStart} to {rangeEnd} of {formatNumber(total)} records{isFiltered ? ' (filtered)' : ''}
          </Typography>
          <Pagination count={totalPages} page={page} onChange={(_e, value) => setPage(value)} color="primary" shape="rounded" />
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={DescriptionOutlinedIcon} iconColor="#7C3AED" iconShape="circle" label="Total Batches" value={formatNumber(stats.totalBatches)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={QrCode2OutlinedIcon} iconColor="success" iconShape="circle" label="Total Serials" value={formatNumber(stats.totalSerials)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={Inventory2OutlinedIcon} iconColor="#F5A623" iconShape="circle" label="Total Items Tracked" value={formatNumber(stats.totalItemsTracked)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={ApartmentOutlinedIcon} iconColor="#2563EB" iconShape="circle" label="Warehouses / Outlets" value={formatNumber(stats.warehousesOutlets)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard
            icon={SellOutlinedIcon}
            iconColor="#F26B21"
            iconShape="circle"
            label="Total Available Qty"
            value={Number(stats.totalAvailableQty).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          />
        </Grid>
      </Grid>

      <BatchSerialFormDialog open={formDialog.open} mode={formDialog.mode} initialValues={formDialog.row} onClose={closeFormDialog} />
      <BatchSerialViewDialog
        open={Boolean(viewRow)}
        row={viewRow}
        onClose={() => setViewRow(null)}
        onEdit={() => {
          const row = viewRow;
          setViewRow(null);
          setFormDialog({ open: true, mode: 'edit', row });
        }}
      />
    </Stack>
  );
}
