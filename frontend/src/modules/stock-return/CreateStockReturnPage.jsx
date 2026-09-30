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
import { useGetSuppliersQuery } from '../../api/supplierApi';
import { useGetOutletsQuery } from '../../api/outletApi';
import { useGetProductsQuery } from '../../api/productApi';
import {
  useGetStockReturnQuery, useNextStockReturnCodeQuery,
  useCreateStockReturnMutation, useUpdateStockReturnMutation,
} from '../../api/stockReturnApi';

import ReturnItemsTable from './components/ReturnItemsTable';
import ReturnSummaryTotals from './components/ReturnSummaryTotals';
import {
  createStockReturnSchema, createStockReturnDefaultValues, emptyItemRow, isBlankItemRow,
  RETURN_TYPE_OPTIONS, REFERENCE_TYPE_OPTIONS, COST_CENTER_OPTIONS,
} from './createStockReturnSchema';
import { returnToFormValues, formValuesToPayload } from './stockReturnDisplay';

const DEFAULT_TERMS = [
  'Returned goods must be in original condition.',
  'Goods once returned will not be accepted again.',
  'Please ensure correct items & quantities.',
  'This is not a sale transaction.',
];

/**
 * "New Stock Return" screen, also doubling as the Edit Return form when
 * StockReturnPage renders it with an `id` prop — everything (list, create,
 * edit, view) lives on the one /stock-return page. Fully wired to the real
 * backend (see backend/src/modules/stock-return): Supplier and From Outlet/
 * HO come from the real Supplier/Outlet tables (see
 * useGetSuppliersQuery/useGetOutletsQuery), the Return No. is a live preview
 * of the next real code, and both "Save as Draft" and "Save & Send" actually
 * create/update a StockReturn row with the same validations enforced again
 * server-side. "Save & Send" saves with status 'accepted' — a return is
 * considered final the moment it's sent back to the supplier, same
 * terminal-step reasoning Stock Receipt's own "Save & Send" uses.
 *
 * Reference Type stays a fixed dropdown (no Purchase Invoice/GRN master
 * table exists yet) and Reference No. is now plain free text rather than a
 * picker over fabricated invoice numbers — the honest choice when there's
 * no real list to select from.
 *
 * The Item Code cell is a searchable select against the real Product master
 * (see ItemCodeAutocomplete), which autofills Item Name/HSN/UoM when a
 * product is picked — Returned Qty/Unit Cost/Discount/Tax are always the
 * real figures the user types for the returned goods, never looked up.
 *
 * Attachment stays a local-only file picker (there's no upload endpoint
 * yet), same as Stock Receipt.
 */
export default function CreateStockReturnPage({ id: propId, onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = propId ?? paramId;
  const isEditMode = Boolean(id);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');

  const { data: existingReturn, isLoading: isLoadingReturn } = useGetStockReturnQuery(id, { skip: !isEditMode });
  const { data: nextCode } = useNextStockReturnCodeQuery(undefined, { skip: isEditMode });
  const { data: suppliers = [] } = useGetSuppliersQuery({});
  const { data: outlets = [] } = useGetOutletsQuery({});
  const { data: products = [] } = useGetProductsQuery({});
  const [createReturn, { isLoading: isCreating }] = useCreateStockReturnMutation();
  const [updateReturn, { isLoading: isUpdating }] = useUpdateStockReturnMutation();
  const isSaving = isCreating || isUpdating;

  const returnCode = isEditMode ? existingReturn?.code : nextCode;

  // Real Supplier/Outlet options — the old mock version hardcoded both as
  // fixed lists of specific supplier/outlet names.
  const supplierOptions = useMemo(() => [
    { value: '', label: 'Select Supplier', disabled: true },
    ...suppliers.map((s) => ({ value: s.id, label: s.name })),
  ], [suppliers]);
  const outletOptions = useMemo(() => [
    { value: '', label: 'Select From Outlet / HO', disabled: true },
    ...outlets.map((o) => ({ value: o.id, label: o.name })),
  ], [outlets]);

  const methods = useForm({
    resolver: zodResolver(createStockReturnSchema),
    defaultValues: createStockReturnDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit, reset } = methods;

  // The edit-mode fetch is async, so the form can't be seeded via useForm's
  // defaultValues (that only runs once, before the data exists) — reset()
  // re-seeds every field once the real return row arrives.
  useEffect(() => {
    if (isEditMode && existingReturn) {
      reset(returnToFormValues(existingReturn, emptyItemRow));
    }
  }, [isEditMode, existingReturn, reset]);

  const handleBack = () => {
    if (onBack) return onBack();
    if (isEditMode) return navigate(`/stock-return/view/${id}`);
    navigate('/stock-return');
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

  const onSaveAsDraft = handleSubmit(async (values) => {
    try {
      const payload = formValuesToPayload(values, { status: 'draft', isBlankItemRow });
      if (isEditMode) {
        await updateReturn({ id, ...payload }).unwrap();
        dispatch(showToast(`Return ${returnCode} updated successfully`, 'success'));
      } else {
        const created = await createReturn(payload).unwrap();
        dispatch(showToast(`Return ${created.code} saved as draft`, 'success'));
      }
      handleBack();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save the return', 'error'));
    }
  });

  const onSaveAndSend = handleSubmit(async (values) => {
    try {
      const payload = formValuesToPayload(values, { status: 'accepted', isBlankItemRow });
      if (isEditMode) {
        await updateReturn({ id, ...payload }).unwrap();
        dispatch(showToast(`Return ${returnCode} updated successfully`, 'success'));
      } else {
        const created = await createReturn(payload).unwrap();
        dispatch(showToast(`Return ${created.code} saved and sent`, 'success'));
      }
      handleBack();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save the return', 'error'));
    }
  });

  if (isEditMode && isLoadingReturn) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading return…</Typography>
      </Stack>
    );
  }

  if (isEditMode && !isLoadingReturn && !existingReturn) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Return not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={() => navigate('/stock-return')} sx={{ width: 'fit-content' }}>
          Back to Stock Return List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{isEditMode ? `Stock Return (Edit ${returnCode || ''})` : 'Stock Return (New)'}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-return" underline="hover" color="text.secondary">Stock Return</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{isEditMode ? 'Edit Return' : 'New Stock Return'}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' }, justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            {isEditMode ? 'Back to Return' : 'Back'}
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
            <MenuItem onClick={() => reset(createStockReturnDefaultValues)}>Reset Form</MenuItem>
          </Menu>
          {isEditMode ? (
            <Button variant="contained" color="warning" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSaveAsDraft} disabled={isSaving}>
              Update Return
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
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Return Details</Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Return No."
                    value={returnCode || ''}
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
                  <FormTextField name="referenceNo" label="Reference No." placeholder="Enter Reference No. (if any)" />
                  <FormDatePicker name="referenceDate" label="Reference Date" placeholder="Select Reference Date" />
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
                      <FormSelect name="supplier" label="Supplier *" options={supplierOptions} />
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
                      <FormSelect name="fromOutlet" label="From Outlet / HO *" options={outletOptions} />
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
            <ReturnItemsTable onAddItem={handleAddItemRow} products={products} />
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
