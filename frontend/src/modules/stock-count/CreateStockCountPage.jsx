import { useMemo, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
  Paper, TextField, IconButton, InputAdornment, RadioGroup, FormControlLabel, Radio,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import FormTextField from '../../components/form/FormTextField';
import FormDatePicker from '../../components/form/FormDatePicker';
import FormSelect from '../../components/form/FormSelect';

import CountItemsTable from './components/CountItemsTable';
import CountSummaryTotals from './components/CountSummaryTotals';
import { COUNTS, getCountDetails } from './stockCountMockData';
import {
  createStockCountSchema, createStockCountDefaultValues,
  WAREHOUSE_OPTIONS, DEPARTMENT_OPTIONS, COST_CENTER_OPTIONS, COUNT_REASON_OPTIONS,
} from './createStockCountSchema';

// The mock detail record's countType/countBy are display labels ("Complete
// Count", "Item Wise Count"), not the create form's radio option values —
// map them back so the radios prefill correctly in edit mode.
function countTypeToValue(label) {
  return (label || '').toLowerCase().startsWith('partial') ? 'partial' : 'complete';
}
function countByToValue(label) {
  return (label || '').toLowerCase().startsWith('location') ? 'location-wise' : 'item-wise';
}

const DEFAULT_TERMS = [
  'Ensure accurate counting of all items.',
  'Report any damage, expiry or discrepancies.',
  'Counted quantity will be verified before posting.',
  'This is not a sale transaction.',
];

function nextCountCode() {
  const maxNum = COUNTS.reduce((max, c) => Math.max(max, Number(c.code.slice(4))), 0);
  return `CNT-${String(maxNum + 1).padStart(5, '0')}`;
}

/**
 * "New Stock Count" screen — matches the reference design's full create
 * form: three details cards side by side (Count Details / Count Method /
 * Other Details), a full-width editable items grid (System Qty / Counted
 * Qty / computed Variance Qty / Unit Cost / computed Variance Value), and
 * a 3-column row below it (Terms & Conditions / Notes / Summary) — same
 * overall pattern as CreateStockWastagePage, extended with the Count
 * Method card's two radio-button choices (Count Type, Count By) and a
 * Start/End Count Time pair, matching the reference's stopwatch icons.
 *
 * The reference's Other Details card carries its own "Notes" field
 * (bound to `otherNotes`) in addition to the full-width Notes panel in
 * the bottom row (bound to `notes`) — kept as two distinct fields here
 * exactly as laid out in the design, rather than merged into one.
 *
 * Warehouse, Department/Section, and Cost Center each get an inline "+"
 * add button, matching the Customer field's "+" pattern on the other
 * create forms. Count No. is read-only with a settings-gear adornment
 * (numbering configuration). Attachment is a local-only file picker (no
 * upload endpoint yet). Saving is mocked — there's no Stock Count backend
 * module yet.
 */
export default function CreateStockCountPage({ onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { code } = useParams();
  const isEditMode = Boolean(code);
  const existingCount = isEditMode ? getCountDetails(code) : null;
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');
  const countCode = useMemo(() => (isEditMode ? code : nextCountCode()), [isEditMode, code]);

  const methods = useForm({
    resolver: zodResolver(createStockCountSchema),
    defaultValues: existingCount
      ? {
          ...createStockCountDefaultValues,
          countDate: existingCount.date,
          warehouse: '',
          department: '',
          costCenter: '',
          countReason: '',
          countType: countTypeToValue(existingCount.countType),
          countBy: countByToValue(existingCount.countBy),
          binRack: existingCount.binRack && existingCount.binRack !== '—' ? existingCount.binRack : '',
          startCountTime: existingCount.startCountTime || '',
          endCountTime: existingCount.endCountTime || '',
          preparedBy: existingCount.preparedBy || '',
          approvedBy: existingCount.approvedBy && existingCount.approvedBy !== '—' ? existingCount.approvedBy : '',
        }
      : createStockCountDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit, watch, setValue } = methods;
  const countType = watch('countType');
  const countBy = watch('countBy');

  const handleBack = () => {
    if (isEditMode) navigate(`/stock-count/view/${code}`);
    else if (onBack) onBack();
    else navigate('/stock-count');
  };

  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleAddWarehouse = () => dispatch(showToast('Warehouse picker is coming soon', 'info'));
  const handleAddDepartment = () => dispatch(showToast('Department / Section picker is coming soon', 'info'));
  const handleAddCostCenter = () => dispatch(showToast('Cost Center picker is coming soon', 'info'));
  const handleAddItemRow = () => dispatch(showToast('Item picker is coming soon', 'info'));
  const handleAttachmentChange = (e) => setAttachmentName(e.target.files?.[0]?.name || '');
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  const onSaveAsDraft = handleSubmit(() => {
    dispatch(showToast(isEditMode ? `Count ${countCode} updated successfully` : `Count ${countCode} saved as draft`, 'success'));
    handleBack();
  });
  const onSaveAndSend = handleSubmit(() => {
    dispatch(showToast(isEditMode ? `Count ${countCode} updated successfully` : `Count ${countCode} saved and sent`, 'success'));
    handleBack();
  });

  if (isEditMode && !existingCount) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Count not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={() => navigate('/stock-count')} sx={{ width: 'fit-content' }}>
          Back to Stock Count List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{isEditMode ? `Stock Count (Edit ${countCode})` : 'Stock Count (New)'}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-count" underline="hover" color="text.secondary">Stock Count</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{isEditMode ? 'Edit Count' : 'New Stock Count'}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' }, justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            {isEditMode ? 'Back to Count' : 'Back'}
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
              Update Count
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
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Count Details</Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Count No."
                    value={countCode}
                    disabled
                    fullWidth
                    slotProps={{
                      input: {
                        readOnly: true,
                        endAdornment: <InputAdornment position="end"><SettingsOutlinedIcon fontSize="small" /></InputAdornment>,
                      },
                    }}
                  />
                  <FormDatePicker name="countDate" label="Count Date *" />
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <FormSelect name="warehouse" label="Warehouse *" options={WAREHOUSE_OPTIONS} />
                    </Box>
                    <IconButton
                      onClick={handleAddWarehouse}
                      sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                      aria-label="Add warehouse"
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
                  <FormSelect name="countReason" label="Count Reason *" options={COUNT_REASON_OPTIONS} />
                  <FormTextField name="countRemarks" label="Remarks" placeholder="Enter Remarks (if any)" multiline minRows={3} />
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Count Method</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Count Type *</Typography>
                    <RadioGroup
                      row
                      value={countType}
                      onChange={(e) => setValue('countType', e.target.value, { shouldValidate: true })}
                    >
                      <FormControlLabel value="complete" control={<Radio size="small" />} label={<Typography variant="body2">Complete Count</Typography>} />
                      <FormControlLabel value="partial" control={<Radio size="small" />} label={<Typography variant="body2">Partial Count</Typography>} />
                    </RadioGroup>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Count By *</Typography>
                    <RadioGroup
                      row
                      value={countBy}
                      onChange={(e) => setValue('countBy', e.target.value, { shouldValidate: true })}
                    >
                      <FormControlLabel value="item-wise" control={<Radio size="small" />} label={<Typography variant="body2">Item Wise Count</Typography>} />
                      <FormControlLabel value="location-wise" control={<Radio size="small" />} label={<Typography variant="body2">Location Wise Count</Typography>} />
                    </RadioGroup>
                  </Box>
                  <FormTextField name="binRack" label="Bin / Rack (if any)" placeholder="Enter Bin / Rack" />
                  <FormTextField
                    name="startCountTime"
                    label="Start Count Time"
                    placeholder="Select Time"
                    slotProps={{ input: { endAdornment: <InputAdornment position="end"><CalendarTodayOutlinedIcon fontSize="small" /></InputAdornment> } }}
                  />
                  <FormTextField
                    name="endCountTime"
                    label="End Count Time"
                    placeholder="Select Time"
                    slotProps={{ input: { endAdornment: <InputAdornment position="end"><CalendarTodayOutlinedIcon fontSize="small" /></InputAdornment> } }}
                  />
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 12, lg: 4 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Other Details</Typography>
                <Stack spacing={2}>
                  <FormTextField name="referenceNo" label="Reference (if any)" placeholder="Enter Reference" />
                  <FormTextField name="preparedBy" label="Prepared By" placeholder="Enter Prepared By" />
                  <FormTextField name="approvedBy" label="Approved By" placeholder="Enter Approved By (if any)" />
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
                  <FormTextField name="otherNotes" label="Notes" placeholder="Enter Notes (if any)" multiline minRows={3} />
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Items</Typography>
            <CountItemsTable onAddItem={handleAddItemRow} />
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
        <CountSummaryTotals />
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
