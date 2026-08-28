import { useMemo, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import FormTextField from '../../components/form/FormTextField';
import FormSelect from '../../components/form/FormSelect';

import QuotationItemsTable from './components/QuotationItemsTable';
import QuotationTotalsCard from './components/QuotationTotalsCard';
import QuotationTermsAndNotes from './components/QuotationTermsAndNotes';
import { QUOTATIONS } from './salesQuotationMockData';
import {
  createSalesQuotationSchema, createSalesQuotationDefaultValues,
  CUSTOMER_OPTIONS, CONTACT_PERSON_OPTIONS, PAYMENT_TERMS_OPTIONS, SALES_PERSON_OPTIONS,
  CURRENCY_OPTIONS, PRICE_LIST_OPTIONS,
} from './createSalesQuotationSchema';

function nextQuotationCode() {
  const maxNum = QUOTATIONS.reduce((max, q) => Math.max(max, Number(q.code.slice(4))), 0);
  return `QUO-${String(maxNum + 1).padStart(5, '0')}`;
}

/**
 * "New Quotation" screen — matches the reference design's full create form:
 * Customer Details + Quotation Details cards, an editable line-items grid
 * with a live totals summary, and Terms & Conditions / Notes below. Saving
 * is mocked (no Sales Quotation backend module yet), so both "Save as
 * Draft" and "Save & Send" just toast and hand control back to the caller.
 */
export default function CreateSalesQuotationPage({ onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const quotationCode = useMemo(() => nextQuotationCode(), []);

  const methods = useForm({
    resolver: zodResolver(createSalesQuotationSchema),
    defaultValues: createSalesQuotationDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit } = methods;

  const handleBack = () => {
    if (onBack) onBack(); else navigate('/sales-quotation/overview');
  };

  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleAddCustomer = () => navigate('/customer/add');
  const handleAddItem = () => dispatch(showToast('Item picker is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  const onSaveAsDraft = handleSubmit(() => {
    dispatch(showToast(`Quotation ${quotationCode} saved as draft`, 'success'));
    handleBack();
  });
  const onSaveAndSend = handleSubmit(() => {
    dispatch(showToast(`Quotation ${quotationCode} saved and sent`, 'success'));
    handleBack();
  });

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Sales Quotation (New)</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/sales-quotation" underline="hover" color="text.secondary">Sales Quotation</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>New Quotation</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' }, justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
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
          <Button variant="outlined" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSaveAsDraft}>
            Save as Draft
          </Button>
          <Button variant="contained" startIcon={<SendOutlinedIcon fontSize="small" />} onClick={onSaveAndSend}>
            Save &amp; Send
          </Button>
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
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Quotation Details</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Quotation No." value={quotationCode} disabled fullWidth slotProps={{ input: { readOnly: true } }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField
                      name="quotationDate"
                      label="Quotation Date *"
                      slotProps={{ input: { endAdornment: <InputAdornment position="end"><CalendarTodayOutlinedIcon fontSize="small" /></InputAdornment> } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField
                      name="validTill"
                      label="Valid Till *"
                      slotProps={{ input: { endAdornment: <InputAdornment position="end"><CalendarTodayOutlinedIcon fontSize="small" /></InputAdornment> } }}
                    />
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
                    <FormTextField
                      name="referenceDate"
                      label="Reference Date"
                      placeholder="Select Date"
                      slotProps={{ input: { endAdornment: <InputAdornment position="end"><CalendarTodayOutlinedIcon fontSize="small" /></InputAdornment> } }}
                    />
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
