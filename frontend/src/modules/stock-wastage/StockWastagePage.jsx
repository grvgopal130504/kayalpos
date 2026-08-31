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

import StockWastageSummaryCards from './components/StockWastageSummaryCards';
import StockWastageTable from './components/StockWastageTable';
import StockWastageDetailsCard from './components/StockWastageDetailsCard';
import { SUMMARY, WASTAGES, TOTAL_WASTAGE_COUNT, WASTAGE_DETAILS } from './stockWastageMockData';

const WASTAGE_BY_CODE = Object.fromEntries(WASTAGES.map((w) => [w.code, w]));

/**
 * Landing page for the sidebar's Stock Wastage item — summary tiles, the
 * wastage list with a detail panel for whichever row is selected. "Create
 * Wastage" navigates to its own dedicated page. The Stock Wastage backend
 * module doesn't exist yet, so everything is driven by
 * stockWastageMockData.js — selecting a row other than WST-00030 falls
 * back to reusing WASTAGE_DETAILS' shape (only the top-level fields
 * differ) since we don't have full mock detail records for every row.
 */
export default function StockWastagePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedCode, setSelectedCode] = useState(WASTAGE_DETAILS.code);

  const selectedRow = WASTAGE_BY_CODE[selectedCode];
  const wastageDetails = selectedCode === WASTAGE_DETAILS.code
    ? WASTAGE_DETAILS
    : {
        ...WASTAGE_DETAILS,
        code: selectedRow.code,
        date: selectedRow.date,
        outletLocation: selectedRow.outlet,
        wastageType: selectedRow.wastageType,
        items: selectedRow.items,
        wastageValue: selectedRow.wastageValue,
        status: selectedRow.status,
      };

  const handleSelectWastage = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  const handleImport = () => dispatch(showToast('Import Wastages is coming soon', 'info'));
  const handleCreate = () => navigate('/stock-wastage/create');
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleEdit = () => dispatch(showToast('Edit Stock Wastage is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Stock Wastage</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Stock Wastage</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import Wastages
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Create Wastage
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
            <MenuItem onClick={() => handleMoreAction('Export Wastages')}>Export Wastages</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Print Wastages')}>Print Wastages</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Wastage Settings')}>Wastage Settings</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <StockWastageSummaryCards summary={SUMMARY} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <StockWastageTable
              wastages={WASTAGES}
              totalCount={TOTAL_WASTAGE_COUNT}
              selectedCode={selectedCode}
              onSelectWastage={handleSelectWastage}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <StockWastageDetailsCard wastage={wastageDetails} onEdit={handleEdit} />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
