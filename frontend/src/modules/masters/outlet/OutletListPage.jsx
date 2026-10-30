import { useMemo, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button,
  TextField, MenuItem, InputAdornment, IconButton, Table, TableHead, TableBody, TableRow, TableCell, Chip,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';

import { useAppDispatch } from '../../../app/hooks';
import { showToast } from '../../../features/ui/uiSlice';
import StatCard from '../../../components/common/StatCard';
import { formatNumber } from '../../../utils/format';
import { useGetOutletsQuery, useDeleteOutletMutation } from '../../../api/outletApi';

const COLUMNS = ['Code', 'Name', 'Type', 'City', 'State', 'Phone', 'Status', 'Action'];

/**
 * Outlet List — the Masters > Outlet landing page, reached from the
 * Masters page's "Outlet" card. Wired to the real Outlet API
 * (see api/outletApi.js): the list/search/status-filter run server-side
 * (?search=&isActive=), same as Brand's own list. "New Outlet" and each
 * row's View/Edit both navigate to the detail/edit page (OutletPage.jsx,
 * at `/masters/outlet/new` or `/masters/outlet/:id`) rather than a modal
 * dialog, since Outlet's detail screen (tabs, Contact Person grid, logo,
 * registered address) is far richer than Brand's small Add/Edit dialog.
 * Delete asks for confirmation, then calls the API directly from this
 * list — the backend maps a delete blocked by existing Sales/
 * ShiftSessions/etc into a friendly 409 (see crudFactory.js's
 * prismaKnownError), surfaced here as a toast.
 */
export default function OutletListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('All');
  const [appliedSearch, setAppliedSearch] = useState('');

  const {
    data: outlets = [],
    isLoading,
    isError,
  } = useGetOutletsQuery({
    search: appliedSearch || undefined,
    isActive: status !== 'All' ? String(status === 'Active') : undefined,
  });
  const [deleteOutlet] = useDeleteOutletMutation();


  const handleNewOutlet = () => navigate('/masters/outlet/new');
  const handleSearch = () => setAppliedSearch(searchInput.trim());
  const handleReset = () => {
    setSearchInput('');
    setStatus('All');
    setAppliedSearch('');
  };
  const handleViewRow = (row) => navigate(`/masters/outlet/${row.id}`);
  const handleDeleteRow = async (row) => {
    if (!window.confirm(`Delete outlet "${row.name}"? This cannot be undone.`)) return;
    try {
      await deleteOutlet(row.id).unwrap();
      dispatch(showToast(`${row.name} deleted`, 'success'));
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to delete outlet', 'error'));
    }
  };

  const stats = useMemo(() => ({
    total: outlets.length,
    active: outlets.filter((o) => o.isActive).length,
    inactive: outlets.filter((o) => !o.isActive).length,
  }), [outlets]);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Outlet</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/masters" underline="hover" color="text.secondary">Masters</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Outlet</Typography>
          </Breadcrumbs>
        </Box>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard icon={StorefrontOutlinedIcon} iconColor="#2563EB" iconShape="circle" label="Total Outlets" value={formatNumber(stats.total)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard icon={FactCheckOutlinedIcon} iconColor="success" iconShape="circle" label="Active Outlets" value={formatNumber(stats.active)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard icon={HighlightOffOutlinedIcon} iconColor="error" iconShape="circle" label="Inactive Outlets" value={formatNumber(stats.inactive)} />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Grid container spacing={1.5} sx={{ alignItems: 'flex-end' }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="Search Outlet"
              placeholder="Search by outlet name or code..."
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
            <Button variant="contained" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={handleNewOutlet} fullWidth>
              New Outlet
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Outlet List</Typography>
        {isError ? (
          <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', py: 3 }}>
            Failed to load outlets. Please try again.
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto', opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  {COLUMNS.map((col) => (
                    <TableCell key={col} className={col === 'Action' ? 'sticky-action' : undefined} sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 12.5, whiteSpace: 'nowrap' }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {outlets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={COLUMNS.length} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {isLoading ? 'Loading outlets…' : 'No outlets found — create one to get started.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {outlets.map((row) => (
                  <TableRow key={row.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleViewRow(row)}>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.code}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.name}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.outletType || '—'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.city || '—'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.state || '—'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.phone || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          bgcolor: row.isActive ? 'rgba(34,160,107,0.12)' : 'rgba(107,114,128,0.12)',
                          color: row.isActive ? 'success.main' : 'text.secondary',
                          fontWeight: 700, height: 22,
                        }}
                      />
                    </TableCell>
                    <TableCell className="sticky-action" onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" color="primary" onClick={() => handleViewRow(row)} aria-label={`Open ${row.name}`}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="primary" onClick={() => handleViewRow(row)} aria-label={`Edit ${row.name}`}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteRow(row)} aria-label={`Delete ${row.name}`}>
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
          Showing {outlets.length} of {outlets.length} records
        </Typography>
      </Paper>
    </Stack>
  );
}
