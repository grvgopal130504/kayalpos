import { useMemo, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
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

import ReceiptItemsTable from './components/ReceiptItemsTable';
import ReceiptSummaryTotals from './components/ReceiptSummaryTotals';
import { RECEIPTS, getReceiptDetails } from './stockReceiptMockData';
import {
  createStockReceiptSchema, createStockReceiptDefaultValues,
  PURCHASE_TYPE_OPTIONS, SUPPLIER_OPTIONS, OUTLET_OPTIONS, COST_CENTER_OPTIONS,
} from './createStockReceiptSchema';

const DEFAULT_TERMS = [
  'Goods once received will not be taken back.',
  'Please verify items, quantity & quality before acceptance.',
  'Any dispute should be reported within 7 days.',
  'This is not a sale transaction.',
];

function nextReceiptCode() {
  const maxNum = RECEIPTS.reduce((max, r) => Math.max(max, Number(r.code.slice(5))), 0);
  return `RCPT-${String(maxNum + 1).padStart(5, '0')}`;
}

/**
 * "New Stock Receipt" screen — matches the reference design's full create
 * form: three details cards side by side (Receipt Details / Supplier &
 * Source Details / Other Details), a full-width editable items grid
 * (Ordered Qty / Received Qty / Unit Cost / Discount / Tax / computed
 * Total Cost / Warehouse / Batch No. / Expiry Date), and a 3-column row
 * below it (Terms & Conditions / Notes / Summary) — same overall pattern
 * as CreateStockTransferPage/CreateStockIndentPage, extended to the
 * receipt-specific fields.
 *
 * Supplier, From Outlet/HO, and Cost Center each get an inline "+" add
 * button, matching the Customer field's "+" pattern on the other create
 * forms. Receipt No. is read-only with a settings-gear adornment
 * (numbering configuration). Attachment is a local-only file picker (no
 * upload endpoint yet). Saving is mocked — there's no Stock Receipt
 * backend module yet.
 */
export default function CreateStockReceiptPage({ onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { code } = useParams();
  const isEditMode = Boolean(code);
  const existingReceipt = isEditMode ? getReceiptDetails(code) : null;
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');
  const receiptCode = useMemo(() => (isEditMode ? code : nextReceiptCode()), [isEditMode, code]);

  const methods = useForm({
    resolver: zodResolver(createStockReceiptSchema),
    defaultValues: existingReceipt
      ? {
          ...createStockReceiptDefaultValues,
          receiptDate: existingReceipt.date,
          purchaseType: existingReceipt.purchaseType,
          purchaseInvoiceNo: existingReceipt.invoiceNo || '',
          purchaseInvoiceDate: existingReceipt.invoiceDate || '',
          grnDcNo: existingReceipt.grnDcNo || '',
          contactPerson: existingReceipt.contactPerson || '',
          mobileNo: existingReceipt.mobileNo || '',
          vehicleNo: existingReceipt.vehicleNo || '',
          transporter: existingReceipt.transporter || '',
        }
      : createStockReceiptDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit } = methods;

  const handleBack = () => {
    if (isEditMode) navigate(`/stock-receipt/view/${code}`);
    else if (onBack) onBack();
    else navigate('/stock-receipt');
  };

  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleAddSupplier = () => dispatch(showToast('Supplier picker is coming soon', 'info'));
  const handleAddFromOutlet = () => dispatch(showToast('Outlet / HO picker is coming soon', 'info'));
  const handleAddCostCenter = () => dispatch(showToast('Cost Center picker is coming soon', 'info'));
  const handleAddItemRow = () => dispatch(showToast('Item picker is coming soon', 'info'));
  const handleAttachmentChange = (e) => setAttachmentName(e.target.files?.[0]?.name || '');
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  const onSaveAsDraft = handleSubmit(() => {
    dispatch(showToast(isEditMode ? `Receipt ${receiptCode} updated successfully` : `Receipt ${receiptCode} saved as draft`, 'success'));
    handleBack();
  });
  const onSaveAndSend = handleSubmit(() => {
    dispatch(showToast(isEditMode ? `Receipt ${receiptCode} updated successfully` : `Receipt ${receiptCode} saved and sent`, 'success'));
    handleBack();
  });

  if (isEditMode && !existingReceipt) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Receipt not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={() => navigate('/stock-receipt')} sx={{ width: 'fit-content' }}>
          Back to Stock Receipt List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{isEditMode ? `Stock Receipt (Edit ${receiptCode})` : 'Stock Receipt (New)'}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-receipt" underline="hover" color="text.secondary">Stock Receipt</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{isEditMode ? 'Edit Receipt' : 'New Stock Receipt'}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' }, justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            {isEditMode ? 'Back to Receipt' : 'Back'}
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
            <Button variant="contained" color="warning" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSaveAsDraft}>
              Update Receipt
            </Button>
          ) : (
            <>
              <Button variant="outlined" color="warning" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSaveAsDraft}>
                Save as Draft
              </Button>
              <Button variant="contained" color="warning" startIcon={<SendOutlinedIcon fontSize="small" />} onClick={onSaveAndSend}>
                Save &amp; Send
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      <FormProvider {...methods}>
        <Stack spacing={2} component="form" noValidate>
          <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Receipt Details</Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Receipt No."
                    value={receiptCode}
                    disabled
                    fullWidth
                    slotProps={{
                      input: {
                        readOnly: true,
                        endAdornment: <InputAdornment position="end"><SettingsOutlinedIcon fontSize="small" /></InputAdornment>,
                      },
                    }}
                  />
                  <FormDatePicker name="receiptDate" label="Receipt Date *" />
                  <FormSelect name="purchaseType" label="Purchase Type *" options={PURCHASE_TYPE_OPTIONS} />
                  <FormTextField name="purchaseInvoiceNo" label="Purchase Invoice No." placeholder="Enter Purchase Invoice No." />
                  <FormDatePicker name="purchaseInvoiceDate" label="Purchase Invoice Date" placeholder="Select Invoice Date" />
                  <FormTextField name="grnDcNo" label="GRN / DC No." placeholder="Enter GRN / DC No." />
                  <FormDatePicker name="grnDcDate" label="GRN / DC Date" placeholder="Select GRN / DC Date" />
                  <FormTextField name="receiptRemarks" label="Remarks" placeholder="Enter Remarks (if any)" multiline minRows={3} />
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Supplier / Source Details</Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <FormSelect name="supplier" label="Supplier *" options={SUPPLIER_OPTIONS} />
                    </Box>
                    <IconButton
                      onClick={handleAddSupplier}
                      sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                      aria-label="Add supplier"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <FormSelect name="fromOutlet" label="From Outlet / HO *" options={OUTLET_OPTIONS} />
                    </Box>
                    <IconButton
                      onClick={handleAddFromOutlet}
                      sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                      aria-label="Add from outlet / HO"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <FormSelect name="costCenter" label="Cost Center" options={COST_CENTER_OPTIONS} />
                    </Box>
                    <IconButton
                      onClick={handleAddCostCenter}
                      sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                      aria-label="Add cost center"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <FormTextField name="contactPerson" label="Contact Person" placeholder="Enter Contact Person" />
                  <FormTextField name="mobileNo" label="Mobile No." placeholder="Enter Mobile No." />
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 12, lg: 4 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Other Details</Typography>
                <Stack spacing={2}>
                  <FormTextField name="referenceNo" label="Reference (if any)" placeholder="Enter Reference" />
                  <FormTextField name="vehicleNo" label="Vehicle No." placeholder="Enter Vehicle No." />
                  <FormTextField name="transporter" label="Transporter" placeholder="Enter Transporter" />
                  <FormTextField name="deliveryChallanNo" label="Delivery Challan No." placeholder="Enter Delivery Challan No." />
                  <Stack spacing={0.5}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Attachment</Typography>
                    <Button variant="outlined" color="inherit" component="label" sx={{ justifyContent: 'flex-start', width: { xs: '100%', sm: 'auto' } }}>
                      Choose File
                      <input type="file" hidden onChange={handleAttachmentChange} />
                    </Button>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {attachmentName || 'No file chosen'} &nbsp;(Max file size: 5MB)
                    </Typography>
                  </Stack>
                  <FormTextField name="otherRemarks" label="Remarks" placeholder="Enter Remarks (if any)" multiline minRows={3} />
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Items</Typography>
            <ReceiptItemsTable onAddItem={handleAddItemRow} />
          </Paper>

          <BottomRow />
        </Stack>
      </FormProvider>
    </Stack>
  );
}

// Terms & Conditions / Notes / Summary totals, laid out as a 3-column row
// matching the reference, with Notes bound to the form's `notes` field.
function BottomRow() {
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
        <NotesField />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <ReceiptSummaryTotals />
      </Grid>
    </Grid>
  );
}

function NotesField() {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Notes</Typography>
      <FormTextField name="notes" placeholder="Enter notes (optional)" multiline minRows={4} fullWidth />
    </Paper>
  );
}
