import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';

import BarcodeLabelSummaryCards from './components/BarcodeLabelSummaryCards';
import BarcodeLabelTable from './components/BarcodeLabelTable';
import LabelDetailsCard from './components/LabelDetailsCard';
import LabelTermsAndNotes from './components/LabelTermsAndNotes';
import { SUMMARY, BATCHES, BATCH_DETAILS } from './barcodeLabelMockData';

const BATCH_BY_CODE = Object.fromEntries(BATCHES.map((b) => [b.code, b]));

/**
 * Barcode & Label list/detail page — summary tiles, the batch table with a
 * detail panel for whichever row is selected, and a Terms & Conditions /
 * Notes strip below. Mirrors SalesInvoiceOverviewPage's structure; the
 * Barcode & Label backend module doesn't exist yet so everything is
 * driven by barcodeLabelMockData.js.
 */
export default function BarcodeLabelOverviewPage({ tab, onTabChange, onCreate, onView, onEdit }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedCode, setSelectedCode] = useState(BATCH_DETAILS.code);
  const [notes, setNotes] = useState('');

  const selectedRow = BATCH_BY_CODE[selectedCode];
  const batchDetails = selectedCode === BATCH_DETAILS.code
    ? BATCH_DETAILS
    : {
        ...BATCH_DETAILS,
        code: selectedRow.code,
        date: selectedRow.date,
        status: selectedRow.status,
        labelName: selectedRow.labelName,
        itemCategory: selectedRow.itemCategory,
        totalLabels: selectedRow.totalLabels,
      };

  const handleSelectBatch = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => {
    if (label === 'View') return onView ? onView(row.code) : navigate(`/barcode-label/view/${row.code}`);
    if (label === 'Edit') return onEdit ? onEdit(row.code) : navigate(`/barcode-label/edit/${row.code}`);
    return dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  };
  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleCreate = () => {
    if (onCreate) onCreate(); else navigate('/barcode-label/create');
  };
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Barcode &amp; Label</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/barcode-label" underline="hover" color="text.secondary">Barcode &amp; Label</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Batch List</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' } }}>
          <Button variant="outlined" color="inherit" startIcon={<PrintOutlinedIcon fontSize="small" />} onClick={handlePrintPreview}>
            Print / Preview
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
            <MenuItem onClick={() => handleMoreAction('Export Batches')}>Export Batches</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Duplicate Batch')}>Duplicate Batch</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Delete Batch')}>Delete Batch</MenuItem>
          </Menu>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            New Barcode &amp; Label
          </Button>
        </Stack>
      </Stack>

      <BarcodeLabelSummaryCards summary={SUMMARY} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 640 } }}>
            <BarcodeLabelTable
              batches={BATCHES}
              selectedCode={selectedCode}
              onSelectBatch={handleSelectBatch}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
              tab={tab}
              onTabChange={onTabChange}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 640 }, overflow: 'auto' }}>
            <LabelDetailsCard batch={batchDetails} />
          </Box>
        </Grid>
      </Grid>

      <LabelTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
