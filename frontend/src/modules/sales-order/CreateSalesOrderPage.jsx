import { useMemo, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
  Paper, TextField, IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import FormTextField from '../../components/form/FormTextField';
import FormDatePicker from '../../components/form/FormDatePicker';
import FormSelect from '../../components/form/FormSelect';
import { CUSTOMERS } from '../customer/customerMockData';

import OrderItemsTable from './components/OrderItemsTable';
import OrderTotalsCard from './components/OrderTotalsCard';
import OrderTermsAndNotes from './components/OrderTermsAndNotes';
import { ORDERS, getOrderDetails } from './salesOrderMockData';
import {
  createSalesOrderSchema, createSalesOrderDefaultValues,
  CUSTOMER_OPTIONS, CONTACT_PERSON_OPTIONS, PAYMENT_TERMS_OPTIONS, SALES_PERSON_OPTIONS,
  CURRENCY_OPTIONS, PRICE_LIST_OPTIONS, QUOTATION_REFERENCE_OPTIONS,
} from './createSalesOrderSchema';

function nextOrderCode() {
  const maxNum = ORDERS.reduce((max, o) => Math.max(max, Number(o.code.slice(3))), 0);
  return `SO-${String(maxNum + 1).padStart(5, '0')}`;
}

// The mock detail record only carries the customer's name, not their code —
// best-effort match it back to a CUSTOMERS row so the Customer select can be
// prefilled in edit mode; falls back to blank (still selectable manually)
// when no match is found.
function findCustomerIdByName(name) {
  const match = CUSTOMERS.find((c) => c.name === name);
  return match ? match.code : '';
}

function itemToRow(item) {
  const lineTotal = item.qty * item.unitPrice;
  const discountPercent = lineTotal > 0 ? Math.round((item.discount / lineTotal) * 10000) / 100 : 0;
  return {
    itemCode: item.code,
    itemName: item.name,
    hsnCode: item.hsn,
    qty: String(item.qty),
    unit: '',
    unitPrice: String(item.unitPrice),
    discountPercent: discountPercent ? String(discountPercent) : '',
    taxCode: '',
  };
}

/**
 * "New Sales Order" screen, also doubling as the Edit Order page when
 * reached via `/sales-order/edit/:code` — the Sales Order module has no
 * backend yet, so "editing" prefills from getOrderDetails() the same way
 * the Overview/Status pages' own detail panel does. Mirrors
 * CreateSalesQuotationPage's structure exactly: Customer Details + Order
 * Details cards, an editable line-items grid with a live totals summary,
 * and Terms & Conditions / Notes below.
 *
 * Note: the reference mockup appears to swap its "Delivery Date" and
 * "Payment Terms" labels/placeholders (a "Delivery Date" field shows a
 * "Select Payment Terms" placeholder and vice versa). Following the same
 * judgment call made on the Sales Quotation form, that mismatch is treated
 * as a mockup typo and corrected here rather than replicated literally —
 * each field's label matches its own placeholder/behavior.
 */
export default function CreateSalesOrderPage({ code: propCode, onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { code: paramCode } = useParams();
  const code = propCode ?? paramCode;
  const isEditMode = Boolean(code);
  const existingOrder = isEditMode ? getOrderDetails(code) : null;
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const orderCode = useMemo(() => (isEditMode ? code : nextOrderCode()), [isEditMode, code]);

  const methods = useForm({
    resolver: zodResolver(createSalesOrderSchema),
    defaultValues: existingOrder
      ? {
          ...createSalesOrderDefaultValues,
          customerId: findCustomerIdByName(existingOrder.customer.name),
          mobile: existingOrder.customer.mobile,
          email: existingOrder.customer.email,
          address: existingOrder.customer.address,
          orderDate: existingOrder.date,
          deliveryDate: existingOrder.deliveryDate,
          paymentTerms: (existingOrder.paymentTerms || '').toLowerCase(),
          salesPerson: (existingOrder.salesPerson || '').toLowerCase(),
          quotationRef: existingOrder.ref && existingOrder.ref !== '-' ? existingOrder.ref : '',
          items: existingOrder.items?.length ? existingOrder.items.map(itemToRow) : createSalesOrderDefaultValues.items,
        }
      : createSalesOrderDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit } = methods;

  const handleBack = () => {
    if (onBack) return onBack();
    if (isEditMode) return navigate(`/sales-order/view/${code}`);
    navigate('/sales-order');
  };

  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleAddCustomer = () => navigate('/customer');
  const handleAddItem = () => dispatch(showToast('Item picker is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  const onSaveAsDraft = handleSubmit(() => {
    dispatch(showToast(isEditMode ? `Order ${orderCode} updated successfully` : `Order ${orderCode} saved as draft`, 'success'));
    handleBack();
  });
  const onSaveAndConfirm = handleSubmit(() => {
    dispatch(showToast(isEditMode ? `Order ${orderCode} updated successfully` : `Order ${orderCode} saved and confirmed`, 'success'));
    handleBack();
  });

  if (isEditMode && !existingOrder) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Order not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={() => navigate('/sales-order')} sx={{ width: 'fit-content' }}>
          Back to Sales Order List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{isEditMode ? `Sales Order (Edit ${orderCode})` : 'Sales Order (New)'}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/sales-order" underline="hover" color="text.secondary">Sales Order</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{isEditMode ? 'Edit Order' : 'New Sales Order'}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' }, justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            {isEditMode ? 'Back to Order' : 'Back'}
          </Button>
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
            <MenuItem onClick={() => handleMoreAction('Save as Template')}>Save as Template</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Import Items')}>Import Items</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Reset Form')}>Reset Form</MenuItem>
          </Menu>
          {isEditMode ? (
            <Button variant="contained" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSaveAsDraft}>
              Update Order
            </Button>
          ) : (
            <>
              <Button variant="outlined" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSaveAsDraft}>
                Save as Draft
              </Button>
              <Button variant="contained" startIcon={<SendOutlinedIcon fontSize="small" />} onClick={onSaveAndConfirm}>
                Save &amp; Confirm
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      <FormProvider {...methods}>
        <Stack spacing={2} component="form" noValidate>
          <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Customer Details</Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <FormSelect name="customerId" label="Customer *" options={CUSTOMER_OPTIONS} />
                    </Box>
                    <IconButton
                      onClick={handleAddCustomer}
                      sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                      aria-label="Add new customer"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <FormSelect name="contactPerson" label="Contact Person" options={CONTACT_PERSON_OPTIONS} />
                  <FormTextField name="mobile" label="Mobile" placeholder="Enter Mobile Number" />
                  <FormTextField name="email" label="Email" placeholder="Enter Email Address" />
                  <FormTextField name="address" label="Address" placeholder="Enter Address" multiline minRows={3} />
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Order Details</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Order No." value={orderCode} disabled fullWidth slotProps={{ input: { readOnly: true } }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormDatePicker name="orderDate" label="Order Date *" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormDatePicker name="deliveryDate" label="Delivery Date *" placeholder="Select Delivery Date" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect name="paymentTerms" label="Payment Terms" placeholder="Select Payment Terms" options={PAYMENT_TERMS_OPTIONS} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect name="salesPerson" label="Sales Person *" options={SALES_PERSON_OPTIONS} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect name="currency" label="Currency" options={CURRENCY_OPTIONS} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect name="quotationRef" label="Quotation Ref." options={QUOTATION_REFERENCE_OPTIONS} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormDatePicker name="referenceDate" label="Reference Date" placeholder="Select Date" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect name="priceList" label="Price List" options={PRICE_LIST_OPTIONS} />
                  </Grid>
                  <Grid size={12}>
                    <FormTextField name="remarks" label="Remarks" placeholder="Enter Remarks (if any)" multiline minRows={2} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Items</Typography>
                <OrderItemsTable onAddItem={handleAddItem} />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <OrderTotalsCard />
            </Grid>
          </Grid>

          <TermsAndNotesField />
        </Stack>
      </FormProvider>
    </Stack>
  );
}

// Reuses the same Terms & Conditions / Notes layout as the list pages, but
// binds Notes to the form's `notes` field instead of local component state.
function TermsAndNotesField() {
  const { watch, setValue } = useFormContext();
  const notes = watch('notes');
  return <OrderTermsAndNotes notes={notes} onNotesChange={(value) => setValue('notes', value)} />;
}
