import { useMemo, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button,
  TextField, MenuItem, InputAdornment,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddIcon from '@mui/icons-material/Add';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';

import { useAppDispatch } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';
import StatCard from '../../../components/common/StatCard';
import { formatNumber } from '../../../utils/format';
import { formatPickerDate } from '../../../components/form/FormDatePicker';

import HsnSacTable from './components/HsnSacTable';
import HsnSacFormDialog from './components/HsnSacFormDialog';
import HsnSacViewDialog from './components/HsnSacViewDialog';
import { CASHIER } from '../mastersMockData';
import { TYPE_OPTIONS, CHAPTER_OPTIONS, TAX_RATE_OPTIONS } from './createHsnSacSchema';
import { useGetHsnSacCodesQuery, useDeleteHsnSacMutation } from '../../../api/hsnSacApi';

/**
 * HSN / SAC — the HSN/SAC master's list screen, reached from the Masters
 * page's "HSN/SAC" card. Wired to the real HSN/SAC API (see
 * api/hsnSacApi.js) — search/status run server-side; Type/Chapter/Tax Rate
 * filters run client-side over whatever the current search/status filter
 * returned (no backend aggregation endpoint for those), same convention as
 * TaxCodePage's Tax Type/Tax Category filters. Same single-page-list
 * pattern as Brand/UOM/Tax Code (server already caps the unpaginated list
 * at 1000 rows — see backend/src/utils/crudFactory.js), so there's no fake
 * pagination here.
 */
export default function HsnSacPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [type, setType] = useState('All');
  const [chapter, setChapter] = useState('All');
  const [taxRate, setTaxRate] = useState('All');
  const [status, setStatus] = useState('All');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [formDialog, setFormDialog] = useState({ open: false, mode: 'add', row: null });
  const [viewRow, setViewRow] = useState(null);

  const {
    data: rows = [],
    isLoading,
    isError,
  } = useGetHsnSacCodesQuery({
    search: appliedSearch || undefined,
    status: status !== 'All' ? status.toUpperCase() : undefined,
  });
  const [deleteHsnSac] = useDeleteHsnSacMutation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleNewHsnSac = () => setFormDialog({ open: true, mode: 'add', row: null });
  const handleImport = () => dispatch(showToast('Import HSN / SAC codes is coming soon', 'info'));
  const handleExport = () => dispatch(showToast('Export HSN / SAC codes is coming soon', 'info'));
  const handleSearch = () => setAppliedSearch(searchInput.trim());
  const handleReset = () => {
    setSearchInput('');
    setType('All');
    setChapter('All');
    setTaxRate('All');
    setStatus('All');
    setAppliedSearch('');
  };
  const handleViewRow = (row) => setViewRow(row);
  const handleEditRow = (row) => setFormDialog({ open: true, mode: 'edit', row });
  const handleDeleteRow = async (row) => {
    if (!window.confirm(`Delete HSN / SAC code "${row.code}"? This cannot be undone.`)) return;
    try {
      await deleteHsnSac(row.id).unwrap();
      dispatch(showToast(`${row.code} deleted`, 'success'));
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to delete HSN / SAC code', 'error'));
    }
  };
  const closeFormDialog = () => setFormDialog((prev) => ({ ...prev, open: false }));

  // Flatten each raw API row (status 'ACTIVE'/'INACTIVE', taxRate as a
  // Decimal serialized to string, effectiveFrom as an ISO date string) to
  // the view shape the table/view dialog expect (status
  // 'Active'/'Inactive', taxRate as a number, effectiveFrom as the app-wide
  // "DD Mon YYYY" display string).
  const viewRows = useMemo(() => rows.map((row) => ({
    ...row,
    taxRate: row.taxRate != null ? Number(row.taxRate) : null,
    effectiveFrom: row.effectiveFrom ? formatPickerDate(new Date(row.effectiveFrom)) : '',
    status: row.status === 'ACTIVE' ? 'Active' : 'Inactive',
  })), [rows]);

  const filteredRows = useMemo(() => viewRows.filter((row) => {
    if (type !== 'All' && row.type !== type) return false;
    if (chapter !== 'All' && row.chapter !== chapter) return false;
    if (taxRate !== 'All' && row.taxRate !== Number(taxRate)) return false;
    return true;
  }), [viewRows, type, chapter, taxRate]);

  const stats = useMemo(() => {
    const hsnRows = viewRows.filter((r) => r.type === 'HSN');
    const sacRows = viewRows.filter((r) => r.type === 'SAC');
    const rates = viewRows.map((r) => r.taxRate).filter((r) => typeof r === 'number');
    const averageTaxRate = rates.length ? rates.reduce((sum, r) => sum + r, 0) / rates.length : 0;
    return {
      totalHsnCodes: hsnRows.length,
      activeHsnCodes: hsnRows.filter((r) => r.status === 'Active').length,
      totalSacCodes: sacRows.length,
      activeSacCodes: sacRows.filter((r) => r.status === 'Active').length,
      averageTaxRate,
    };
  }, [viewRows]);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>HSN / SAC</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/masters" underline="hover" color="text.secondary">Masters</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>HSN / SAC</Typography>
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
            borderRadius: 3, p: { xs: 1.75, sm: 2 }, display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1,
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
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Create and manage HSN (Harmonized System of Nomenclature) / SAC (Service Accounting Code) for items and services.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              HSN/SAC codes are used for GST reporting and invoicing.
            </Typography>
          </Box>
        </Paper>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={handleNewHsnSac}>
            New HSN / SAC
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
              label="Search HSN / SAC"
              placeholder="Search by HSN / SAC code or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.6 }}>
            <TextField select label="Type" value={type} onChange={(e) => setType(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {TYPE_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2.6 }}>
            <TextField select label="Chapter" value={chapter} onChange={(e) => setChapter(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {CHAPTER_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.6 }}>
            <TextField select label="Tax Rate (%)" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {TAX_RATE_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.6 }}>
            <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1.2 }}>
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
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>HSN / SAC List</Typography>

        {isError ? (
          <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', py: 3 }}>
            Failed to load HSN / SAC codes. Please try again.
          </Typography>
        ) : (
          <Box sx={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
            <HsnSacTable rows={filteredRows} onViewRow={handleViewRow} onEditRow={handleEditRow} onDeleteRow={handleDeleteRow} />
          </Box>
        )}

        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
          Showing {filteredRows.length} of {formatNumber(viewRows.length)} records
        </Typography>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={DescriptionOutlinedIcon} iconColor="#8B5CF6" iconShape="circle" label="Total HSN Codes" value={formatNumber(stats.totalHsnCodes)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={FactCheckOutlinedIcon} iconColor="success" iconShape="circle" label="Active HSN Codes" value={formatNumber(stats.activeHsnCodes)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={PeopleAltOutlinedIcon} iconColor="warning" iconShape="circle" label="Total SAC Codes" value={formatNumber(stats.totalSacCodes)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={FactCheckOutlinedIcon} iconColor="success" iconShape="circle" label="Active SAC Codes" value={formatNumber(stats.activeSacCodes)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={CurrencyRupeeOutlinedIcon} iconColor="#2563EB" iconShape="circle" label="Average Tax Rate" value={`${stats.averageTaxRate.toFixed(2)}%`} />
        </Grid>
      </Grid>

      <HsnSacFormDialog open={formDialog.open} mode={formDialog.mode} initialValues={formDialog.row} onClose={closeFormDialog} />
      <HsnSacViewDialog
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
