import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button,
  TextField, MenuItem, InputAdornment,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ViewInArOutlinedIcon from '@mui/icons-material/ViewInArOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';

import { useAppDispatch } from '../../../app/hooks';
import { showToast } from '../../../features/ui/uiSlice';
import StatCard from '../../../components/common/StatCard';
import { formatNumber } from '../../../utils/format';
import { useGetBrandsQuery, useDeleteBrandMutation } from '../../../api/brandApi';
import { useGetProductsQuery } from '../../../api/productApi';
import { CATEGORY_OPTIONS } from './brandMockData';

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
    createdAt: row.createdAt,
  };
}

// Label above the control (instead of a floating label), as in the
// reference filter bar.
function FilterField({ label, children }) {
  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>{label}</Typography>
      {children}
    </Box>
  );
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

  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  // Search text, category and the created-date range are applied when the
  // Search button is clicked (status filters immediately, as before).
  const [applied, setApplied] = useState({ search: '', category: 'All', createdFrom: '', createdTo: '' });
  const [formDialog, setFormDialog] = useState({ open: false, mode: 'add', row: null });
  const [viewRow, setViewRow] = useState(null);

  const {
    data: brandRows = [],
    isLoading,
    isError,
  } = useGetBrandsQuery({
    search: applied.search || undefined,
    status: status !== 'All' ? status.toUpperCase() : undefined,
  });
  const [deleteBrand] = useDeleteBrandMutation();
  // Product.brand stores the brand's name, so "items under brands" is the
  // number of products whose brand matches a listed brand.
  const { data: productRows = [] } = useGetProductsQuery();


  const handleNewBrand = () => setFormDialog({ open: true, mode: 'add', row: null });
  const handleImport = () => dispatch(showToast('Import Brands is coming soon', 'info'));
  const handleExport = () => dispatch(showToast('Export Brands is coming soon', 'info'));
  const handleSearch = () => setApplied({ search: searchInput.trim(), category, createdFrom, createdTo });
  const handleReset = () => {
    setSearchInput('');
    setStatus('All');
    setCategory('All');
    setCreatedFrom('');
    setCreatedTo('');
    setApplied({ search: '', category: 'All', createdFrom: '', createdTo: '' });
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

  // Category and created-date filters run client-side on the fetched rows.
  const viewRows = useMemo(() => {
    const from = applied.createdFrom ? new Date(`${applied.createdFrom}T00:00:00`) : null;
    const to = applied.createdTo ? new Date(`${applied.createdTo}T23:59:59.999`) : null;
    return brandRows.map(toViewRow).filter((r) => {
      if (applied.category !== 'All' && r.category !== applied.category) return false;
      if (from || to) {
        const created = r.createdAt ? new Date(r.createdAt) : null;
        if (!created) return false;
        if (from && created < from) return false;
        if (to && created > to) return false;
      }
      return true;
    });
  }, [brandRows, applied]);

  // Products per brand name (lower-cased) — drives the table's Total Items
  // column and the "Total Items Under Brands" card.
  const itemCounts = useMemo(() => {
    const counts = {};
    productRows.forEach((p) => {
      if (!p.brand) return;
      const key = String(p.brand).trim().toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [productRows]);

  const stats = useMemo(() => ({
    total: viewRows.length,
    active: viewRows.filter((r) => r.status === 'Active').length,
    inactive: viewRows.filter((r) => r.status === 'Inactive').length,
    items: viewRows.reduce((sum, r) => sum + (itemCounts[r.name.trim().toLowerCase()] || 0), 0),
  }), [viewRows, itemCounts]);

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
      </Stack>

      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
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

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Grid container spacing={1.5} sx={{ alignItems: 'flex-end' }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FilterField label="Search Brand">
              <TextField
                placeholder="Search by brand name or code..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                fullWidth
                slotProps={{ input: { endAdornment: <InputAdornment position="end"><SearchIcon fontSize="small" /></InputAdornment> } }}
              />
            </FilterField>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
            <FilterField label="Status">
              <TextField select value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </FilterField>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <FilterField label="Item Group / Category">
              <TextField select value={category} onChange={(e) => setCategory(e.target.value)} fullWidth>
                <MenuItem value="All">All</MenuItem>
                {CATEGORY_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            </FilterField>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 1.75 }}>
            <FilterField label="Created From">
              <TextField type="date" value={createdFrom} onChange={(e) => setCreatedFrom(e.target.value)} fullWidth slotProps={{ htmlInput: { max: createdTo || undefined } }} />
            </FilterField>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 1.75 }}>
            <FilterField label="Created To">
              <TextField type="date" value={createdTo} onChange={(e) => setCreatedTo(e.target.value)} fullWidth slotProps={{ htmlInput: { min: createdFrom || undefined } }} />
            </FilterField>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" color="primary" startIcon={<SearchIcon fontSize="small" />} onClick={handleSearch} fullWidth>
              Search
            </Button>
            <Button variant="outlined" color="primary" startIcon={<RefreshOutlinedIcon fontSize="small" />} onClick={handleReset} fullWidth>
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
          <Box sx={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
            <BrandTable rows={viewRows} itemCounts={itemCounts} onOpenBrand={handleOpenBrand} onEditRow={handleEditRow} onDeleteRow={handleDeleteRow} />
          </Box>
        )}

        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
          Showing {viewRows.length} of {viewRows.length} records
        </Typography>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={LocalOfferOutlinedIcon} iconColor="#2563EB" iconShape="circle" label="Total Brands" value={formatNumber(stats.total)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={CheckCircleOutlineIcon} iconColor="success" iconShape="circle" label="Active Brands" value={formatNumber(stats.active)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={HighlightOffOutlinedIcon} iconColor="error" iconShape="circle" label="Inactive Brands" value={formatNumber(stats.inactive)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={ViewInArOutlinedIcon} iconColor="#F26B21" iconShape="circle" label="Total Items Under Brands" value={formatNumber(stats.items)} />
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
