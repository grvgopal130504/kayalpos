import { useEffect, useState } from 'react';
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
import { useGetProductsQuery } from '../../api/productApi';
import {
  useGetStockCountQuery, useNextStockCountCodeQuery,
  useCreateStockCountMutation, useUpdateStockCountMutation,
} from '../../api/stockCountApi';

import CountItemsTable from './components/CountItemsTable';
import CountSummaryTotals from './components/CountSummaryTotals';
import {
  createStockCountSchema, createStockCountDefaultValues, emptyItemRow, isBlankItemRow,
  WAREHOUSE_OPTIONS, DEPARTMENT_OPTIONS, COST_CENTER_OPTIONS, COUNT_REASON_OPTIONS,
} from './createStockCountSchema';
import { countToFormValues, formValuesToPayload } from './stockCountDisplay';

const DEFAULT_TERMS = [
  'Ensure accurate counting of all items.',
  'Report any damage, expiry or discrepancies.',
  'Counted quantity will be verified before posting.',
  'This is not a sale transaction.',
];

/**
 * "New Stock Count" screen, also doubling as the Edit Count form when
 * StockCountPage renders it with an `id` prop — everything (list, create,
 * edit, view) lives on the one /stock-count page. Fully wired to the real
 * backend (see backend/src/modules/stock-count): the Count No. is a live
 * preview of the next real code, and both "Save as Draft" and "Save & Send"
 * actually create/update a StockCount row with the same validations
 * enforced again server-side. "Save & Send" saves with status 'completed' —
 * a count is considered final the moment it's posted, same terminal-step
 * reasoning Stock Wastage's/Stock Return's own "Save & Send" use.
 *
 * Warehouse/Department/Cost Center/Count Reason stay fixed dropdowns (no
 * backing master table exists for any of them yet, same scope decision
 * Stock Wastage/Stock Return/Stock Receipt make for their own analogous
 * fields). Count Type/Count By are plain radio choices, not master data.
 *
 * The Item Code cell is a searchable select against the real Product master
 * (see ItemCodeAutocomplete via CountItemsTable), which autofills Item
 * Name/HSN/UoM when a product is picked — System Qty/Counted Qty/Unit Cost
 * are always the real figures the user types, never looked up.
 *
 * Prepared By / Approved By stay plain free-text inputs the user fills in
 * directly — same "no auto-stamp" rule Stock Wastage's own preparedBy/
 * approvedBy follow.
 *
 * Attachment stays a local-only file picker (there's no upload endpoint
 * yet), same as Stock Receipt/Stock Return/Stock Wastage.
 */
export default function CreateStockCountPage({ id: propId, onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = propId ?? paramId;
  const isEditMode = Boolean(id);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');

  const { data: existingCount, isLoading: isLoadingCount } = useGetStockCountQuery(id, { skip: !isEditMode });
  const { data: nextCode } = useNextStockCountCodeQuery(undefined, { skip: isEditMode });
  const { data: products = [] } = useGetProductsQuery({});
  const [createCount, { isLoading: isCreating }] = useCreateStockCountMutation();
  const [updateCount, { isLoading: isUpdating }] = useUpdateStockCountMutation();
  const isSaving = isCreating || isUpdating;

  const countCode = isEditMode ? existingCount?.code : nextCode;

  const methods = useForm({
    resolver: zodResolver(createStockCountSchema),
    defaultValues: createStockCountDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit, watch, setValue, reset } = methods;
  const countType = watch('countType');
  const countBy = watch('countBy');

  // The edit-mode fetch is async, so the form can't be seeded via useForm's
  // defaultValues (that only runs once, before the data exists) — reset()
  // re-seeds every field once the real count row arrives.
  useEffect(() => {
    if (isEditMode && existingCount) {
      reset(countToFormValues(existingCount, emptyItemRow));
    }
  }, [isEditMode, existingCount, reset]);

  const handleBack = () => {
    if (onBack) return onBack();
    if (isEditMode) return navigate(`/stock-count/view/${id}`);
    navigate('/stock-count');
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

  const onSaveAsDraft = handleSubmit(async (values) => {
    try {
      const payload = formValuesToPayload(values, { status: 'draft', isBlankItemRow });
      if (isEditMode) {
        await updateCount({ id, ...payload }).unwrap();
        dispatch(showToast(`Count ${countCode} updated successfully`, 'success'));
      } else {
        const created = await createCount(payload).unwrap();
        dispatch(showToast(`Count ${created.code} saved as draft`, 'success'));
      }
      handleBack();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save the count', 'error'));
    }
  });

  const onSaveAndSend = handleSubmit(async (values) => {
    try {
      const payload = formValuesToPayload(values, { status: 'completed', isBlankItemRow });
      if (isEditMode) {
        await updateCount({ id, ...payload }).unwrap();
        dispatch(showToast(`Count ${countCode} updated successfully`, 'success'));
      } else {
        const created = await createCount(payload).unwrap();
        dispatch(showToast(`Count ${created.code} saved and sent`, 'success'));
      }
      handleBack();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save the count', 'error'));
    }
  });

  if (isEditMode && isLoadingCount) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading count…</Typography>
      </Stack>
    );
  }

  if (isEditMode && !isLoadingCount && !existingCount) {
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
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{isEditMode ? `Stock Count (Edit ${countCode || ''})` : 'Stock Count (New)'}</Typography>
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
            <MenuItem onClick={() => reset(createStockCountDefaultValues)}>Reset Form</MenuItem>
          </Menu>
          {isEditMode ? (
            <Button variant="contained" color="warning" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSaveAsDraft} disabled={isSaving}>
              Update Count
            </Button>
          ) : (
            <>
              <Button variant="outlined" color="warning" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSaveAsDraft} disabled={isSaving}>
                Save as Draft
              </Button>
              <Button variant="contained" color="warning" startIcon={<SendOutlinedIcon fontSize="small" />} onClick={onSaveAndSend} disabled={isSaving}>
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
                    value={countCode || ''}
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
            <CountItemsTable onAddItem={handleAddItemRow} products={products} />
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
