import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
  Paper, TextField, IconButton, InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import FormTextField from '../../components/form/FormTextField';
import FormDatePicker from '../../components/form/FormDatePicker';
import FormSelect from '../../components/form/FormSelect';
import { useGetCustomersQuery } from '../../api/customerApi';
import { useGetProductsQuery } from '../../api/productApi';
import { useGetSalesOrdersQuery } from '../../api/salesOrderApi';
import { useGetSalesQuotationsQuery } from '../../api/salesQuotationApi';
import {
  useGetSalesInvoiceQuery, useNextSalesInvoiceCodeQuery,
  useCreateSalesInvoiceMutation, useUpdateSalesInvoiceMutation,
} from '../../api/salesInvoiceApi';

import InvoiceItemsTable from './components/InvoiceItemsTable';
import InvoiceTotalsCard from './components/InvoiceTotalsCard';
import InvoiceTermsAndNotes, { DEFAULT_TERMS } from './components/InvoiceTermsAndNotes';
import {
  createSalesInvoiceSchema, createSalesInvoiceDefaultValues, emptyItemRow, isBlankItemRow,
  CONTACT_PERSON_OPTIONS, PAYMENT_TERMS_OPTIONS, SALES_PERSON_OPTIONS,
  CURRENCY_OPTIONS, PRICE_LIST_OPTIONS,
} from './createSalesInvoiceSchema';
import { invoiceToFormValues, formValuesToPayload } from './salesInvoiceDisplay';

/**
 * "New Sales Invoice" screen, also doubling as the Edit Invoice form when
 * SalesInvoicePage renders it with an `id` prop — everything (list, create,
 * edit, view) lives on the one /sales-invoice page. Fully wired to the real
 * backend (see backend/src/modules/sales-invoice): Customer comes from the
 * real Customer table, the Invoice No. is a live preview of the next real
 * code, "Sales Order" lists real confirmed/delivered Sales Orders,
 * "Quotation Reference" lists real converted Sales Quotations, and both
 * "Save as Draft" and "Save & Send" actually create/update a SalesInvoice
 * row with the same validations enforced again server-side.
 *
 * Matches the reference design's layout exactly: Customer Details (narrower
 * left card) + Invoice Details (wider right card, 3-fields-per-row), a
 * full-width editable line-items grid, and a 3-column row below it (Terms &
 * Conditions / Notes / Summary totals).
 */
