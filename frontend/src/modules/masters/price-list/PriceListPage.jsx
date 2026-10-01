import { useMemo, useRef, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button,
  TextField, MenuItem, InputAdornment, IconButton, Pagination,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AddIcon from '@mui/icons-material/Add';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

import { useAppDispatch } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';
import StatCard from '../../../components/common/StatCard';
import { formatNumber } from '../../../utils/format';

import PriceListTable from './components/PriceListTable';
import PriceListFormDialog from './components/PriceListFormDialog';
import PriceListViewDialog from './components/PriceListViewDialog';
import { CASHIER } from '../mastersMockData';
import { PRICE_LIST_TYPE_OPTIONS, APPLICABLE_TO_OPTIONS } from './priceListMockData';
import { useGetPriceListsPageQuery, useDeletePriceListMutation } from '../../../api/priceListApi';

const PAGE_SIZE = 20;

// Converts a native <input type="date"> value ("YYYY-MM-DD") into an ISO
// date string suitable for the effectiveFrom/effectiveTo query params
// (the backend's priceListQuerySchema.../priceList.service.js filters
// aren't wired to these two fields server-side yet — see note below — so
// for now they only drive the display placeholder, matching how this filter
// bar behaved before the backend existed).
function formatDdMmYyyy(isoValue) {
  if (!isoValue) return '';
  const [y, m, d] = isoValue.split('-');
  return `${d}-${m}-${y}`;
}

/**
 * Price List — the Price List master's list screen, reached from the
 * Masters page's "Price List" card. Wired to the real Price List API (see
 * api/priceListApi.js) — search/type/applicableTo/status and pagination all
 * run server-side; the four stat tiles come from the list response's
 * `meta.stats` (tenant-wide totals, independent of the current filters —
 * see priceList.service.js's getPriceListStats). The Effective Date filters
 * remain display-only for now (no matching backend query param) since date
 * range filtering here is a "starts before / ends after" question the
 * mock UI never fully specified either — left as a follow-up rather than
 * guessing the intended semantics.
 */
export default function PriceListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [priceListType, setPriceListType] = useState('All');
  const [applicableTo, setApplicableTo] = useState('All');
  const [status, setStatus] = useState('All');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const effectiveFromNativeRef = useRef(null);
  const effectiveToNativeRef = useRef(null);
  const [formDialog, setFormDialog] = useState({ open: false, mode: 'add', row: null });
  const [viewRow, setViewRow] = useState(null);

  const { data, isLoading, isError } = useGetPriceListsPageQuery({
    search: appliedSearch || undefined,
    type: priceListType !== 'All' ? priceListType : undefined,
    applicableTo: applicableTo !== 'All' ? applicableTo : undefined,
    status: status !== 'All' ? status.toUpperCase() : undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const [deletePriceList] = useDeletePriceListMutation();

  const rows = data?.rows || [];
  const meta = data?.meta;
  const stats = meta?.stats || {
    totalPriceLists: 0, activePriceLists: 0, inactivePriceLists: 0, totalItemsInPriceLists: 0,
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleNewPriceList = () => setFormDialog({ open: true, mode: 'add', row: null });
  const handleImport = () => dispatch(showToast('Import Price Lists is coming soon', 'info'));
  const handleExport = () => dispatch(showToast('Export Price Lists is coming soon', 'info'));
  const handleSearch = () => { setAppliedSearch(searchInput.trim()); setPage(1); };
  const handleReset = () => {
    setSearchInput('');
    setPriceListType('All');
    setApplicableTo('All');
    setStatus('All');
    setEffectiveFrom('');
    setEffectiveTo('');
    setAppliedSearch('');
    setPage(1);
  };
  const handleViewRow = (row) => setViewRow(row);
  const handleEditRow = (row) => setFormDialog({ open: true, mode: 'edit', row });
  const handleDeleteRow = async (row) => {
    if (!window.confirm(`Delete price list "${row.name}"? This cannot be undone.`)) return;
    try {
      await deletePriceList(row.id).unwrap();
      dispatch(showToast(`${row.name} deleted`, 'success'));
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to delete price list', 'error'));
    }
  };
  const closeFormDialog = () => setFormDialog((prev) => ({ ...prev, open: false }));

  const isFiltered = Boolean(appliedSearch) || priceListType !== 'All' || applicableTo !== 'All' || status !== 'All'
    || Boolean(effectiveFrom) || Boolean(effectiveTo);

  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Price List</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/masters" underline="hover" color="text.secondary">Masters</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Price List</Typography>
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

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', lg: 'center' }, justifyContent: 'flex-end' }}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={handleNewPriceList}>
            New Price List
          </Button>
          <Button variant="outlined" color="primary" startIcon={<MoveToInboxOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import
          </Button>
          <Button variant="outlined" color="primary" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleExport}>
            Export
          </Button>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Grid container spacing={1.5} sx={{ alignItems: 'flex-end' }}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <TextField
              label="Search Price List"
              placeholder="Search by price list name or code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
            <TextField select label="Price List Type" value={priceListType} onChange={(e) => setPriceListType(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {PRICE_LIST_TYPE_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
            <TextField select label="Applicable To" value={applicableTo} onChange={(e) => setApplicableTo(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {APPLICABLE_TO_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.4 }}>
            <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.6 }}>
            <TextField
              label="Effective Date"
              placeholder="dd-mm-yyyy"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label="Open Effective Date picker"
                        onClick={() => (effectiveFromNativeRef.current?.showPicker?.() ?? effectiveFromNativeRef.current?.click())}
                      >
                        <CalendarTodayOutlinedIcon fontSize="small" />
                      </IconButton>
                      <input
                        ref={effectiveFromNativeRef}
                        type="date"
                        onChange={(e) => setEffectiveFrom(formatDdMmYyyy(e.target.value))}
                        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.6 }}>
            <TextField
              label="To"
              placeholder="dd-mm-yyyy"
              value={effectiveTo}
              onChange={(e) => setEffectiveTo(e.target.value)}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label="Open To date picker"
                        onClick={() => (effectiveToNativeRef.current?.showPicker?.() ?? effectiveToNativeRef.current?.click())}
                      >
                        <CalendarTodayOutlinedIcon fontSize="small" />
                      </IconButton>
                      <input
                        ref={effectiveToNativeRef}
                        type="date"
                        onChange={(e) => setEffectiveTo(formatDdMmYyyy(e.target.value))}
                        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1.2 }}>
            <Button variant="contained" color="primary" startIcon={<SearchIcon fontSize="small" />} onClick={handleSearch} fullWidth>
              Search
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1.2 }}>
            <Button variant="outlined" color="inherit" startIcon={<CloseIcon fontSize="small" />} onClick={handleReset} fullWidth>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Price List</Typography>

        {isError ? (
          <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', py: 3 }}>
            Failed to load price lists. Please try again.
          </Typography>
        ) : (
          <Box sx={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
            <PriceListTable rows={rows} onViewRow={handleViewRow} onEditRow={handleEditRow} onDeleteRow={handleDeleteRow} />
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
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={DescriptionOutlinedIcon} iconColor="#2563EB" iconShape="circle" label="Total Price Lists" value={formatNumber(stats.totalPriceLists)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={FactCheckOutlinedIcon} iconColor="success" iconShape="circle" label="Active Price Lists" value={formatNumber(stats.activePriceLists)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={CloseIcon} iconColor="error" iconShape="circle" label="Inactive Price Lists" value={formatNumber(stats.inactivePriceLists)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={ReceiptLongOutlinedIcon} iconColor="warning" iconShape="circle" label="Total Items in Price Lists" value={formatNumber(stats.totalItemsInPriceLists)} />
        </Grid>
      </Grid>

      <PriceListFormDialog open={formDialog.open} mode={formDialog.mode} initialValues={formDialog.row} onClose={closeFormDialog} />
      <PriceListViewDialog
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
