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

import StockReturnSummaryCards from './components/StockReturnSummaryCards';
import StockReturnTable from './components/StockReturnTable';
import StockReturnDetailsCard from './components/StockReturnDetailsCard';
import { SUMMARY, RETURNS, TOTAL_RETURN_COUNT, RETURN_DETAILS } from './stockReturnMockData';

const RETURN_BY_CODE = Object.fromEntries(RETURNS.map((r) => [r.code, r]));

/**
 * Landing page for the sidebar's Stock Return item — summary tiles, the
 * return list with a detail panel for whichever row is selected. "Create
 * Return" navigates to its own dedicated page. The Stock Return backend
 * module doesn't exist yet, so everything is driven by
 * stockReturnMockData.js — selecting a row other than RRT-00030 falls back
 * to reusing RETURN_DETAILS' shape (only the top-level fields differ)
 * since we don't have full mock detail records for every row.
 */
export default function StockReturnPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedCode, setSelectedCode] = useState(RETURN_DETAILS.code);

  const selectedRow = RETURN_BY_CODE[selectedCode];
  const returnDetails = selectedCode === RETURN_DETAILS.code
    ? RETURN_DETAILS
    : {
        ...RETURN_DETAILS,
        code: selectedRow.code,
        date: selectedRow.date,
        supplier: selectedRow.supplier,
        returnType: selectedRow.returnType,
        referenceNo: selectedRow.referenceNo,
        items: selectedRow.items,
        totalValue: selectedRow.totalValue,
        status: selectedRow.status,
      };

  const handleSelectReturn = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  const handleImport = () => dispatch(showToast('Import Returns is coming soon', 'info'));
  const handleCreate = () => navigate('/stock-return/create');
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleEdit = () => dispatch(showToast('Edit Stock Return is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Stock Return</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Stock Return</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import Returns
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Create Return
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
            <MenuItem onClick={() => handleMoreAction('Export Returns')}>Export Returns</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Print Returns')}>Print Returns</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Return Settings')}>Return Settings</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <StockReturnSummaryCards summary={SUMMARY} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <StockReturnTable
              returns={RETURNS}
              totalCount={TOTAL_RETURN_COUNT}
              selectedCode={selectedCode}
              onSelectReturn={handleSelectReturn}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <StockReturnDetailsCard returnRecord={returnDetails} onEdit={handleEdit} />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
