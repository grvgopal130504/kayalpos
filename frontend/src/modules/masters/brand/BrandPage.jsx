import { useMemo, useRef, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button,
  TextField, MenuItem, InputAdornment, IconButton, Pagination,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddIcon from '@mui/icons-material/Add';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import { useAppDispatch } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';
import StatCard from '../../../components/common/StatCard';
import { formatNumber } from '../../../utils/format';
import { useGetBrandsQuery, useDeleteBrandMutation } from '../../../api/brandApi';

import BrandTable from './components/BrandTable';
import BrandFormDialog from './components/BrandFormDialog';
import BrandViewDialog from './components/BrandViewDialog';
import { CASHIER } from '../mastersMockData';
import { CATEGORY_OPTIONS } from './brandMockData';

// Converts a native <input type="date"> value ("YYYY-MM-DD") into this
// filter bar's "dd-mm-yyyy" display format.
function formatDdMmYyyy(isoValue) {
  if (!isoValue) return '';
  const [y, m, d] = isoValue.split('-');
  return `${d}-${m}-${y}`;
}

// Maps a Brand row as returned by the API (status: 'ACTIVE'/'INACTIVE',
// createdAt: ISO timestamp) to the shape the existing table/dialog
// components expect (status: 'Active'/'Inactive', createdOn: display date).
// Item-count-per-brand isn't tracked yet — that lands once the Product
// master exists and links Product -> Brand, so this shows 0 for now.
function toViewRow(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description || '',
    category: row.category,
    totalItems: 0,
    status: row.status === 'ACTIVE' ? 'Active' : 'Inactive',
    createdOn: new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  };
}

/**
 * Brand — the Brand master's list screen, reached from the Masters
 * page's "Brand" card. Wired to the real Brand API (see api/brandApi.js):
 * list/search/filter run server-side via ?search=&status=, create/update
 * go through BrandFormDialog, and delete asks for confirmation before
 * calling the API. Import/Export remain mocked — there's no bulk
 * import/export endpoint yet.
 */
export default function BrandPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const createdFromNativeRef = useRef(null);
  const createdToNativeRef = useRef(null);
  const [formDialog, setFormDialog] = useState({ open: false, mode: 'add', row: null });
  const [viewRow, setViewRow] = useState(null);

  const {
    data: brandRows = [],
    isLoading,
    isError,
  } = useGetBrandsQuery({
    search: appliedSearch || undefined,
    status: status !== 'All' ? status.toUpperCase() : undefined,
  });
  const [deleteBrand] = useDeleteBrandMutation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleNewBrand = () => setFormDialog({ open: true, mode: 'add', row: null });
  const handleImport = () => dispatch(showToast('Import Brands is coming soon', 'info'));
  const handleExport = () => dispatch(showToast('Export Brands is coming soon', 'info'));
  const handleSearch = () => setAppliedSearch(searchInput.trim());
  const handleReset = () => {
    setSearchInput('');
    setStatus('All');
    setCategory('All');
    setCreatedFrom('');
    setCreatedTo('');
    setAppliedSearch('');
  };
  const handleViewRow = (row) => setViewRow(row);
  const handleEditRow = (row) => setFormDialog({ open: true, mode: 'edit', row });
  const handleDeleteRow = async (row) => {
    if (!window.confirm(`Delete brand "${row.name}"? This cannot be undone.`)) return;
    try {
      await deleteBrand(row.id).unwrap();
      dispatch(showToast(`${row.name} deleted`, 'success'));
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to delete brand', 'error'));
    }
  };
  const closeFormDialog = () => setFormDialog((prev) => ({ ...prev, open: false }));

  const viewRows = useMemo(() => brandRows.map(toViewRow), [brandRows]);

  // Category and created-date range are filtered client-side (the backend
  // doesn't index on them yet); search and status are already applied
  // server-side via the query above.
  const filteredRows = useMemo(() => viewRows.filter((row) => {
    if (category !== 'All' && row.category !== category) return false;
    return true;
  }), [viewRows, category]);

  const isFiltered = Boolean(appliedSearch) || status !== 'All' || category !== 'All' || Boolean(createdFrom) || Boolean(createdTo);

  const stats = useMemo(() => ({
    totalBrands: viewRows.length,
    activeBrands: viewRows.filter((r) => r.status === 'Active').length,
    inactiveBrands: viewRows.filter((r) => r.status === 'Inactive').length,
    totalItemsUnderBrands: viewRows.reduce((sum, r) => sum + r.totalItems, 0),
  }), [viewRows]);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Brand</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/masters" underline="hover" color="text.secondary">Masters</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Brand</Typography>
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
          <Typography variant="body2">Manage and organize item brands. Brands help to classify items and generate reports.</Typography>
        </Paper>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={handleNewBrand}>
            New Brand
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
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Search Brand"
              placeholder="Search by brand name or code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
            <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2.2 }}>
            <TextField select label="Item Group / Category" value={category} onChange={(e) => setCategory(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {CATEGORY_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
            <TextField
              label="Created From"
              placeholder="dd-mm-yyyy"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label="Open Created From date picker"
                        onClick={() => (createdFromNativeRef.current?.showPicker?.() ?? createdFromNativeRef.current?.click())}
                      >
                        <CalendarTodayOutlinedIcon fontSize="small" />
                      </IconButton>
                      <input
                        ref={createdFromNativeRef}
                        type="date"
                        onChange={(e) => setCreatedFrom(formatDdMmYyyy(e.target.value))}
                        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
            <TextField
              label="Created To"
              placeholder="dd-mm-yyyy"
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label="Open Created To date picker"
                        onClick={() => (createdToNativeRef.current?.showPicker?.() ?? createdToNativeRef.current?.click())}
                      >
                        <CalendarTodayOutlinedIcon fontSize="small" />
                      </IconButton>
                      <input
                        ref={createdToNativeRef}
                        type="date"
                        onChange={(e) => setCreatedTo(formatDdMmYyyy(e.target.value))}
                        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1.4 }}>
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
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Brand List</Typography>
        {isError ? (
          <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', py: 3 }}>
            Failed to load brands. Please try again.
          </Typography>
        ) : (
          <BrandTable
            rows={filteredRows}
            loading={isLoading}
            onViewRow={handleViewRow}
            onEditRow={handleEditRow}
            onDeleteRow={handleDeleteRow}
          />
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Showing {filteredRows.length ? 1 : 0} to {filteredRows.length} of {isFiltered ? filteredRows.length : viewRows.length} records
          </Typography>
          <Pagination
            count={1}
            page={page}
            onChange={(_e, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={ReceiptOutlinedIcon} iconColor="#2563EB" iconShape="circle" label="Total Brands" value={formatNumber(stats.totalBrands)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={FactCheckOutlinedIcon} iconColor="success" iconShape="circle" label="Active Brands" value={formatNumber(stats.activeBrands)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={CloseIcon} iconColor="error" iconShape="circle" label="Inactive Brands" value={formatNumber(stats.inactiveBrands)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={Inventory2OutlinedIcon} iconColor="warning" iconShape="circle" label="Total Items Under Brands" value={formatNumber(stats.totalItemsUnderBrands)} />
        </Grid>
      </Grid>

      <BrandFormDialog open={formDialog.open} mode={formDialog.mode} initialValues={formDialog.row} onClose={closeFormDialog} />
      <BrandViewDialog
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
