import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';

import LoyaltySummaryCards from './components/LoyaltySummaryCards';
import LoyaltyTable from './components/LoyaltyTable';
import LoyaltyDetailsCard from './components/LoyaltyDetailsCard';
import { SUMMARY, PROGRAMS, TOTAL_PROGRAM_COUNT, PROGRAM_DETAILS } from './loyaltyMockData';

const PROGRAM_BY_CODE = Object.fromEntries(PROGRAMS.map((p) => [p.code, p]));

/**
 * Landing page for the sidebar's Loyalty item — summary tiles, the program
 * list with a detail panel for whichever row is selected. "Create Loyalty
 * Program" navigates to its own dedicated page. The Loyalty backend module
 * doesn't exist yet, so everything is driven by loyaltyMockData.js —
 * selecting a row other than LP-0001 falls back to reusing PROGRAM_DETAILS'
 * shape (only name/code/rules/status differ) since we don't have full mock
 * detail records for every row.
 */
export default function LoyaltyPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedCode, setSelectedCode] = useState(PROGRAM_DETAILS.code);

  const selectedRow = PROGRAM_BY_CODE[selectedCode];
  const programDetails = selectedCode === PROGRAM_DETAILS.code
    ? PROGRAM_DETAILS
    : {
        ...PROGRAM_DETAILS,
        code: selectedRow.code,
        name: selectedRow.name,
        status: selectedRow.status,
        membershipValidity: selectedRow.membershipValidity,
        members: selectedRow.members,
      };

  const handleSelectProgram = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => dispatch(showToast(`${label} "${row.name}" is coming soon`, 'info'));
  const handleImport = () => dispatch(showToast('Import Programs is coming soon', 'info'));
  const handleCreate = () => navigate('/loyalty/create');
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleEdit = () => dispatch(showToast('Edit Loyalty Program is coming soon', 'info'));
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

      <LoyaltySummaryCards summary={SUMMARY} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <LoyaltyTable
              programs={PROGRAMS}
              totalCount={TOTAL_PROGRAM_COUNT}
              selectedCode={selectedCode}
              onSelectProgram={handleSelectProgram}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <LoyaltyDetailsCard program={programDetails} onEdit={handleEdit} />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
