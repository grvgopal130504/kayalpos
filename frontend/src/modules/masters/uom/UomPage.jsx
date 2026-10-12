import { useMemo, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button,
  TextField, MenuItem,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AddIcon from '@mui/icons-material/Add';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';

import { useAppDispatch } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';
import StatCard from '../../../components/common/StatCard';
import { formatNumber } from '../../../utils/format';
import { CASHIER } from '../mastersMockData';
import {
  useGetUomGroupsQuery, useGetUomsQuery, useDeleteUomGroupMutation, useDeleteUomMutation,
} from '../../../api/uomApi';

import UomGroupTable from './components/UomGroupTable';
import UomTable from './components/UomTable';
import UomGroupFormDialog from './components/UomGroupFormDialog';
import UomGroupViewDialog from './components/UomGroupViewDialog';
import UomFormDialog from './components/UomFormDialog';
import UomViewDialog from './components/UomViewDialog';

/**
 * UOM / UOM Group — reached from the Masters page's "UOM" card. Two panels
 * stacked one below the other: UOM Group List (search + status filter + table) on top and the
 * UOM List (a fuller filter bar + table) below, wired to the real UOM/UOM Group
 * API (see api/uomApi.js) — list/search/status run server-side; UOM Group
 * and Base UOM filters run client-side over whatever the current
 * search/status filter returned (no backend aggregation endpoint for
 * those), same convention as ProductPage's Brand/Product Type filters.
 * "Total UOMs" per group is likewise computed client-side by counting UOMs
 * whose groupId matches, since the backend doesn't return that count.
 */
export default function UomPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [groupSearchInput, setGroupSearchInput] = useState('');
  const [groupAppliedSearch, setGroupAppliedSearch] = useState('');
  const [groupStatus, setGroupStatus] = useState('All');
  const [groupFormDialog, setGroupFormDialog] = useState({ open: false, mode: 'add', row: null });
  const [viewGroupRow, setViewGroupRow] = useState(null);

  const [uomGroupFilter, setUomGroupFilter] = useState('All');
  const [uomStatus, setUomStatus] = useState('All');
  const [baseUomFilter, setBaseUomFilter] = useState('All');
  const [uomSearchInput, setUomSearchInput] = useState('');
  const [uomAppliedSearch, setUomAppliedSearch] = useState('');
  const [uomFormDialog, setUomFormDialog] = useState({ open: false, mode: 'add', row: null });
  const [viewUomRow, setViewUomRow] = useState(null);

  const {
    data: groupRows = [],
    isLoading: isGroupLoading,
    isError: isGroupError,
  } = useGetUomGroupsQuery({
    search: groupAppliedSearch || undefined,
    status: groupStatus !== 'All' ? groupStatus.toUpperCase() : undefined,
  });
  const [deleteUomGroup] = useDeleteUomGroupMutation();

  const {
    data: uomRows = [],
    isLoading: isUomLoading,
    isError: isUomError,
  } = useGetUomsQuery({
    search: uomAppliedSearch || undefined,
    status: uomStatus !== 'All' ? uomStatus.toUpperCase() : undefined,
  });
  const [deleteUom] = useDeleteUomMutation();

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
  const handleDeleteGroupRow = async (row) => {
    if (!window.confirm(`Delete UOM group "${row.name}"? This cannot be undone.`)) return;
    try {
      await deleteUomGroup(row.id).unwrap();
      dispatch(showToast(`${row.name} deleted`, 'success'));
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to delete UOM group', 'error'));
    }
  };
  const closeGroupFormDialog = () => setGroupFormDialog((prev) => ({ ...prev, open: false }));

  const handleViewUomRow = (row) => setViewUomRow(row);
  const handleEditUomRow = (row) => setUomFormDialog({ open: true, mode: 'edit', row });
  const handleDeleteUomRow = async (row) => {
    if (!window.confirm(`Delete UOM "${row.name}"? This cannot be undone.`)) return;
    try {
      await deleteUom(row.id).unwrap();
      dispatch(showToast(`${row.name} deleted`, 'success'));
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to delete UOM', 'error'));
    }
  };
  const closeUomFormDialog = () => setUomFormDialog((prev) => ({ ...prev, open: false }));
  const handleGroupSearch = () => setGroupAppliedSearch(groupSearchInput.trim());
  const handleGroupReset = () => {
    setGroupSearchInput('');
    setGroupStatus('All');
    setGroupAppliedSearch('');
  };
  const handleUomSearch = () => setUomAppliedSearch(uomSearchInput.trim());
  const handleUomReset = () => {
    setUomSearchInput('');
    setUomGroupFilter('All');
    setUomStatus('All');
    setBaseUomFilter('All');
    setUomAppliedSearch('');
  };

  // Flatten each group row to the view shape the table/view dialog expect
  // (status 'Active'/'Inactive', totalUoms counted client-side from the
  // current UOM list).
  const groupViewRows = useMemo(() => groupRows.map((g) => ({
    id: g.id,
    code: g.code,
    name: g.name,
    description: g.description || '',
    totalUoms: uomRows.filter((u) => (u.groupId || u.group?.id) === g.id).length,
    status: g.status === 'ACTIVE' ? 'Active' : 'Inactive',
  })), [groupRows, uomRows]);

  // Flatten each UOM row to the view shape the table/view dialog expect
  // (group: the group's name as a plain string for display, status:
  // 'Active'/'Inactive').
  const uomViewRows = useMemo(() => uomRows.map((u) => ({
    id: u.id,
    code: u.code,
    name: u.name,
    groupId: u.groupId || u.group?.id || '',
    group: u.group?.name || '',
    baseUom: u.baseUom || '',
    conversionFactor: u.conversionFactor != null ? Number(u.conversionFactor) : null,
    status: u.status === 'ACTIVE' ? 'Active' : 'Inactive',
  })), [uomRows]);

  const filteredUomRows = useMemo(() => uomViewRows.filter((row) => {
    if (uomGroupFilter !== 'All' && row.groupId !== uomGroupFilter) return false;
    if (baseUomFilter !== 'All' && row.baseUom !== baseUomFilter) return false;
    return true;
  }), [uomViewRows, uomGroupFilter, baseUomFilter]);

  const baseUomFilterOptions = useMemo(
    () => Array.from(new Set(uomViewRows.map((r) => r.baseUom).filter(Boolean))).sort(),
    [uomViewRows],
  );

  const stats = useMemo(() => ({
    totalUomGroups: groupViewRows.length,
    activeUomGroups: groupViewRows.filter((g) => g.status === 'Active').length,
    totalUoms: uomViewRows.length,
    activeUoms: uomViewRows.filter((u) => u.status === 'Active').length,
  }), [groupViewRows, uomViewRows]);

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

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', lg: 'center' }, justifyContent: 'flex-end' }}>
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
        <Grid size={12}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>UOM Group List</Typography>

            <Grid container spacing={1.5} sx={{ alignItems: 'flex-end', mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="Search UOM Group"
                  placeholder="Search by group code or name..."
                  value={groupSearchInput}
                  onChange={(e) => setGroupSearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleGroupSearch(); }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField select label="Status" value={groupStatus} onChange={(e) => setGroupStatus(e.target.value)} fullWidth size="small">
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 6, sm: 3, md: 3 }}>
                <Button variant="contained" color="primary" startIcon={<SearchIcon fontSize="small" />} onClick={handleGroupSearch} fullWidth>
                  Search
                </Button>
              </Grid>
              <Grid size={{ xs: 6, sm: 3, md: 3 }}>
                <Button variant="outlined" color="inherit" startIcon={<CloseIcon fontSize="small" />} onClick={handleGroupReset} fullWidth>
                  Reset
                </Button>
              </Grid>
            </Grid>

            {isGroupError ? (
              <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', py: 3 }}>
                Failed to load UOM groups. Please try again.
              </Typography>
            ) : (
              <Box sx={{ opacity: isGroupLoading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
                <UomGroupTable rows={groupViewRows} onViewRow={handleViewGroupRow} onEditRow={handleEditGroupRow} onDeleteRow={handleDeleteGroupRow} />
              </Box>
            )}

            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
              Showing {groupViewRows.length} of {groupViewRows.length} records
            </Typography>
          </Paper>
        </Grid>

        <Grid size={12}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>UOM List</Typography>

            <Grid container spacing={1.5} sx={{ alignItems: 'flex-end', mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Search UOM"
                  placeholder="Search by UOM code or name..."
                  value={uomSearchInput}
                  onChange={(e) => setUomSearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleUomSearch(); }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 2.5 }}>
                <TextField select label="UOM Group" value={uomGroupFilter} onChange={(e) => setUomGroupFilter(e.target.value)} fullWidth size="small">
                  <MenuItem value="All">All</MenuItem>
                  {groupRows.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                <TextField select label="Status" value={uomStatus} onChange={(e) => setUomStatus(e.target.value)} fullWidth size="small">
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                <TextField select label="Base UOM" value={baseUomFilter} onChange={(e) => setBaseUomFilter(e.target.value)} fullWidth size="small">
                  <MenuItem value="All">All</MenuItem>
                  {baseUomFilterOptions.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6, sm: 6, md: 1.2 }}>
                <Button variant="contained" color="primary" startIcon={<SearchIcon fontSize="small" />} onClick={handleUomSearch} fullWidth>
                  Search
                </Button>
              </Grid>
              <Grid size={{ xs: 6, sm: 6, md: 1.3 }}>
                <Button variant="outlined" color="inherit" startIcon={<CloseIcon fontSize="small" />} onClick={handleUomReset} fullWidth>
                  Reset
                </Button>
              </Grid>
            </Grid>

            {isUomError ? (
              <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', py: 3 }}>
                Failed to load UOMs. Please try again.
              </Typography>
            ) : (
              <Box sx={{ opacity: isUomLoading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
                <UomTable rows={filteredUomRows} onViewRow={handleViewUomRow} onEditRow={handleEditUomRow} onDeleteRow={handleDeleteUomRow} />
              </Box>
            )}

            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
              Showing {filteredUomRows.length} of {formatNumber(uomViewRows.length)} records
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={Inventory2OutlinedIcon} iconColor="#2563EB" iconShape="circle" label="Total UOM Groups" value={formatNumber(stats.totalUomGroups)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={FactCheckOutlinedIcon} iconColor="success" iconShape="circle" label="Active UOM Groups" value={formatNumber(stats.activeUomGroups)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={ReceiptOutlinedIcon} iconColor="#2563EB" iconShape="circle" label="Total UOMs" value={formatNumber(stats.totalUoms)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={FactCheckOutlinedIcon} iconColor="success" iconShape="circle" label="Active UOMs" value={formatNumber(stats.activeUoms)} />
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
