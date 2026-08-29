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
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import FormTextField from '../../components/form/FormTextField';
import FormSelect from '../../components/form/FormSelect';

import IndentItemsTable from './components/IndentItemsTable';
import IndentSummaryTotals from './components/IndentSummaryTotals';
import { DEFAULT_TERMS } from './components/IndentTermsAndNotes';
import { INDENTS } from './stockIndentMockData';
import {
  createStockIndentSchema, createStockIndentDefaultValues,
  DEPARTMENT_OPTIONS, OUTLET_OPTIONS, TO_OUTLET_OPTIONS, REQUESTOR_OPTIONS,
  PRIORITY_OPTIONS, LOCATION_OPTIONS, COST_CENTER_OPTIONS,
} from './createStockIndentSchema';

function nextIndentCode() {
  const maxNum = INDENTS.reduce((max, ind) => Math.max(max, Number(ind.code.slice(4))), 0);
  return `IND-${String(maxNum + 1).padStart(5, '0')}`;
}

/**
 * "New Stock Indent" screen — matches the reference design's full create
 * form: an Indent Details card (narrower left) beside a wider Request
 * Details card laid out 2-fields-per-row, a full-width editable items
 * grid with a read-only Available Qty column, and a 3-column row below it
 * (Terms & Conditions / Notes / Summary) — same layout pattern as
 * CreateSalesInvoicePage/CreateBarcodeLabelPage.
 *
 * From Outlet, To Outlet/HO, Requestor, Location, and Cost Center each get
 * an inline "+" add button in the reference, matching the Customer
 * field's "+" pattern on the other create forms. Indent No. is read-only
 * with a settings-gear adornment (numbering configuration) instead of a
 * plain disabled field. Attachment is a simple file picker (local-only —
 * there's no upload endpoint yet). Saving is mocked (no Stock Indent
 * backend module yet).
 */
export default function CreateStockIndentPage({ onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');
  const indentCode = useMemo(() => nextIndentCode(), []);

  const methods = useForm({
    resolver: zodResolver(createStockIndentSchema),
    defaultValues: createStockIndentDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit } = methods;

  const handleBack = () => {
    if (onBack) onBack(); else navigate('/stock-indent/overview');
  };

  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleAddDepartment = () => dispatch(showToast('Department / Section picker is coming soon', 'info'));
  const handleAddFromOutlet = () => dispatch(showToast('Outlet picker is coming soon', 'info'));
  const handleAddToOutlet = () => dispatch(showToast('Outlet / HO picker is coming soon', 'info'));
  const handleAddRequestor = () => dispatch(showToast('Requestor picker is coming soon', 'info'));
  const handleAddLocation = () => dispatch(showToast('Location picker is coming soon', 'info'));
  const handleAddCostCenter = () => dispatch(showToast('Cost Center picker is coming soon', 'info'));
  const handleAddItemRow = () => dispatch(showToast('Item picker is coming soon', 'info'));
  const handleAttachmentChange = (e) => setAttachmentName(e.target.files?.[0]?.name || '');
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  const onSaveAsDraft = handleSubmit(() => {
    dispatch(showToast(`Indent ${indentCode} saved as draft`, 'success'));
    handleBack();
  });
  const onSaveAndSend = handleSubmit(() => {
    dispatch(showToast(`Indent ${indentCode} saved and sent for approval`, 'success'));
    handleBack();
  });

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Stock Indent (New)</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-indent" underline="hover" color="text.secondary">Stock Indent</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>New Stock Indent</Typography>
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
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Indent Details</Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Indent No."
                    value={indentCode}
                    disabled
                    fullWidth
                    slotProps={{
                      input: {
                        readOnly: true,
                        endAdornment: <InputAdornment position="end"><SettingsOutlinedIcon fontSize="small" /></InputAdornment>,
                      },
                    }}
                  />
                  <FormTextField
                    name="indentDate"
                    label="Indent Date *"
                    slotProps={{ input: { endAdornment: <InputAdornment position="end"><CalendarTodayOutlinedIcon fontSize="small" /></InputAdornment> } }}
                  />
                  <FormTextField
                    name="requiredDate"
                    label="Required Date *"
                    slotProps={{ input: { endAdornment: <InputAdornment position="end"><CalendarTodayOutlinedIcon fontSize="small" /></InputAdornment> } }}
                  />
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <FormSelect name="department" label="Department / Section *" options={DEPARTMENT_OPTIONS} />
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

            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Request Details</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
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
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
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
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <FormSelect name="requestor" label="Requestor *" options={REQUESTOR_OPTIONS} />
                      </Box>
                      <IconButton
                        onClick={handleAddRequestor}
                        sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                        aria-label="Add requestor"
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect name="priority" label="Priority *" options={PRIORITY_OPTIONS} />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField name="designation" label="Designation" placeholder="Enter Designation" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField name="referenceNo" label="Reference (if any)" placeholder="Enter Reference" />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <FormSelect name="location" label="Location *" options={LOCATION_OPTIONS} />
                      </Box>
                      <IconButton
                        onClick={handleAddLocation}
                        sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                        aria-label="Add location"
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Attachment</Typography>
                      <Button variant="outlined" color="inherit" component="label" sx={{ justifyContent: 'flex-start' }}>
                        Choose File
                        <input type="file" hidden onChange={handleAttachmentChange} />
                      </Button>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {attachmentName || 'No file chosen'} &nbsp;(Max file size: 5MB)
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
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
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField name="remarks" label="Remarks" placeholder="Enter Remarks (if any)" multiline minRows={2} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Items</Typography>
            <IndentItemsTable onAddItem={handleAddItemRow} />
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
        <IndentSummaryTotals />
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
