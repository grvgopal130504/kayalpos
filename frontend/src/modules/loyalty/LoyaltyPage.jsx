import { useMemo, useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';

import LoyaltySummaryCards from './components/LoyaltySummaryCards';
import LoyaltyTable from './components/LoyaltyTable';
import LoyaltyDetailsCard from './components/LoyaltyDetailsCard';
import CreateLoyaltyProgramPage from './CreateLoyaltyProgramPage';
import LoyaltyViewPage from './LoyaltyViewPage';
import {
  useGetLoyaltyProgramsQuery, useDeleteLoyaltyProgramMutation, useUpdateLoyaltyProgramMutation,
} from '../../api/loyaltyApi';
import { toLoyaltyRow, toLoyaltyDetails, buildLoyaltySummary } from './loyaltyDisplay';

/**
 * Landing page for the sidebar's Loyalty item — summary tiles, the program
 * list with a detail panel for whichever row is selected, and
 * Create/Edit/View swapped in via local state. Fully wired to the backend
 * (see backend/src/modules/loyalty): every tile, row and detail field comes
 * from the real LoyaltyProgram table, so an empty table honestly shows
 * zeros instead of this page's old static mock numbers.
 *
 * "Members Enrolled"/"Points Issued"/"Points Redeemed" are computed from the
 * real `membersEnrolled`/`pointsIssuedTillDate`/`pointsRedeemedTillDate`
 * columns, which all read 0 today — nothing in the app enrolls a customer or
 * posts loyalty points at checkout yet (Line Sale has no "earn/redeem
 * points" step). Once that wiring exists, these tiles update on their own.
 */
export default function LoyaltyPage() {
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState('list');
  const [activeId, setActiveId] = useState(null);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const { data: programs = [], isLoading, isError } = useGetLoyaltyProgramsQuery({});
  const [deleteLoyaltyProgram] = useDeleteLoyaltyProgramMutation();
  const [updateLoyaltyProgram] = useUpdateLoyaltyProgramMutation();

  const programById = useMemo(() => Object.fromEntries(programs.map((p) => [p.id, p])), [programs]);
  const rows = useMemo(() => programs.map(toLoyaltyRow), [programs]);
  const summary = useMemo(() => buildLoyaltySummary(programs), [programs]);

  const goToList = () => { setActiveId(null); setMode('list'); };
  const openEdit = (id) => { setActiveId(id); setMode('edit'); };
  const openView = (id) => { setActiveId(id); setMode('view'); };

  if (mode === 'create' || mode === 'edit') {
    return (
      <CreateLoyaltyProgramPage
        id={mode === 'edit' ? activeId : undefined}
        onBack={(savedId) => {
          if (savedId) setSelectedId(savedId);
          if (mode === 'edit') return openView(savedId || activeId);
          return goToList();
        }}
      />
    );
  }

  if (mode === 'view') {
    return <LoyaltyViewPage id={activeId} onBack={goToList} onEdit={() => openEdit(activeId)} />;
  }

  const selectedProgram = (selectedId && programById[selectedId]) || programs[0] || null;
  const programDetails = selectedProgram ? toLoyaltyDetails(selectedProgram) : null;

  const handleSelectProgram = (row) => setSelectedId(row.id);
  const handleRowAction = async (label, row) => {
    if (label === 'View') return openView(row.id);
    if (label === 'Edit') return openEdit(row.id);
    if (label === 'Delete') {
      try {
        await deleteLoyaltyProgram(row.id).unwrap();
        dispatch(showToast(`Loyalty program "${row.name}" deleted`, 'success'));
        if (selectedId === row.id) setSelectedId(null);
      } catch (err) {
        dispatch(showToast(err?.data?.message || 'Failed to delete the loyalty program', 'error'));
      }
      return undefined;
    }
    if (label === 'Deactivate') {
      const existing = programById[row.id];
      if (!existing) return undefined;
      try {
        await updateLoyaltyProgram({
          id: row.id,
          programName: existing.name,
          description: existing.description || '',
          status: 'Inactive',
          earnPointsOn: existing.earnPointsOn,
          pointsType: existing.pointsType,
          pointsValue: Number(existing.pointsValue),
          redemptionType: existing.redemptionType,
          redemptionValue: Number(existing.redemptionValue),
          minimumPointsRequired: existing.minimumPointsRequired,
          maximumDiscountPerTransaction: Number(existing.maximumDiscountPerTransaction),
          applyOn: existing.applyOn,
          membershipValidity: existing.membershipValidity,
          validityPeriodMonths: existing.validityPeriodMonths,
          pointsExpiry: existing.pointsExpiry,
          welcomePointsEnabled: existing.welcomePointsEnabled,
          welcomePointsValue: existing.welcomePointsValue,
          allowPointsRedemption: existing.allowPointsRedemption,
          showLoyaltyDetailsInInvoice: existing.showLoyaltyDetailsInInvoice,
          allowNegativePoints: existing.allowNegativePoints,
          pointsExpiryNotification: existing.pointsExpiryNotification,
        }).unwrap();
        dispatch(showToast(`Loyalty program "${row.name}" deactivated`, 'success'));
      } catch (err) {
        dispatch(showToast(err?.data?.message || 'Failed to deactivate the loyalty program', 'error'));
      }
      return undefined;
    }
    return dispatch(showToast(`${label} "${row.name}" is coming soon`, 'info'));
  };
  const handleImport = () => dispatch(showToast('Import Programs is coming soon', 'info'));
  const handleCreate = () => setMode('create');
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleEdit = () => selectedProgram && openEdit(selectedProgram.id);
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Loyalty</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Loyalty</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import Programs
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Create Loyalty Program
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            endIcon={<ExpandMoreIcon />}
            onClick={(e) => setMoreActionsAnchor(e.currentTarget)}
          >
            More Actions
          </Button>
          <Menu anchorEl={moreActionsAnchor} open={Boolean(moreActionsAnchor)} onClose={() => setMoreActionsAnchor(null)}>
            <MenuItem onClick={() => handleMoreAction('Export Programs')}>Export Programs</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Bulk Deactivate')}>Bulk Deactivate</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Loyalty Settings')}>Loyalty Settings</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <LoyaltySummaryCards summary={summary} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <LoyaltyTable
              programs={rows}
              totalCount={rows.length}
              selectedId={programDetails?.id}
              onSelectProgram={handleSelectProgram}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 560 } }}>
            {isLoading ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>Loading loyalty programs…</Typography>
            ) : isError ? (
              <Typography variant="body2" color="error" sx={{ p: 2 }}>Failed to load loyalty programs.</Typography>
            ) : programDetails ? (
              <LoyaltyDetailsCard program={programDetails} onEdit={handleEdit} />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
                No loyalty programs yet — create one to get started.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
