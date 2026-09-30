import { useEffect, useMemo, useState } from 'react';
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
import { useGetOutletsQuery } from '../../api/outletApi';
import { useGetProductsQuery } from '../../api/productApi';
import { useGetStockIndentsQuery } from '../../api/stockIndentApi';
import {
  useGetStockTransferQuery, useNextStockTransferCodeQuery,
  useCreateStockTransferMutation, useUpdateStockTransferMutation,
} from '../../api/stockTransferApi';

import TransferItemsTable from './components/TransferItemsTable';
import TransferSummaryTotals from './components/TransferSummaryTotals';
import { DEFAULT_TERMS } from './components/TransferTermsAndNotes';
import {
  createStockTransferSchema, createStockTransferDefaultValues, emptyItemRow, isBlankItemRow,
  DEPARTMENT_OPTIONS, PRIORITY_OPTIONS, COST_CENTER_OPTIONS,
} from './createStockTransferSchema';
import { transferToFormValues, formValuesToPayload } from './stockTransferDisplay';

/**
 * "New Stock Transfer" screen, also doubling as the Edit Transfer form when
 * StockTransferPage renders it with an `id` prop — everything (list,
 * create, edit, view) lives on the one /stock-transfer page. Fully wired to
 * the real backend (see backend/src/modules/stock-transfer): From Outlet/
 * To Outlet come from the real Outlet table (see useGetOutletsQuery), Stock
 * Indent comes from the real, approved Stock Indent rows (see
 * useGetStockIndentsQuery — honestly empty until a real approval-workflow
 * action exists), the Transfer No. is a live preview of the next real code,
 * Available Qty/Unit Cost in the item grid and the summary totals all look
 * up the real Product master, and both "Save as Draft" and "Save & Send"
 * actually create/update a StockTransfer row with the same validations
 * enforced again server-side. "Save & Send" saves with status 'in-transit'
 * — sending a transfer means the goods have been physically dispatched.
 *
 * Attachment stays a local-only file picker (there's no upload endpoint
 * yet), same as the reference design.
 */
