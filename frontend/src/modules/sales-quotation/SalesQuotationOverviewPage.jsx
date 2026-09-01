import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';

import SalesQuotationSummaryCards from './components/SalesQuotationSummaryCards';
import SalesQuotationTable from './components/SalesQuotationTable';
import QuotationDetailsCard from './components/QuotationDetailsCard';
import QuotationTermsAndNotes from './components/QuotationTermsAndNotes';
import { SUMMARY, QUOTATIONS, QUOTATION_DETAILS } from './salesQuotationMockData';

const QUOTATION_BY_CODE = Object.fromEntries(QUOTATIONS.map((q) => [q.code, q]));

/**
 * Sales Quotation list/detail page — summary tiles, the quotation table
 * with a detail panel for whichever row is selected, and a Terms &
 * Conditions / Notes strip below. The Sales Quotation backend module
 * doesn't exist yet, so everything is driven by salesQuotationMockData.js —
 * selecting a row other than QUO-00086 falls back to reusing
 * QUOTATION_DETAILS' items/totals (only the header fields differ) since we
 * don't have full mock detail records for all 86 rows.
 */
export default function SalesQuotationOverviewPage({ tab, onTabChange, onCreate }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedCode, setSelectedCode] = useState(QUOTATION_DETAILS.code);
  const [notes, setNotes] = useState('');

  const selectedRow = QUOTATION_BY_CODE[selectedCode];
  const quotationDetails = selectedCode === QUOTATION_DETAILS.code
    ? QUOTATION_DETAILS
    : {
        ...QUOTATION_DETAILS,
        code: selectedRow.code,
        date: selectedRow.date,
        status: selectedRow.status,
        totalAmount: selectedRow.amount,
        validTill: selectedRow.validTill,
        customer: { ...QUOTATION_DETAILS.customer, name: selectedRow.customer },
      };

  const handleSelectQuotation = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => {
    if (label === 'View') return navigate(`/sales-quotation/view/${row.code}`);
    if (label === 'Edit') return navigate(`/sales-quotation/edit/${row.code}`);
    dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  };
  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleConvertToOrder = () => dispatch(showToast(`Convert "${quotationDetails.code}" to Sales Order is coming soon`, 'info'));
  const handleCreate = () => {
    if (onCreate) onCreate(); else navigate('/sales-quotation/create');
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
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Sales Quotation</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/sales-quotation" underline="hover" color="text.secondary">Sales Quotation</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Quotation List</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' } }}>
          <Button variant="outlined" color="inherit" startIcon={<PrintOutlinedIcon fontSize="small" />} onClick={handlePrintPreview}>
            Print / Preview
          </Button>
          <Button variant="outlined" color="inherit" startIcon={<SwapHorizOutlinedIcon fontSize="small" />} onClick={handleConvertToOrder}>
            Convert to Sales Order
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
            <MenuItem onClick={() => handleMoreAction('Export Quotations')}>Export Quotations</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Duplicate Quotation')}>Duplicate Quotation</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Delete Quotation')}>Delete Quotation</MenuItem>
          </Menu>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            New Quotation
          </Button>
        </Stack>
      </Stack>

      <SalesQuotationSummaryCards summary={SUMMARY} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 640 } }}>
            <SalesQuotationTable
              quotations={QUOTATIONS}
              selectedCode={selectedCode}
              onSelectQuotation={handleSelectQuotation}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
              tab={tab}
              onTabChange={onTabChange}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 640 }, overflow: 'auto' }}>
            <QuotationDetailsCard quotation={quotationDetails} />
          </Box>
        </Grid>
      </Grid>

      <QuotationTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
