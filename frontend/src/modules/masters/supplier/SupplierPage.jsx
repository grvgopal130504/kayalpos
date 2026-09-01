import { useMemo, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button,
  TextField, MenuItem, InputAdornment, Pagination,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddIcon from '@mui/icons-material/Add';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';

import { useAppDispatch } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';
import StatCard from '../../../components/common/StatCard';
import { formatNumber, formatCurrency } from '../../../utils/format';

import SupplierTable from './components/SupplierTable';
import SupplierFormDialog from './components/SupplierFormDialog';
import SupplierViewDialog from './components/SupplierViewDialog';
import { CASHIER } from '../mastersMockData';
import {
  SUPPLIERS, SUPPLIER_GROUP_OPTIONS, CITY_OPTIONS, STATE_OPTIONS,
  supplierTotalRecords, supplierTotalPages, STATS,
} from './supplierMockData';

/**
 * Supplier — the Supplier master's list screen, reached from the Masters
 * page's "Supplier" card. Same searchable/filterable list shape as the
 * other Masters list pages (filter bar + table + records footer + bottom
 * stat row). Filters run client-side over the mocked first page of
 * SUPPLIERS; every row action and the New Supplier/Import/Export buttons
 * are mocked — there's no Supplier backend module yet.
 */
export default function SupplierPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [group, setGroup] = useState('All');
  const [status, setStatus] = useState('All');
  const [city, setCity] = useState('All');
  const [state, setState] = useState('All');
  const [gstRegistered, setGstRegistered] = useState('All');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formDialog, setFormDialog] = useState({ open: false, mode: 'add', row: null });
  const [viewRow, setViewRow] = useState(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleNewSupplier = () => setFormDialog({ open: true, mode: 'add', row: null });
  const handleImport = () => dispatch(showToast('Import Suppliers is coming soon', 'info'));
  const handleExport = () => dispatch(showToast('Export Suppliers is coming soon', 'info'));
  const handleSearch = () => setAppliedSearch(searchInput.trim().toLowerCase());
  const handleReset = () => {
    setSearchInput('');
    setGroup('All');
    setStatus('All');
    setCity('All');
    setState('All');
    setGstRegistered('All');
    setAppliedSearch('');
  };
  const handleOpenSupplier = (row) => setViewRow(row);
  const handleEditRow = (row) => setFormDialog({ open: true, mode: 'edit', row });
  const handleDeleteRow = (row) => dispatch(showToast(`Delete ${row.name} is coming soon`, 'info'));
  const closeFormDialog = () => setFormDialog((prev) => ({ ...prev, open: false }));

  const filteredRows = useMemo(() => SUPPLIERS.filter((row) => {
    if (appliedSearch) {
      const haystack = `${row.code} ${row.name} ${row.email}`.toLowerCase();
      if (!haystack.includes(appliedSearch)) return false;
    }
    if (group !== 'All' && row.group !== group) return false;
    if (status !== 'All' && row.status !== status) return false;
    if (city !== 'All' && row.city !== city) return false;
    if (state !== 'All' && row.state !== state) return false;
    if (gstRegistered !== 'All') {
      const hasGst = Boolean(row.gstNo);
      if (gstRegistered === 'Yes' && !hasGst) return false;
      if (gstRegistered === 'No' && hasGst) return false;
    }
    return true;
  }), [appliedSearch, group, status, city, state, gstRegistered]);

  const isFiltered = Boolean(appliedSearch) || group !== 'All' || status !== 'All' || city !== 'All' || state !== 'All' || gstRegistered !== 'All';

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Supplier</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/masters" underline="hover" color="text.secondary">Masters</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Supplier</Typography>
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
          <Typography variant="body2">Create and manage supplier information. Suppliers provide the products and services for your business.</Typography>
        </Paper>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={handleNewSupplier}>
            New Supplier
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
              label="Search Supplier"
              placeholder="Search by name, code or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <TextField select label="Supplier Group" value={group} onChange={(e) => setGroup(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {SUPPLIER_GROUP_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.5 }}>
            <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.5 }}>
            <TextField select label="City" value={city} onChange={(e) => setCity(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {CITY_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.5 }}>
            <TextField select label="State" value={state} onChange={(e) => setState(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {STATE_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.5 }}>
            <TextField select label="GST Registered" value={gstRegistered} onChange={(e) => setGstRegistered(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>
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
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Supplier List</Typography>
        <SupplierTable rows={filteredRows} onOpenSupplier={handleOpenSupplier} onEditRow={handleEditRow} onDeleteRow={handleDeleteRow} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Showing {filteredRows.length ? 1 : 0} to {filteredRows.length} of {isFiltered ? filteredRows.length : supplierTotalRecords} records
          </Typography>
          <Pagination
            count={isFiltered ? 1 : supplierTotalPages}
            page={page}
            onChange={(_e, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={PeopleAltOutlinedIcon} iconColor="#7C3AED" iconShape="circle" label="Total Suppliers" value={formatNumber(STATS.totalSuppliers)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={FactCheckOutlinedIcon} iconColor="success" iconShape="circle" label="Active Suppliers" value={formatNumber(STATS.activeSuppliers)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={CloseIcon} iconColor="error" iconShape="circle" label="Inactive Suppliers" value={formatNumber(STATS.inactiveSuppliers)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={StorefrontIcon} iconColor="#2563EB" iconShape="circle" label="GST Registered" value={formatNumber(STATS.gstRegistered)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={CurrencyRupeeOutlinedIcon} iconColor="warning" iconShape="circle" label="Total Payable" value={formatCurrency(STATS.totalPayable, { decimals: true })} />
        </Grid>
      </Grid>

      <SupplierFormDialog open={formDialog.open} mode={formDialog.mode} initialValues={formDialog.row} onClose={closeFormDialog} />
      <SupplierViewDialog
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