export default function CreateStockTransferPage({ id: propId, onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = propId ?? paramId;
  const isEditMode = Boolean(id);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');

  const { data: existingTransfer, isLoading: isLoadingTransfer } = useGetStockTransferQuery(id, { skip: !isEditMode });
  const { data: nextCode } = useNextStockTransferCodeQuery(undefined, { skip: isEditMode });
  const { data: outlets = [] } = useGetOutletsQuery({});
  const { data: products = [] } = useGetProductsQuery({});
  const { data: indents = [] } = useGetStockIndentsQuery({});
  const [createTransfer, { isLoading: isCreating }] = useCreateStockTransferMutation();
  const [updateTransfer, { isLoading: isUpdating }] = useUpdateStockTransferMutation();
  const isSaving = isCreating || isUpdating;

  const transferCode = isEditMode ? existingTransfer?.code : nextCode;

  // Real Outlet options shared by From Outlet / To Outlet — the old mock
  // version hardcoded two different fixed lists of specific outlet names;
  // both dropdowns now draw from the same actual Outlet master instead.
  const outletOptions = useMemo(() => [
    { value: '', label: 'Select Outlet', disabled: true },
    ...outlets.map((o) => ({ value: o.id, label: o.name })),
  ], [outlets]);
  // Only real StockIndent rows already marked 'approved' by that module's
  // own workflow can be referenced here — same restriction the old mock
  // data applied to its fixed INDENTS array. Nothing can move an indent to
  // 'approved' yet (see backend/src/modules/stock-indent's model comment),
  // so this list stays honestly empty until that workflow exists.
  const stockIndentOptions = useMemo(() => [
    { value: '', label: 'Select Stock Indent' },
    ...indents.filter((ind) => ind.status === 'approved').map((ind) => ({ value: ind.code, label: ind.code })),
  ], [indents]);
  const productByCode = useMemo(() => Object.fromEntries(products.map((p) => [p.code, p])), [products]);

  const methods = useForm({
    resolver: zodResolver(createStockTransferSchema),
    defaultValues: createStockTransferDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit, reset } = methods;

  // The edit-mode fetch is async, so the form can't be seeded via useForm's
  // defaultValues (that only runs once, before the data exists) — reset()
  // re-seeds every field once the real transfer row arrives.
  useEffect(() => {
    if (isEditMode && existingTransfer) {
      reset(transferToFormValues(existingTransfer, emptyItemRow));
    }
  }, [isEditMode, existingTransfer, reset]);

  const handleBack = () => {
    if (onBack) return onBack();
    if (isEditMode) return navigate(`/stock-transfer/view/${id}`);
    navigate('/stock-transfer');
  };

  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleAddIndent = () => dispatch(showToast('Stock Indent picker is coming soon', 'info'));
  const handleAddOutlet = () => dispatch(showToast('Outlet picker is coming soon', 'info'));
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
        await updateTransfer({ id, ...payload }).unwrap();
        dispatch(showToast(`Transfer ${transferCode} updated successfully`, 'success'));
      } else {
        const created = await createTransfer(payload).unwrap();
        dispatch(showToast(`Transfer ${created.code} saved as draft`, 'success'));
      }
      handleBack();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save the transfer', 'error'));
    }
  });

  const onSaveAndSend = handleSubmit(async (values) => {
    try {
      const payload = formValuesToPayload(values, { status: 'in-transit', isBlankItemRow });
      if (isEditMode) {
        await updateTransfer({ id, ...payload }).unwrap();
        dispatch(showToast(`Transfer ${transferCode} updated successfully`, 'success'));
      } else {
        const created = await createTransfer(payload).unwrap();
        dispatch(showToast(`Transfer ${created.code} saved and sent`, 'success'));
      }
      handleBack();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save the transfer', 'error'));
    }
  });

  if (isEditMode && isLoadingTransfer) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading transfer…</Typography>
      </Stack>
    );
  }

  if (isEditMode && !isLoadingTransfer && !existingTransfer) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Transfer not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={() => navigate('/stock-transfer')} sx={{ width: 'fit-content' }}>
          Back to Stock Transfer List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{isEditMode ? `Stock Transfer (Edit ${transferCode || ''})` : 'Stock Transfer (New)'}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-transfer" underline="hover" color="text.secondary">Stock Transfer</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{isEditMode ? 'Edit Transfer' : 'New Stock Transfer'}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' }, justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            {isEditMode ? 'Back to Transfer' : 'Back'}
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
            <MenuItem onClick={() => reset(createStockTransferDefaultValues)}>Reset Form</MenuItem>
          </Menu>
          {isEditMode ? (
            <Button variant="contained" color="warning" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSaveAsDraft} disabled={isSaving}>
              Update Transfer
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
            <Grid size={{ xs: 12, lg: 5 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Transfer Details</Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Transfer No."
                    value={transferCode || ''}
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
                      <FormSelect name="stockIndentRef" label="Stock Indent" options={stockIndentOptions} />
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
                      <FormSelect name="fromOutlet" label="From Outlet *" options={outletOptions} />
                    </Box>
                    <IconButton
                      onClick={handleAddOutlet}
                      sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                      aria-label="Add from outlet"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <FormSelect name="toOutlet" label="To Outlet *" options={outletOptions} />
                    </Box>
                    <IconButton
                      onClick={handleAddOutlet}
                      sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                      aria-label="Add to outlet"
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
            <TransferItemsTable onAddItem={handleAddItemRow} productByCode={productByCode} />
          </Paper>

          <BottomRow productByCode={productByCode} />
        </Stack>
      </FormProvider>
    </Stack>
  );
}

// Terms & Conditions / Notes / Summary totals, laid out as a 3-column row
// matching the reference, with Notes bound to the form's `notes` field.
function BottomRow({ productByCode }) {
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
        <TransferSummaryTotals productByCode={productByCode} />
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
