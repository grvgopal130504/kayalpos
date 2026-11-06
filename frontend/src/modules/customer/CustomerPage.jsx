import { useMemo, useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
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
import { toCustomerRow, toCustomerDetails, toRecentTransactions, toLoyaltySummary } from './customerApiHelpers';
import { useGetCustomersQuery, useDeleteCustomerMutation } from '../../api/customerApi';
import {
  useSalesOverviewSummaryQuery, useCustomerSalesSummariesQuery, useCustomerSalesQuery,
} from '../../api/saleApi';

/**
 * Customer List / dashboard page — summary tiles, the customer table with a
 * detail panel for whichever row is selected, recent transactions, and a
 * loyalty summary. Fully wired to the real backend: the list, detail panel,
 * Add/Edit/Delete come from the Customer API; the summary tiles,
 * per-row/detail Total Purchase & Outstanding, Recent Transactions, and
 * Loyalty Summary all come from real Sale rows via the sale API (see
 * backend/src/modules/sale's getSalesOverviewSummary /
 * getCustomerPurchaseSummaries / getCustomerPurchaseSummary) and the
 * Customer's own real `loyaltyPoints` column — nothing on this page is mock
 * data, so a fresh tenant with no customers or sales honestly shows zeros
 * and empty states. Add/Edit/View swap in via local state instead of
 * separate /add, /edit/:code, /view/:code routes.
 */
export default function CustomerPage() {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState('list');
  const [activeCode, setActiveCode] = useState(null);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);

  const { data: allCustomerRows = [] } = useGetCustomersQuery({});
  // The tenant's reserved Walk-in Customer row (see
  // backend/src/modules/customer/customer.service.js) is a real Customer
  // record now so Line Sale can save walk-in sales against it, but it's a
  // system record, not one an admin manages here — hide it from the list,
  // table, and delete/edit actions on this page.
  const customerRows = useMemo(() => allCustomerRows.filter((row) => row.code !== 'WALKIN'), [allCustomerRows]);
  const [deleteCustomer] = useDeleteCustomerMutation();
  const { data: overviewSummary } = useSalesOverviewSummaryQuery();
  const { data: purchaseSummaries = {} } = useCustomerSalesSummariesQuery();

  // Computed unconditionally (before the create/edit/view early returns
  // below) so hook order stays stable across renders.
  const viewRows = useMemo(
    () => customerRows.map((row) => toCustomerRow(row, purchaseSummaries[row.id])),
    [customerRows, purchaseSummaries],
  );
  const byCode = useMemo(() => Object.fromEntries(customerRows.map((c) => [c.code, c])), [customerRows]);

  const goToList = () => { setActiveCode(null); setTab('list'); };
  const openEdit = (code) => { setActiveCode(code); setTab('edit'); };
  const openView = (code) => { setActiveCode(code); setTab('view'); };

  const effectiveSelectedCode = selectedCode && byCode[selectedCode] ? selectedCode : customerRows[0]?.code;
  const selectedCustomer = effectiveSelectedCode ? byCode[effectiveSelectedCode] : null;
  const { data: selectedCustomerSales } = useCustomerSalesQuery(selectedCustomer?.id, { skip: !selectedCustomer });

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

  const customerDetails = selectedCustomer
    ? toCustomerDetails(selectedCustomer, purchaseSummaries[selectedCustomer.id])
    : null;

  const summary = {
    totalCustomers: customerRows.length,
    activeCustomers: customerRows.filter((c) => c.status === 'ACTIVE').length,
    loyalCustomers: customerRows.filter((c) => (c.loyaltyPoints || 0) > 0).length,
    totalSalesThisMonth: overviewSummary?.totalSalesThisMonth || 0,
    outstandingAmount: overviewSummary?.outstandingAmount || 0,
  };

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

      <CustomerSummaryCards summary={summary} />

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

        {customerDetails && (
          <>
            <Grid size={{ xs: 12, lg: 7 }}>
              <CustomerLoyaltySummary summary={toLoyaltySummary(selectedCustomer, selectedCustomerSales)} />
            </Grid>
            <Grid size={{ xs: 12, lg: 5 }}>
              <CustomerTransactionsCard transactions={toRecentTransactions(selectedCustomerSales)} />
            </Grid>
          </>
        )}
      </Grid>
    </Stack>
  );
}
