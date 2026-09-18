import { useMemo, useState } from 'react';
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
import { SUMMARY, RECENT_TRANSACTIONS, LOYALTY_SUMMARY } from './customerMockData';
import { toCustomerRow, toCustomerDetails } from './customerApiHelpers';
import { useGetCustomersQuery, useDeleteCustomerMutation } from '../../api/customerApi';

/**
 * Customer List / dashboard page — summary tiles, the customer table with a
 * detail panel for whichever row is selected, recent transactions, and a
 * loyalty summary. Wired to the real Customer API (see api/customerApi.js)
 * for the list, detail panel, and Add/Edit/Delete. Recent Transactions and
 * the Loyalty Summary are still mock placeholders — those need the Sales
 * Invoice/Payment and Loyalty modules, which don't exist yet. Add/Edit/View
 * swap in via local state instead of separate /add, /edit/:code, /view/:code
 * routes.
 */
export default function CustomerPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState('list');
  const [activeCode, setActiveCode] = useState(null);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);

  const { data: customerRows = [] } = useGetCustomersQuery({});
  const [deleteCustomer] = useDeleteCustomerMutation();

  // Computed unconditionally (before the create/edit/view early returns
  // below) so hook order stays stable across renders.
  const viewRows = useMemo(() => customerRows.map(toCustomerRow), [customerRows]);
  const byCode = useMemo(() => Object.fromEntries(customerRows.map((c) => [c.code, c])), [customerRows]);

  const goToList = () => { setActiveCode(null); setTab('list'); };
  const openEdit = (code) => { setActiveCode(code); setTab('edit'); };
  const openView = (code) => { setActiveCode(code); setTab('view'); };

  if (tab === 'create' || tab === 'edit') {
    return (
      <AddNewCustomerPage
        code={tab === 'edit' ? activeCode : undefined}
        onBack={(savedCode) => (tab === 'edit' ? openView(savedCode || activeCode) : goToList())}
      />
    );
  }

  if (tab === 'view') {
    return <CustomerViewPage code={activeCode} onBack={goToList} onEdit={() => openEdit(activeCode)} />;
  }

  const effectiveSelectedCode = selectedCode && byCode[selectedCode] ? selectedCode : customerRows[0]?.code;
  const customerDetails = effectiveSelectedCode && byCode[effectiveSelectedCode]
    ? toCustomerDetails(byCode[effectiveSelectedCode])
    : null;

  const handleSelectCustomer = (row) => setSelectedCode(row.code);
  const handleRowAction = async (label, row) => {
    if (label === 'View') return openView(row.code);
    if (label === 'Edit') return openEdit(row.code);
    if (label === 'Delete') {
      if (!window.confirm(`Delete customer "${row.name}"? This cannot be undone.`)) return;
      try {
        await deleteCustomer(row.id).unwrap();
        dispatch(showToast(`${row.name} deleted`, 'success'));
      } catch (err) {
        dispatch(showToast(err?.data?.message || 'Failed to delete customer', 'error'));
      }
      return;
    }
    dispatch(showToast(`${label} "${row.name}" is coming soon`, 'info'));
  };
  const handleImport = () => dispatch(showToast('Import Customers is coming soon', 'info'));
  const handleAddCustomer = () => setTab('create');
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleEdit = () => effectiveSelectedCode && openEdit(effectiveSelectedCode);
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
              customers={viewRows}
              totalCount={viewRows.length}
              selectedCode={effectiveSelectedCode}
              onSelectCustomer={handleSelectCustomer}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          {customerDetails ? (
            <CustomerDetailsCard customer={customerDetails} onEdit={handleEdit} />
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
              No customers yet — add one to see details here.
            </Typography>
          )}
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
