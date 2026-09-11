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
import AddNewCustomerPage from './AddNewCustomerPage';
import CustomerViewPage from './CustomerViewPage';
import {
  SUMMARY, CUSTOMERS, TOTAL_CUSTOMER_COUNT, CUSTOMER_DETAILS, RECENT_TRANSACTIONS, LOYALTY_SUMMARY,
  getCustomerDetails,
} from './customerMockData';

/**
 * Customer List / dashboard page — summary tiles, the customer table with a
 * detail panel for whichever row is selected, recent transactions, and a
 * loyalty summary. The Customer backend module doesn't exist yet, so
 * everything is driven by customerMockData.js — selecting a row other than
 * CUS-0001 falls back to reusing CUSTOMER_DETAILS' shape (only
 * name/code/status/contact fields differ) since we don't have full mock
 * detail records for every generated row. Add/Edit/View swap in via local
 * state instead of separate /add, /edit/:code, /view/:code routes.
 */
export default function CustomerPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState('list');
  const [activeCode, setActiveCode] = useState(null);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedCode, setSelectedCode] = useState(CUSTOMER_DETAILS.code);

  const goToList = () => { setActiveCode(null); setTab('list'); };
  const openEdit = (code) => { setActiveCode(code); setTab('edit'); };
  const openView = (code) => { setActiveCode(code); setTab('view'); };

  if (tab === 'create' || tab === 'edit') {
    return (
      <AddNewCustomerPage
        code={tab === 'edit' ? activeCode : undefined}
        onBack={tab === 'edit' ? () => openView(activeCode) : goToList}
      />
    );
  }

  if (tab === 'view') {
    return <CustomerViewPage code={activeCode} onBack={goToList} onEdit={() => openEdit(activeCode)} />;
  }

  const customerDetails = getCustomerDetails(selectedCode);

  const handleSelectCustomer = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => {
    if (label === 'View') return openView(row.code);
    if (label === 'Edit') return openEdit(row.code);
    dispatch(showToast(`${label} "${row.name}" is coming soon`, 'info'));
  };
  const handleImport = () => dispatch(showToast('Import Customers is coming soon', 'info'));
  const handleAddCustomer = () => setTab('create');
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
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Customer</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Customer</Typography>
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
          <CustomerDetailsCard customer={customerDetails} onEdit={handleEdit} />
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <CustomerLoyaltySummary summary={LOYALTY_SUMMARY} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <CustomerTransactionsCard transactions={RECENT_TRANSACTIONS} />
        </Grid>
      </Grid>
    </Stack>
  );
}
