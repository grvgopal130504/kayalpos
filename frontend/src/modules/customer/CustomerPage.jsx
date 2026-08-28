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

import CustomerSummaryCards from './components/CustomerSummaryCards';
import CustomerTable from './components/CustomerTable';
import CustomerDetailsCard from './components/CustomerDetailsCard';
import CustomerTransactionsCard from './components/CustomerTransactionsCard';
import CustomerLoyaltySummary from './components/CustomerLoyaltySummary';
import {
  SUMMARY, CUSTOMERS, TOTAL_CUSTOMER_COUNT, CUSTOMER_DETAILS, RECENT_TRANSACTIONS, LOYALTY_SUMMARY,
} from './customerMockData';

const CUSTOMER_BY_CODE = Object.fromEntries(CUSTOMERS.map((c) => [c.code, c]));

/**
 * Customer List / dashboard page — summary tiles, the customer table with a
 * detail panel for whichever row is selected, recent transactions, and a
 * loyalty summary. The Customer backend module doesn't exist yet, so
 * everything is driven by customerMockData.js — selecting a row other than
 * CUS-0001 falls back to reusing CUSTOMER_DETAILS' shape (only
 * name/code/status/contact fields differ) since we don't have full mock
 * detail records for every generated row.
 */
export default function CustomerPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedCode, setSelectedCode] = useState(CUSTOMER_DETAILS.code);

  const selectedRow = CUSTOMER_BY_CODE[selectedCode];
  const customerDetails = selectedCode === CUSTOMER_DETAILS.code
    ? CUSTOMER_DETAILS
    : {
        ...CUSTOMER_DETAILS,
        code: selectedRow.code,
        name: selectedRow.name,
        initials: selectedRow.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
        status: selectedRow.status,
        mobile: selectedRow.mobile,
        email: selectedRow.email,
        loyaltyPoints: selectedRow.loyaltyPoints,
        totalPurchase: selectedRow.totalPurchase,
        outstandingAmount: selectedRow.outstanding,
      };

  const handleSelectCustomer = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => dispatch(showToast(`${label} "${row.name}" is coming soon`, 'info'));
  const handleImport = () => dispatch(showToast('Import Customers is coming soon', 'info'));
  const handleAddCustomer = () => navigate('/customer/add');
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleEdit = () => dispatch(showToast('Edit Customer is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Customer</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/customer" underline="hover" color="text.secondary">Customer</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Customer List</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import Customers
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddCustomer}>
            Add New Customer
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
            <MenuItem onClick={() => handleMoreAction('Export Customers')}>Export Customers</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Bulk Deactivate')}>Bulk Deactivate</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Customer Settings')}>Customer Settings</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <CustomerSummaryCards summary={SUMMARY} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <CustomerTable
              customers={CUSTOMERS}
              totalCount={TOTAL_CUSTOMER_COUNT}
              selectedCode={selectedCode}
              onSelectCustomer={handleSelectCustomer}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2}>
            <CustomerDetailsCard customer={customerDetails} onEdit={handleEdit} />
            <CustomerTransactionsCard transactions={RECENT_TRANSACTIONS} />
            <CustomerLoyaltySummary summary={LOYALTY_SUMMARY} />
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
