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

import StockIndentSummaryCards from './components/StockIndentSummaryCards';
import StockIndentTable from './components/StockIndentTable';
import IndentDetailsCard from './components/IndentDetailsCard';
import IndentTermsAndNotes from './components/IndentTermsAndNotes';
import { SUMMARY, INDENTS, INDENT_DETAILS } from './stockIndentMockData';

const INDENT_BY_CODE = Object.fromEntries(INDENTS.map((ind) => [ind.code, ind]));

/**
 * Stock Indent list/detail page — summary tiles, the indent table with a
 * detail panel for whichever row is selected, and a Terms & Conditions /
 * Notes strip below. Mirrors SalesInvoiceOverviewPage's structure; the
 * Stock Indent backend module doesn't exist yet so everything is driven
 * by stockIndentMockData.js.
 */
export default function StockIndentOverviewPage({ tab, onTabChange, onCreate }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedCode, setSelectedCode] = useState(INDENT_DETAILS.code);
  const [notes, setNotes] = useState('');

  const selectedRow = INDENT_BY_CODE[selectedCode];
  const indentDetails = selectedCode === INDENT_DETAILS.code
    ? INDENT_DETAILS
    : {
        ...INDENT_DETAILS,
        code: selectedRow.code,
        date: selectedRow.date,
        status: selectedRow.status,
        department: selectedRow.department,
        fromOutlet: selectedRow.fromOutlet,
        toOutlet: selectedRow.toOutlet,
        requiredDate: selectedRow.requiredDate,
        estimatedValue: selectedRow.estimatedValue,
      };

  const handleSelectIndent = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleCreate = () => {
    if (onCreate) onCreate(); else navigate('/stock-indent/create');
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
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Stock Indent</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-indent" underline="hover" color="text.secondary">Stock Indent</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Indent List</Typography>
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
            <MenuItem onClick={() => handleMoreAction('Export Indents')}>Export Indents</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Duplicate Indent')}>Duplicate Indent</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Delete Indent')}>Delete Indent</MenuItem>
          </Menu>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            New Stock Indent
          </Button>
        </Stack>
      </Stack>

      <StockIndentSummaryCards summary={SUMMARY} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 640 } }}>
            <StockIndentTable
              indents={INDENTS}
              selectedCode={selectedCode}
              onSelectIndent={handleSelectIndent}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
              tab={tab}
              onTabChange={onTabChange}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 640 }, overflow: 'auto' }}>
            <IndentDetailsCard indent={indentDetails} />
          </Box>
        </Grid>
      </Grid>

      <IndentTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
