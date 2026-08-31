import { useMemo, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import FormTextField from '../../components/form/FormTextField';
import FormDatePicker from '../../components/form/FormDatePicker';
import FormSelect from '../../components/form/FormSelect';

import ReturnItemsTable from './components/ReturnItemsTable';
import ReturnSummaryTotals from './components/ReturnSummaryTotals';
import { RETURNS } from './stockReturnMockData';
import {
  createStockReturnSchema, createStockReturnDefaultValues,
  RETURN_TYPE_OPTIONS, REFERENCE_TYPE_OPTIONS, REFERENCE_NO_OPTIONS,
  SUPPLIER_OPTIONS, OUTLET_OPTIONS, COST_CENTER_OPTIONS,
} from './createStockReturnSchema';

const DEFAULT_TERMS = [
  'Returned goods must be in original condition.',
  'Goods once returned will not be accepted again.',
  'Please ensure correct items & quantities.',
  'This is not a sale transaction.',
];

function nextReturnCode() {
  const maxNum = RETURNS.reduce((max, r) => Math.max(max, Number(r.code.slice(4))), 0);
  return `RRT-${String(maxNum + 1).padStart(5, '0')}`;
}

/**
 * "New Stock Return" screen — matches the reference design's full create
 * form: three details cards side by side (Return Details / Supplier &
 * Source Details / Other Details), a full-width editable items grid
 * (Returned Qty / Unit Cost / Discount / Tax / computed Total Cost /
 * Warehouse / Batch No. / Expiry Date), and a 3-column row below it
 * (Terms & Conditions / Notes / Summary) — same overall pattern as
 * CreateStockReceiptPage, adjusted for a return document (Return Type,
 * Reference Type/No./Date, Return Reason instead of a purchase-order
 * lineage).
 *
 * Reference No., Supplier, From Outlet/HO, and Cost Center each get an
 * inline "+" add button, matching the Customer field's "+" pattern on the
 * other create forms. Return No. is read-only with a settings-gear
 * adornment (numbering configuration). Attachment is a local-only file
 * picker (no upload endpoint yet). Saving is mocked — there's no Stock
 * Return backend module yet.
 */
export default function CreateStockReturnPage({ onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');
  const returnCode = useMemo(() => nextReturnCode(), []);

  const methods = useForm({
    resolver: zodResolver(createStockReturnSchema),
    defaultValues: createStockReturnDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit } = methods;

  const handleBack = () => {
    if (onBack) onBack(); else navigate('/stock-return');
  };

  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleAddReference = () => dispatch(showToast('Purchase Invoice picker is coming soon', 'info'));
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
    dispatch(showToast(`Return ${returnCode} saved as draft`, 'success'));
    handleBack();
  });
  const onSaveAndSend = handleSubmit(() => {
    dispatch(showToast(`Return ${returnCode} saved and sent`, 'success'));
    handleBack();
  });

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Stock Return (New)</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-return" underline="hover" color="text.secondary">Stock Return</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>New Stock Return</Typography>
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
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Return Details</Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Return No."
                    value={returnCode}
                    disabled
                    fullWidth
                    slotProps={{
                      input: {
                        readOnly: true,
                        endAdornment: <InputAdornment position="end"><SettingsOutlinedIcon fontSize="small" /></InputAdornment>,
                      },
                    }}
                  />
                  <FormDatePicker name="returnDate" label="Return Date *" />
                  <FormSelect name="returnType" label="Return Type *" options={RETURN_TYPE_OPTIONS} />
                  <FormSelect name="referenceType" label="Reference Type *" options={REFERENCE_TYPE_OPTIONS} />
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <FormSelect name="referenceNo" label="Reference No. *" options={REFERENCE_NO_OPTIONS} />
                    </Box>
                    <IconButton
                      onClick={handleAddReference}
                      sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                      aria-label="Add reference"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <FormDatePicker name="referenceDate" label="Reference Date" />
                  <FormTextField name="returnReason" label="Return Reason" placeholder="Enter Return Reason" multiline minRows={2} />
                  <FormTextField name="returnRemarks" label="Remarks" placeholder="Enter Remarks (if any)" multiline minRows={3} />
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
                  <FormTextField name="grnDcNo" label="GRN / DC No." placeholder="Enter GRN / DC No." />
                  <FormDatePicker name="grnDcDate" label="GRN / DC Date" placeholder="Select GRN / DC Date" />
                  <FormTextField name="vehicleNo" label="Vehicle No." placeholder="Enter Vehicle No." />
                  <FormTextField name="transporter" label="Transporter" placeholder="Enter Transporter" />
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
            <ReturnItemsTable onAddItem={handleAddItemRow} />
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
        <ReturnSummaryTotals />
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
