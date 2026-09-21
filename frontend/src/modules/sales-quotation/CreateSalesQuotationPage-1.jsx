import { useEffect, useMemo, useRef, useState } from 'react';
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
import { useGetCustomersQuery } from '../../api/customerApi';
import {
  useGetSalesQuotationQuery, useNextSalesQuotationCodeQuery,
  useCreateSalesQuotationMutation, useUpdateSalesQuotationMutation,
} from '../../api/salesQuotationApi';

import QuotationItemsTable from './components/QuotationItemsTable';
import QuotationTotalsCard from './components/QuotationTotalsCard';
import QuotationTermsAndNotes from './components/QuotationTermsAndNotes';
import {
  createSalesQuotationSchema, createSalesQuotationDefaultValues, emptyItemRow, isBlankItemRow,
  CONTACT_PERSON_OPTIONS, PAYMENT_TERMS_OPTIONS, SALES_PERSON_OPTIONS,
  CURRENCY_OPTIONS, PRICE_LIST_OPTIONS,
} from './createSalesQuotationSchema';
import { quotationToFormValues, formValuesToPayload } from './salesQuotationDisplay';

/**
 * "New Quotation" screen, also doubling as the Edit Quotation form when
 * SalesQuotationPage renders it with an `id` prop — everything (list,
 * create, edit, view) lives on the one /sales-quotation page. Fully wired to
 * the real backend (see backend/src/modules/sales-quotation): Customer
 * comes from the real Customer table, the Quotation No. is a live preview of
 * the next real code, and both "Save as Draft" and "Save & Send" actually
 * create/update a SalesQuotation row with the same validations enforced
 * again server-side.
 */
export default function CreateSalesQuotationPage({ id: propId, onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = propId ?? paramId;
  const isEditMode = Boolean(id);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);

  const { data: customers = [] } = useGetCustomersQuery({});
  const { data: existingQuotation, isLoading: isLoadingExisting, isError: loadError } = useGetSalesQuotationQuery(id, { skip: !isEditMode });
  const nextCode = useNextSalesQuotationCodeQuery(undefined, { skip: isEditMode });
  const [createSalesQuotation, { isLoading: isCreating }] = useCreateSalesQuotationMutation();
  const [updateSalesQuotation, { isLoading: isUpdating }] = useUpdateSalesQuotationMutation();
  const isSaving = isCreating || isUpdating;

  const customerOptions = useMemo(() => [
    { value: '', label: 'Select Customer', disabled: true },
    ...customers.map((c) => ({ value: c.id, label: c.name })),
  ], [customers]);
  const customerById = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c])), [customers]);

  const quotationCode = isEditMode ? existingQuotation?.code : nextCode.data;

  const methods = useForm({
    resolver: zodResolver(createSalesQuotationSchema),
    defaultValues: createSalesQuotationDefaultValues,
    mode: 'onTouched',
  });
  const { watch, reset, handleSubmit, setValue } = methods;

  // The edit-mode fetch is async, so the form can't be seeded via useForm's
  // defaultValues (that only runs once, before the data exists) — reset()
  // re-seeds every field once the real quotation row arrives.
  useEffect(() => {
    if (existingQuotation) reset(quotationToFormValues(existingQuotation, emptyItemRow));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingQuotation]);

  // Prefilling Mobile/Email/Address from the selected customer's own record
  // is a convenience, not a requirement — the quotation stores its own
  // snapshot of these fields (matching Sale's own "frozen at save time"
  // rule), so the user can still edit them per-quotation afterwards. Skips
  // the very first render (including the reset() above landing on an
  // existing customerId) so it only fires on an actual manual selection.
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
    if (isEditMode) return navigate(`/sales-quotation/view/${id}`);
    navigate('/sales-quotation');
  };

  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleAddCustomer = () => navigate('/customer');
  const handleAddItem = () => dispatch(showToast('Item picker is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  const save = async (values, status) => {
    const payload = formValuesToPayload(values, { status, isBlankItemRow });
    try {
      const saved = isEditMode
        ? await updateSalesQuotation({ id, ...payload }).unwrap()
        : await createSalesQuotation(payload).unwrap();
      dispatch(showToast(
        isEditMode
          ? `Quotation ${saved.code} updated successfully`
          : `Quotation ${saved.code} ${status === 'draft' ? 'saved as draft' : 'saved and sent'}`,
        'success',
      ));
      if (onBack) onBack(saved.id);
      else if (isEditMode) navigate(`/sales-quotation/view/${saved.id}`);
      else navigate('/sales-quotation');
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save the quotation', 'error'));
    }
  };

  // Editing an already-'pending' (or expired) quotation keeps saving as
  // 'pending' — only a genuine draft edit stays a draft; there's no reason
  // to demote a quotation that's already been sent back to draft just
  // because someone opened it to fix a typo.
  const editingStatus = existingQuotation?.dbStatus === 'draft' ? 'draft' : 'pending';
  const onSaveAsDraft = handleSubmit((values) => save(values, isEditMode ? editingStatus : 'draft'));
  const onSaveAndSend = handleSubmit((values) => save(values, 'pending'));

  if (isEditMode && isLoadingExisting) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading quotation…</Typography>
      </Stack>
    );
  }

  if (isEditMode && (loadError || !existingQuotation)) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Quotation not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={() => navigate('/sales-quotation')} sx={{ width: 'fit-content' }}>
          Back to Sales Quotation List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{isEditMode ? `Sales Quotation (Edit ${quotationCode || ''})` : 'Sales Quotation (New)'}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/sales-quotation" underline="hover" color="text.secondary">Sales Quotation</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{isEditMode ? 'Edit Quotation' : 'New Quotation'}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' }, justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            {isEditMode ? 'Back to Quotation' : 'Back'}
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
            <MenuItem onClick={() => reset(createSalesQuotationDefaultValues)}>Reset Form</MenuItem>
          </Menu>
          {isEditMode ? (
            <Button variant="contained" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSaveAsDraft} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Update Quotation'}
            </Button>
          ) : (
            <>
              <Button variant="outlined" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSaveAsDraft} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save as Draft'}
              </Button>
              <Button variant="contained" startIcon={<SendOutlinedIcon fontSize="small" />} onClick={onSaveAndSend} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save & Send'}
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

            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Quotation Details</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Quotation No." value={quotationCode || 'Generating…'} disabled fullWidth slotProps={{ input: { readOnly: true } }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormDatePicker name="quotationDate" label="Quotation Date *" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormDatePicker name="validTill" label="Valid Till *" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect name="paymentTerms" label="Payment Terms" options={PAYMENT_TERMS_OPTIONS} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect name="salesPerson" label="Sales Person *" options={SALES_PERSON_OPTIONS} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect name="currency" label="Currency" options={CURRENCY_OPTIONS} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField name="referenceNo" label="Reference No." placeholder="Enter Reference No." />
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
                <QuotationItemsTable onAddItem={handleAddItem} />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <QuotationTotalsCard />
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
  return <QuotationTermsAndNotes notes={notes} onNotesChange={(value) => setValue('notes', value)} />;
}
