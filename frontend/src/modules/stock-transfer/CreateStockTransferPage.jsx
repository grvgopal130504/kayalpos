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

import TransferItemsTable from './components/TransferItemsTable';
import TransferSummaryTotals from './components/TransferSummaryTotals';
import { DEFAULT_TERMS } from './components/TransferTermsAndNotes';
import { TRANSFERS } from './stockTransferMockData';
import {
  createStockTransferSchema, createStockTransferDefaultValues,
  STOCK_INDENT_OPTIONS, OUTLET_OPTIONS, TO_OUTLET_OPTIONS, DEPARTMENT_OPTIONS,
  PRIORITY_OPTIONS, COST_CENTER_OPTIONS,
} from './createStockTransferSchema';

function nextTransferCode() {
  const maxNum = TRANSFERS.reduce((max, t) => Math.max(max, Number(t.code.slice(4))), 0);
  return `TRF-${String(maxNum + 1).padStart(5, '0')}`;
}

/**
 * "New Stock Transfer" screen — matches the reference design's full
 * create form: a Transfer Details card (narrower left, single-column)
 * beside an Other Details card (single-column too, since this form has
 * fewer fields than Stock Indent's Request Details), a full-width
 * editable items grid with read-only Available Qty/Unit Cost/Total Cost
 * lookups, and a 3-column row below it (Terms & Conditions / Notes /
 * Summary) — same layout pattern as CreateStockIndentPage.
 *
 * Stock Indent, From Outlet, To Outlet/HO, Department/Section, and Cost
 * Center each get an inline "+" add button in the reference, matching the
 * Customer field's "+" pattern on the other create forms. Transfer No. is
 * read-only with a settings-gear adornment (numbering configuration).
 * Attachment is a simple local file picker (no upload endpoint yet).
 * Saving is mocked (no Stock Transfer backend module yet).
 */
export default function CreateStockTransferPage({ onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');
  const transferCode = useMemo(() => nextTransferCode(), []);

  const methods = useForm({
    resolver: zodResolver(createStockTransferSchema),
    defaultValues: createStockTransferDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit } = methods;

  const handleBack = () => {
    if (onBack) onBack(); else navigate('/stock-transfer/overview');
  };

  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleAddIndent = () => dispatch(showToast('Stock Indent picker is coming soon', 'info'));
  const handleAddFromOutlet = () => dispatch(showToast('Outlet picker is coming soon', 'info'));
  const handleAddToOutlet = () => dispatch(showToast('Outlet / HO picker is coming soon', 'info'));
  const handleAddDepartment = () => dispatch(showToast('Department / Section picker is coming soon', 'info'));
  const handleAddCostCenter = () => dispatch(showToast('Cost Center picker is coming soon', 'info'));
  const handleAddItemRow = () => dispatch(showToast('Item picker is coming soon', 'info'));
  const handleAttachmentChange = (e) => setAttachmentName(e.target.files?.[0]?.name || '');
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  const onSaveAsDraft = handleSubmit(() => {
    dispatch(showToast(`Transfer ${transferCode} saved as draft`, 'success'));
    handleBack();
  });
  const onSaveAndSend = handleSubmit(() => {
    dispatch(showToast(`Transfer ${transferCode} saved and sent`, 'success'));
    handleBack();
  });

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Stock Transfer (New)</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-transfer" underline="hover" color="text.secondary">Stock Transfer</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>New Stock Transfer</Typography>
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
            <Grid size={{ xs: 12, lg: 5 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Transfer Details</Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Transfer No."
                    value={transferCode}
                    disabled
                    fullWidth
                    slotProps={{
                      input: {
                        readOnly: true,
                        endAdornment: <InputAdornment position="end"><SettingsOutlinedIcon fontSize="small" /></InputAdornment>,
                      },
                    }}
                  />
                  <FormDatePicker name="transferDate" label="Transfer Date *" />
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <FormSelect name="stockIndentRef" label="Stock Indent" options={STOCK_INDENT_OPTIONS} />
                    </Box>
                    <IconButton
                      onClick={handleAddIndent}
                      sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                      aria-label="Add stock indent"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <FormSelect name="fromOutlet" label="From Outlet *" options={OUTLET_OPTIONS} />
                    </Box>
                    <IconButton
                      onClick={handleAddFromOutlet}
                      sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                      aria-label="Add from outlet"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <FormSelect name="toOutlet" label="To Outlet / HO *" options={TO_OUTLET_OPTIONS} />
                    </Box>
                    <IconButton
                      onClick={handleAddToOutlet}
                      sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                      aria-label="Add to outlet / HO"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <FormSelect name="department" label="Department / Section" options={DEPARTMENT_OPTIONS} />
                    </Box>
                    <IconButton
                      onClick={handleAddDepartment}
                      sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                      aria-label="Add department / section"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <FormTextField name="purposeRemarks" label="Purpose / Remarks" placeholder="Enter Purpose / Remarks" multiline minRows={3} />
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 7 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Other Details</Typography>
                <Stack spacing={2}>
                  <FormSelect name="priority" label="Priority" options={PRIORITY_OPTIONS} />
                  <FormTextField name="referenceNo" label="Reference (if any)" placeholder="Enter Reference" />
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
                  <FormTextField name="remarks" label="Remarks" placeholder="Enter Remarks (if any)" multiline minRows={3} />
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Items</Typography>
            <TransferItemsTable onAddItem={handleAddItemRow} />
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
        <TransferSummaryTotals />
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
