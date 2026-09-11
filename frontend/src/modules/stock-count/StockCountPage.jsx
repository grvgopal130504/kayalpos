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

import StockCountSummaryCards from './components/StockCountSummaryCards';
import StockCountTable from './components/StockCountTable';
import StockCountDetailsCard from './components/StockCountDetailsCard';
import CreateStockCountPage from './CreateStockCountPage';
import CountViewPage from './CountViewPage';
import { SUMMARY, COUNTS, TOTAL_COUNT_COUNT, COUNT_DETAILS } from './stockCountMockData';

const COUNT_BY_CODE = Object.fromEntries(COUNTS.map((c) => [c.code, c]));

/**
 * Landing page for the sidebar's Stock Count item — summary tiles, the
 * count list with a detail panel for whichever row is selected, plus the
 * create/edit form and the read-only view, all swapped in via local state
 * instead of separate /create, /edit/:code, /view/:code routes. The Stock
 * Count backend module doesn't exist yet, so everything is driven by
 * stockCountMockData.js — selecting a row other than CNT-00030 falls back
 * to reusing COUNT_DETAILS' shape (only the top-level fields differ)
 * since we don't have full mock detail records for every row.
 */
export default function StockCountPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState('list');
  const [activeCode, setActiveCode] = useState(null);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedCode, setSelectedCode] = useState(COUNT_DETAILS.code);

  const goToList = () => {
    setActiveCode(null);
    setTab('list');
  };
  const openEdit = (code) => {
    setActiveCode(code);
    setTab('edit');
  };
  const openView = (code) => {
    setActiveCode(code);
    setTab('view');
  };

  if (tab === 'create' || tab === 'edit') {
    return (
      <CreateStockCountPage
        code={tab === 'edit' ? activeCode : undefined}
        onBack={tab === 'edit' ? () => openView(activeCode) : goToList}
      />
    );
  }

  if (tab === 'view') {
    return <CountViewPage code={activeCode} onBack={goToList} onEdit={() => openEdit(activeCode)} />;
  }

  const selectedRow = COUNT_BY_CODE[selectedCode];
  const countDetails = selectedCode === COUNT_DETAILS.code
    ? COUNT_DETAILS
    : {
        ...COUNT_DETAILS,
        code: selectedRow.code,
        date: selectedRow.date,
        warehouse: selectedRow.warehouse,
        countType: selectedRow.countType,
        items: selectedRow.items,
        varianceValue: selectedRow.varianceValue,
        status: selectedRow.status,
      };

  const handleSelectCount = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => {
    if (label === 'View') return openView(row.code);
    if (label === 'Edit') return openEdit(row.code);
    dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  };
  const handleImport = () => dispatch(showToast('Import Counts is coming soon', 'info'));
  const handleCreate = () => setTab('create');
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleEdit = () => openEdit(selectedCode);
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Stock Count</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Stock Count</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import Counts
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Create Count
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
            <MenuItem onClick={() => handleMoreAction('Export Counts')}>Export Counts</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Print Counts')}>Print Counts</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Count Settings')}>Count Settings</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <StockCountSummaryCards summary={SUMMARY} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <StockCountTable
              counts={COUNTS}
              totalCount={TOTAL_COUNT_COUNT}
              selectedCode={selectedCode}
              onSelectCount={handleSelectCount}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <StockCountDetailsCard count={countDetails} onEdit={handleEdit} />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
