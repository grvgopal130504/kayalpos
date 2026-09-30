import { useMemo, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button,
  TextField, MenuItem, InputAdornment,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';

import { useAppDispatch } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';
import StatCard from '../../../components/common/StatCard';
import { formatNumber } from '../../../utils/format';
import { useGetBrandsQuery, useDeleteBrandMutation } from '../../../api/brandApi';
import { CASHIER } from '../mastersMockData';

import BrandTable from './components/BrandTable';
import BrandFormDialog from './components/BrandFormDialog';
import BrandViewDialog from './components/BrandViewDialog';

// Maps a Brand row as returned by the API (status: 'ACTIVE'/'INACTIVE') to
// the shape the table/dialogs expect (status: 'Active'/'Inactive'), same
// convention as ProductPage's toViewRow.
function toViewRow(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    description: row.description || '',
    status: row.status === 'ACTIVE' ? 'Active' : 'Inactive',
  };
}

/**
 * Brand — the Masters > Brand master, a single page/route
 * (`/masters/brand`, no separate add/edit/view routes): the list, search/
 * status filter, and Add/Edit/View all live here, with Add/Edit opening
 * BrandFormDialog and View opening BrandViewDialog as dialogs over this
 * same page — the same pattern ProductPage uses, chosen over the
 * Outlet/Warehouse tabbed full-page pattern because Brand has only a
 * handful of flat fields (name, category, description, status) and no
 * sub-resources like Contact Person, so a dialog is enough and avoids the
 * overhead of a multi-tab detail screen. List/search/status filtering run
 * server-side against the real Brand API (see api/brandApi.js).
 */
export default function BrandPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('All');
  const [appliedSearch, setAppliedSearch] = useState('');
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
  const handleSearch = () => setAppliedSearch(searchInput.trim());
  const handleReset = () => {
    setSearchInput('');
    setStatus('All');
    setAppliedSearch('');
  };
  const handleOpenBrand = (row) => setViewRow(row);
  const handleEditRow = (row) => setFormDialog({ open: true, mode: 'edit', row });
  const closeFormDialog = () => setFormDialog((prev) => ({ ...prev, open: false }));
  const handleDeleteRow = async (row) => {
    if (!window.confirm(`Delete brand "${row.name}"? This cannot be undone.`)) return;
    try {
      await deleteBrand(row.id).unwrap();
      dispatch(showToast(`${row.name} deleted`, 'success'));
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to delete brand', 'error'));
    }
  };

  const viewRows = useMemo(() => brandRows.map(toViewRow), [brandRows]);

  const stats = useMemo(() => ({
    total: viewRows.length,
    active: viewRows.filter((r) => r.status === 'Active').length,
    inactive: viewRows.filter((r) => r.status === 'Inactive').length,
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

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard icon={CardGiftcardOutlinedIcon} iconColor="#E5484D" iconShape="circle" label="Total Brands" value={formatNumber(stats.total)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard icon={FactCheckOutlinedIcon} iconColor="success" iconShape="circle" label="Active Brands" value={formatNumber(stats.active)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard icon={HighlightOffOutlinedIcon} iconColor="error" iconShape="circle" label="Inactive Brands" value={formatNumber(stats.inactive)} />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Grid container spacing={1.5} sx={{ alignItems: 'flex-end' }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
            <Button variant="contained" color="primary" startIcon={<SearchIcon fontSize="small" />} onClick={handleSearch} fullWidth>
              Search
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
            <Button variant="outlined" color="inherit" startIcon={<CloseIcon fontSize="small" />} onClick={handleReset} fullWidth>
              Reset
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 3 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button variant="contained" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={handleNewBrand} fullWidth>
              New Brand
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
          <Box sx={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
            <BrandTable rows={viewRows} onOpenBrand={handleOpenBrand} onEditRow={handleEditRow} onDeleteRow={handleDeleteRow} />
          </Box>
        )}

        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
          Showing {viewRows.length} of {viewRows.length} records
        </Typography>
      </Paper>

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
