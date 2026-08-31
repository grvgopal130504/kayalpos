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
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import FormTextField from '../../components/form/FormTextField';
import FormDatePicker from '../../components/form/FormDatePicker';
import FormSelect from '../../components/form/FormSelect';

import InvoiceItemsTable from './components/InvoiceItemsTable';
import InvoiceTotalsCard from './components/InvoiceTotalsCard';
import InvoiceTermsAndNotes, { DEFAULT_TERMS } from './components/InvoiceTermsAndNotes';
import { INVOICES } from './salesInvoiceMockData';
import {
  createSalesInvoiceSchema, createSalesInvoiceDefaultValues,
  CUSTOMER_OPTIONS, CONTACT_PERSON_OPTIONS, PAYMENT_TERMS_OPTIONS, SALES_PERSON_OPTIONS,
  CURRENCY_OPTIONS, PRICE_LIST_OPTIONS, SALES_ORDER_OPTIONS, QUOTATION_REFERENCE_OPTIONS,
} from './createSalesInvoiceSchema';

function nextInvoiceCode() {
  const maxNum = INVOICES.reduce((max, inv) => Math.max(max, Number(inv.code.slice(4))), 0);
  return `INV-${String(maxNum + 1).padStart(5, '0')}`;
}

/**
 * "New Sales Invoice" screen — matches the reference design's full create
 * form: Customer Details (narrower left card) + Invoice Details (wider
 * right card, laid out 3-fields-per-row instead of the 2-per-row used on
 * the Quotation/Order forms), a full-width editable line-items grid, and
 * a 3-column row below it (Terms & Conditions / Notes / Summary totals) —
 * unlike Quotation/Order, the totals card sits beside Terms & Notes here
 * rather than beside the items grid, matching the reference layout.
 *
 * Two fields in the reference get an inline "+" add button (Sales Order,
 * Quotation Reference), same pattern as the Customer field. Invoice No.
 * is read-only with a settings-gear adornment (numbering configuration)
 * instead of a plain disabled field. Saving is mocked (no Sales Invoice
 * backend module yet).
 */
export default function CreateSalesInvoicePage({ onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const invoiceCode = useMemo(() => nextInvoiceCode(), []);

  const methods = useForm({
    resolver: zodResolver(createSalesInvoiceSchema),
    defaultValues: createSalesInvoiceDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit } = methods;

  const handleBack = () => {
    if (onBack) onBack(); else navigate('/sales-invoice/overview');
  };

  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleAddCustomer = () => navigate('/customer/add');
  const handleAddSalesOrder = () => dispatch(showToast('Sales Order picker is coming soon', 'info'));
  const handleAddQuotation = () => dispatch(showToast('Quotation picker is coming soon', 'info'));
  const handleAddItem = () => dispatch(showToast('Item picker is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  const onSaveAsDraft = handleSubmit(() => {
    dispatch(showToast(`Invoice ${invoiceCode} saved as draft`, 'success'));
    handleBack();
  });
  const onSaveAndSend = handleSubmit(() => {
    dispatch(showToast(`Invoice ${invoiceCode} saved and sent`, 'success'));
    handleBack();
  });

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Sales Invoice (New)</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/sales-invoice" underline="hover" color="text.secondary">Sales Invoice</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>New Sales Invoice</Typography>
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
          <Button variant="outlined" color="warning" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSaveAsDraft}>
            Save as Draft
          </Button>
          <Button variant="contained" color="warning" startIcon={<SendOutlinedIcon fontSize="small" />} onClick={onSaveAndSend}>
            Save &amp; Send
          </Button>
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

            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Invoice Details</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Invoice No."
                      value={invoiceCode}
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
                        <FormSelect name="salesOrderRef" label="Sales Order" options={SALES_ORDER_OPTIONS} />
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
                        <FormSelect name="quotationRef" label="Quotation Reference" options={QUOTATION_REFERENCE_OPTIONS} />
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
            <InvoiceItemsTable onAddItem={handleAddItem} />
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