export default function CreateSalesInvoicePage({ id: propId, onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = propId ?? paramId;
  const isEditMode = Boolean(id);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);

  const { data: customers = [] } = useGetCustomersQuery({});
  const { data: products = [] } = useGetProductsQuery({});
  const { data: orders = [] } = useGetSalesOrdersQuery({});
  const { data: quotations = [] } = useGetSalesQuotationsQuery({});
  const { data: existingInvoice, isLoading: isLoadingExisting, isError: loadError } = useGetSalesInvoiceQuery(id, { skip: !isEditMode });
  const nextCode = useNextSalesInvoiceCodeQuery(undefined, { skip: isEditMode });
  const [createSalesInvoice, { isLoading: isCreating }] = useCreateSalesInvoiceMutation();
  const [updateSalesInvoice, { isLoading: isUpdating }] = useUpdateSalesInvoiceMutation();
  const isSaving = isCreating || isUpdating;

  const customerOptions = useMemo(() => [
    { value: '', label: 'Select Customer', disabled: true },
    ...customers.map((c) => ({ value: c.id, label: c.name })),
  ], [customers]);
  const customerById = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c])), [customers]);

  // Only orders already marked confirmed/delivered can be invoiced against —
  // same restriction the old mock data applied.
  const salesOrderOptions = useMemo(() => [
    { value: '', label: 'Select Sales Order' },
    ...orders.filter((o) => o.status === 'confirmed' || o.status === 'delivered').map((o) => ({ value: o.code, label: o.code })),
  ], [orders]);

  // Only quotations already marked 'converted' by Sales Quotation's own
  // live-computed status can be referenced here directly.
  const quotationRefOptions = useMemo(() => [
    { value: '', label: 'Select Quotation' },
    ...quotations.filter((q) => q.status === 'converted').map((q) => ({ value: q.code, label: q.code })),
  ], [quotations]);

  const invoiceCode = isEditMode ? existingInvoice?.code : nextCode.data;

  const methods = useForm({
    resolver: zodResolver(createSalesInvoiceSchema),
    defaultValues: createSalesInvoiceDefaultValues,
    mode: 'onTouched',
  });
  const { watch, reset, handleSubmit, setValue } = methods;

  // The edit-mode fetch is async, so the form can't be seeded via useForm's
  // defaultValues (that only runs once, before the data exists) — reset()
  // re-seeds every field once the real invoice row arrives.
  useEffect(() => {
    if (existingInvoice) reset(invoiceToFormValues(existingInvoice, emptyItemRow));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingInvoice]);

  // Prefilling Mobile/Email/Address from the selected customer's own record
  // is a convenience, not a requirement — the invoice stores its own
  // snapshot of these fields (matching Sale/Sales Quotation/Sales Order's
  // own "frozen at save time" rule), so the user can still edit them
  // per-invoice afterwards. Skips the very first render (including the
  // reset() above landing on an existing customerId) so it only fires on an
  // actual manual selection.
  const customerId = watch('customerId');
  const isFirstCustomerRender = useRef(true);
  useEffect(() => {
    if (isFirstCustomerRender.current) {
      isFirstCustomerRender.current = false;
      return;
    }
    const customer = customerById[customerId];
    if (!customer) return;
    setValue('mobile', customer.mobile || '');
    setValue('email', customer.email || '');
    setValue('address', customer.address || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const handleBack = () => {
    if (onBack) return onBack();
    if (isEditMode) return navigate(`/sales-invoice/view/${id}`);
    navigate('/sales-invoice');
  };

  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleAddCustomer = () => navigate('/customer');
  const handleAddSalesOrder = () => dispatch(showToast('Sales Order picker is coming soon', 'info'));
  const handleAddQuotation = () => dispatch(showToast('Quotation picker is coming soon', 'info'));
  const handleAddItem = () => dispatch(showToast('Item picker is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  const save = async (values, status) => {
    const payload = formValuesToPayload(values, { status, isBlankItemRow });
    try {
      const saved = isEditMode
        ? await updateSalesInvoice({ id, ...payload }).unwrap()
        : await createSalesInvoice(payload).unwrap();
      dispatch(showToast(
        isEditMode
          ? `Invoice ${saved.code} updated successfully`
          : `Invoice ${saved.code} ${status === 'draft' ? 'saved as draft' : 'saved and sent'}`,
        'success',
      ));
      if (onBack) onBack(saved.id);
      else if (isEditMode) navigate(`/sales-invoice/view/${saved.id}`);
      else navigate('/sales-invoice');
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save the invoice', 'error'));
    }
  };

  // Editing an already-'sent' (or overdue) invoice keeps saving as 'sent' —
  // only a genuine draft edit stays a draft, same rule Sales Quotation's own
  // edit-status logic follows.
  const editingStatus = existingInvoice?.dbStatus === 'draft' ? 'draft' : 'sent';
  const onSaveAsDraft = handleSubmit((values) => save(values, isEditMode ? editingStatus : 'draft'));
  const onSaveAndSend = handleSubmit((values) => save(values, 'sent'));

  if (isEditMode && isLoadingExisting) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading invoice…</Typography>
      </Stack>
    );
  }

  if (isEditMode && (loadError || !existingInvoice)) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Invoice not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={() => navigate('/sales-invoice')} sx={{ width: 'fit-content' }}>
          Back to Sales Invoice List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{isEditMode ? `Sales Invoice (Edit ${invoiceCode || ''})` : 'Sales Invoice (New)'}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/sales-invoice" underline="hover" color="text.secondary">Sales Invoice</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{isEditMode ? 'Edit Invoice' : 'New Sales Invoice'}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' }, justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            {isEditMode ? 'Back to Invoice' : 'Back'}
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
            <MenuItem onClick={() => reset(createSalesInvoiceDefaultValues)}>Reset Form</MenuItem>
          </Menu>
          {isEditMode ? (
            <Button variant="contained" color="warning" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSaveAsDraft} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Update Invoice'}
            </Button>
          ) : (
            <>
              <Button variant="outlined" color="warning" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSaveAsDraft} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save as Draft'}
              </Button>
              <Button variant="contained" color="warning" startIcon={<SendOutlinedIcon fontSize="small" />} onClick={onSaveAndSend} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save & Send'}
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      <FormProvider {...methods}>
        <Stack spacing={2} component="form" noValidate>
          <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Customer Details</Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <FormSelect name="customerId" label="Customer *" options={customerOptions} />
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

            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Invoice Details</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Invoice No."
                      value={invoiceCode || 'Generating…'}
                      disabled
                      fullWidth
                      slotProps={{
                        input: {
                          readOnly: true,
                          endAdornment: <InputAdornment position="end"><SettingsOutlinedIcon fontSize="small" /></InputAdornment>,
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormDatePicker name="invoiceDate" label="Invoice Date *" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormDatePicker name="dueDate" label="Due Date" />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <FormSelect name="salesOrderRef" label="Sales Order" options={salesOrderOptions} />
                      </Box>
                      <IconButton
                        onClick={handleAddSalesOrder}
                        sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                        aria-label="Add sales order reference"
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <FormSelect name="quotationRef" label="Quotation Reference" options={quotationRefOptions} />
                      </Box>
                      <IconButton
                        onClick={handleAddQuotation}
                        sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                        aria-label="Add quotation reference"
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormSelect name="salesPerson" label="Sales Person *" options={SALES_PERSON_OPTIONS} />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormSelect name="currency" label="Currency" options={CURRENCY_OPTIONS} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormSelect name="paymentTerms" label="Payment Terms" options={PAYMENT_TERMS_OPTIONS} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormSelect name="priceList" label="Price List" options={PRICE_LIST_OPTIONS} />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormDatePicker name="deliveryDate" label="Delivery Date" placeholder="Select Delivery Date" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormTextField name="referenceNo" label="Reference (if any)" placeholder="Enter Reference" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormTextField name="remarks" label="Remarks" placeholder="Enter Remarks (if any)" />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Items</Typography>
            <InvoiceItemsTable onAddItem={handleAddItem} products={products} />
          </Paper>

          <BottomRow />
        </Stack>
      </FormProvider>
    </Stack>
  );
}

// Terms & Conditions / Notes / Summary totals, laid out as a 3-column row
// (matching the reference), with Notes bound to the form's `notes` field.
function BottomRow() {
  const { watch, setValue } = useFormContext();
  const notes = watch('notes');

  return (
    <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Terms &amp; Conditions</Typography>
          <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
            {DEFAULT_TERMS.map((term) => (
              <Typography key={term} component="li" variant="body2" sx={{ color: 'text.secondary' }}>
                {term}
              </Typography>
            ))}
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Notes</Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            placeholder="Enter notes (optional)"
            value={notes}
            onChange={(e) => setValue('notes', e.target.value)}
          />
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <InvoiceTotalsCard />
      </Grid>
    </Grid>
  );
}
