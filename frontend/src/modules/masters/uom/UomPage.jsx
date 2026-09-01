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
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined';

import { useAppDispatch } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';
import StatCard from '../../../components/common/StatCard';
import { formatNumber } from '../../../utils/format';

import UomGroupTable from './components/UomGroupTable';
import UomTable from './components/UomTable';
import UomGroupFormDialog from './components/UomGroupFormDialog';
import UomGroupViewDialog from './components/UomGroupViewDialog';
import UomFormDialog from './components/UomFormDialog';
import UomViewDialog from './components/UomViewDialog';
import { CASHIER } from '../mastersMockData';
import {
  UOM_GROUPS, UOMS, BASE_UOM_OPTIONS, STATS, uomTotalRecords, uomTotalPages,
} from './uomMockData';

/**
 * UOM / UOM Group — reached from the Masters page's "UOM" card. Two
 * panels side by side: UOM Group List (its own search box + table +
 * pager) and the larger UOM List (a fuller filter bar + table + pager),
 * matching the reference. `UOMS` only mocks the first page of a 22-row
 * catalog (`uomTotalPages` covers the rest), so paging past page 1 on
 * either list surfaces a toast — there's no UOM backend module yet.
 */
export default function UomPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [groupSearch, setGroupSearch] = useState('');
  const [groupPage, setGroupPage] = useState(1);

  const [uomGroupFilter, setUomGroupFilter] = useState('All');
  const [uomStatus, setUomStatus] = useState('All');
  const [baseUom, setBaseUom] = useState('All');
  const [uomAppliedSearch, setUomAppliedSearch] = useState('');
  const [uomPage, setUomPage] = useState(1);
  const [groupFormDialog, setGroupFormDialog] = useState({ open: false, mode: 'add', row: null });
  const [viewGroupRow, setViewGroupRow] = useState(null);
  const [uomFormDialog, setUomFormDialog] = useState({ open: false, mode: 'add', row: null });
  const [viewUomRow, setViewUomRow] = useState(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleNewUom = () => setUomFormDialog({ open: true, mode: 'add', row: null });
  const handleNewUomGroup = () => setGroupFormDialog({ open: true, mode: 'add', row: null });
  const handleImport = () => dispatch(showToast('Import UOMs is coming soon', 'info'));
  const handleExport = () => dispatch(showToast('Export UOMs is coming soon', 'info'));
  const handleViewGroupRow = (row) => setViewGroupRow(row);
  const handleEditGroupRow = (row) => setGroupFormDialog({ open: true, mode: 'edit', row });
  const handleDeleteGroupRow = (row) => dispatch(showToast(`Delete ${row.name} is coming soon`, 'info'));
  const handleViewUomRow = (row) => setViewUomRow(row);
  const handleEditUomRow = (row) => setUomFormDialog({ open: true, mode: 'edit', row });
  const handleDeleteUomRow = (row) => dispatch(showToast(`Delete ${row.name} is coming soon`, 'info'));
  const closeGroupFormDialog = () => setGroupFormDialog((prev) => ({ ...prev, open: false }));
  const closeUomFormDialog = () => setUomFormDialog((prev) => ({ ...prev, open: false }));
  const handleUomSearch = () => setUomAppliedSearch('');
  const handleUomReset = () => {
    setUomGroupFilter('All');
    setUomStatus('All');
    setBaseUom('All');
    setUomAppliedSearch('');
  };
  const handleGroupPageChange = (value) => {
    setGroupPage(value);
    if (value !== 1) dispatch(showToast('Loading further pages is coming soon', 'info'));
  };
  const handleUomPageChange = (value) => {
    setUomPage(value);
    if (value !== 1) dispatch(showToast('Loading further pages is coming soon', 'info'));
  };

  const filteredGroups = useMemo(() => UOM_GROUPS.filter((row) => {
    if (!groupSearch.trim()) return true;
    const haystack = `${row.code} ${row.name}`.toLowerCase();
    return haystack.includes(groupSearch.trim().toLowerCase());
  }), [groupSearch]);

  const filteredUoms = useMemo(() => UOMS.filter((row) => {
    if (uomGroupFilter !== 'All' && row.group !== uomGroupFilter) return false;
    if (uomStatus !== 'All' && row.status !== uomStatus) return false;
    if (baseUom !== 'All' && row.baseUom !== baseUom) return false;
    return true;
  }), [uomGroupFilter, uomStatus, baseUom]);

  const uomIsFiltered = uomGroupFilter !== 'All' || uomStatus !== 'All' || baseUom !== 'All';

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>UOM / UOM Group</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/masters" underline="hover" color="text.secondary">Masters</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>UOM / UOM Group</Typography>
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
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Manage Units of Measure (UOM) and UOM Groups.</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              UOM helps to define how items are measured and used in transactions.
            </Typography>
          </Box>
        </Paper>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={handleNewUom}>
            New UOM
          </Button>
          <Button variant="outlined" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={handleNewUomGroup}>
            New UOM Group
          </Button>
          <Button variant="outlined" color="primary" startIcon={<MoveToInboxOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import
          </Button>
          <Button variant="outlined" color="primary" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleExport}>
            Export
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>UOM Group List</Typography>
              <TextField
                size="small"
                placeholder="Search UOM Group..."
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                slotProps={{ input: { endAdornment: <InputAdornment position="end"><SearchIcon fontSize="small" /></InputAdornment> } }}
                sx={{ width: { xs: '100%', sm: 220 } }}
              />
            </Stack>

            <UomGroupTable rows={filteredGroups} onViewRow={handleViewGroupRow} onEditRow={handleEditGroupRow} onDeleteRow={handleDeleteGroupRow} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Showing 1 to {filteredGroups.length} of {UOM_GROUPS.length} records
              </Typography>
              <Pagination count={1} page={groupPage} onChange={(_e, value) => handleGroupPageChange(value)} color="primary" shape="rounded" />
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>UOM List</Typography>

            <Grid container spacing={1.5} sx={{ alignItems: 'flex-end', mb: 2 }}>
              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                <TextField select label="UOM Group" value={uomGroupFilter} onChange={(e) => setUomGroupFilter(e.target.value)} fullWidth size="small">
                  <MenuItem value="All">All</MenuItem>
                  {UOM_GROUPS.map((g) => <MenuItem key={g.code} value={g.name}>{g.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                <TextField select label="Status" value={uomStatus} onChange={(e) => setUomStatus(e.target.value)} fullWidth size="small">
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                <TextField select label="Base UOM" value={baseUom} onChange={(e) => setBaseUom(e.target.value)} fullWidth size="small">
                  <MenuItem value="All">All</MenuItem>
                  {BASE_UOM_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6, sm: 6, md: 1.8 }}>
                <Button variant="contained" color="primary" startIcon={<SearchIcon fontSize="small" />} onClick={handleUomSearch} fullWidth>
                  Search
                </Button>
              </Grid>
              <Grid size={{ xs: 6, sm: 6, md: 1.2 }}>
                <Button variant="outlined" color="inherit" startIcon={<CloseIcon fontSize="small" />} onClick={handleUomReset} fullWidth>
                  Reset
                </Button>
              </Grid>
            </Grid>

            <UomTable rows={filteredUoms} onViewRow={handleViewUomRow} onEditRow={handleEditUomRow} onDeleteRow={handleDeleteUomRow} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {uomIsFiltered
                  ? `Showing ${filteredUoms.length} of ${uomTotalRecords} records`
                  : `Showing 1 to ${filteredUoms.length} of ${formatNumber(uomTotalRecords)} records`}
              </Typography>
              {!uomIsFiltered && (
                <Pagination count={uomTotalPages} page={uomPage} onChange={(_e, value) => handleUomPageChange(value)} color="primary" shape="rounded" />
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={Inventory2OutlinedIcon} iconColor="#2563EB" iconShape="circle" label="Total UOM Groups" value={formatNumber(STATS.totalUomGroups)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={FactCheckOutlinedIcon} iconColor="success" iconShape="circle" label="Active UOM Groups" value={formatNumber(STATS.activeUomGroups)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={ReceiptOutlinedIcon} iconColor="#2563EB" iconShape="circle" label="Total UOMs" value={formatNumber(STATS.totalUoms)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={FactCheckOutlinedIcon} iconColor="success" iconShape="circle" label="Active UOMs" value={formatNumber(STATS.activeUoms)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={KeyboardReturnOutlinedIcon} iconColor="warning" iconShape="circle" label="Active UOMs" value={formatNumber(STATS.activeUomsAlt)} />
        </Grid>
      </Grid>

      <UomGroupFormDialog open={groupFormDialog.open} mode={groupFormDialog.mode} initialValues={groupFormDialog.row} onClose={closeGroupFormDialog} />
      <UomGroupViewDialog
        open={Boolean(viewGroupRow)}
        row={viewGroupRow}
        onClose={() => setViewGroupRow(null)}
        onEdit={() => {
          const row = viewGroupRow;
          setViewGroupRow(null);
          setGroupFormDialog({ open: true, mode: 'edit', row });
        }}
      />
      <UomFormDialog open={uomFormDialog.open} mode={uomFormDialog.mode} initialValues={uomFormDialog.row} onClose={closeUomFormDialog} />
      <UomViewDialog
        open={Boolean(viewUomRow)}
        row={viewUomRow}
        onClose={() => setViewUomRow(null)}
        onEdit={() => {
          const row = viewUomRow;
          setViewUomRow(null);
          setUomFormDialog({ open: true, mode: 'edit', row });
        }}
      />
    </Stack>
  );
}
