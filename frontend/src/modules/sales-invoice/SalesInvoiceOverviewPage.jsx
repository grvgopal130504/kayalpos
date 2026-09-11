import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';

import SalesInvoiceSummaryCards from './components/SalesInvoiceSummaryCards';
import SalesInvoiceTable from './components/SalesInvoiceTable';
import InvoiceDetailsCard from './components/InvoiceDetailsCard';
import InvoiceTermsAndNotes from './components/InvoiceTermsAndNotes';
import { SUMMARY, INVOICES, INVOICE_DETAILS } from './salesInvoiceMockData';

const INVOICE_BY_CODE = Object.fromEntries(INVOICES.map((inv) => [inv.code, inv]));

/**
 * Sales Invoice list/detail page — summary tiles, the invoice table with a
 * detail panel for whichever row is selected, and a Terms & Conditions /
 * Notes strip below. Mirrors SalesOrderOverviewPage/
 * SalesQuotationOverviewPage's structure; the Sales Invoice backend module
 * doesn't exist yet so everything is driven by salesInvoiceMockData.js.
 */
export default function SalesInvoiceOverviewPage({ tab, onTabChange, onCreate, onView, onEdit }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedCode, setSelectedCode] = useState(INVOICE_DETAILS.code);
  const [notes, setNotes] = useState('');

  const selectedRow = INVOICE_BY_CODE[selectedCode];
  const invoiceDetails = selectedCode === INVOICE_DETAILS.code
    ? INVOICE_DETAILS
    : {
        ...INVOICE_DETAILS,
        code: selectedRow.code,
        date: selectedRow.date,
        status: selectedRow.status,
        totalAmount: selectedRow.amount,
        dueDate: selectedRow.dueDate,
        customer: { ...INVOICE_DETAILS.customer, name: selectedRow.customer },
      };

  const handleSelectInvoice = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => {
    if (label === 'View') return onView ? onView(row.code) : navigate(`/sales-invoice/view/${row.code}`);
    if (label === 'Edit') return onEdit ? onEdit(row.code) : navigate(`/sales-invoice/edit/${row.code}`);
    dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  };
  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleRecordPayment = () => dispatch(showToast(`Record Payment for "${invoiceDetails.code}" is coming soon`, 'info'));
  const handleCreate = () => {
    if (onCreate) onCreate(); else navigate('/sales-invoice/create');
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
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Sales Invoice</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/sales-invoice" underline="hover" color="text.secondary">Sales Invoice</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Invoice List</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' } }}>
          <Button variant="outlined" color="inherit" startIcon={<PrintOutlinedIcon fontSize="small" />} onClick={handlePrintPreview}>
            Print / Preview
          </Button>
          <Button variant="outlined" color="inherit" startIcon={<PaymentsOutlinedIcon fontSize="small" />} onClick={handleRecordPayment}>
            Record Payment
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
            <MenuItem onClick={() => handleMoreAction('Export Invoices')}>Export Invoices</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Duplicate Invoice')}>Duplicate Invoice</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Delete Invoice')}>Delete Invoice</MenuItem>
          </Menu>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            New Sales Invoice
          </Button>
        </Stack>
      </Stack>

      <SalesInvoiceSummaryCards summary={SUMMARY} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 640 } }}>
            <SalesInvoiceTable
              invoices={INVOICES}
              selectedCode={selectedCode}
              onSelectInvoice={handleSelectInvoice}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
              tab={tab}
              onTabChange={onTabChange}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 640 }, overflow: 'auto' }}>
            <InvoiceDetailsCard invoice={invoiceDetails} />
          </Box>
        </Grid>
      </Grid>

      <InvoiceTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
