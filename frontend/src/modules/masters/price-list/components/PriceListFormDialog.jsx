import { useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, TextField, CircularProgress,
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

import { useAppDispatch } from '../../../../app/hooks';
import { showToast } from '../../../../features/ui/uiSlice';
import FormTextField from '../../../../components/form/FormTextField';
import FormSelect from '../../../../components/form/FormSelect';
import FormDatePicker from '../../../../components/form/FormDatePicker';
import {
  useCreatePriceListMutation, useUpdatePriceListMutation, useGetPriceListsQuery, useNextPriceListCode,
} from '../../../../api/priceListApi';
import {
  priceListFormSchema, priceListDefaultValues, priceListToFormValues, priceListFormValuesToPayload,
  TYPE_SELECT_OPTIONS, APPLICABLE_TO_SELECT_OPTIONS, STATUS_OPTIONS,
} from '../priceListSchema';

/**
 * Add/Edit dialog for the Price List master, backed by the real Price List
 * API (see api/priceListApi.js) — react-hook-form + zod, same shape as
 * Brand/HSN-SAC's compact dialog forms (unlike Selling Price, which moved
 * to a full page because its calculator needed the room). Price List Code
 * is server-generated (PL-001, ...) and shown read-only, same convention as
 * Brand/Product/Outlet's own codes. Base Price List is a real dropdown of
 * this tenant's other active price lists, excluding the record being
 * edited (a list can't be based on itself — also enforced server-side).
 */
export default function PriceListFormDialog({ open, mode = 'add', initialValues, onClose }) {
  const dispatch = useAppDispatch();
  const isEdit = mode === 'edit';

  const [createPriceList] = useCreatePriceListMutation();
  const [updatePriceList] = useUpdatePriceListMutation();
  // Only fetched while the dialog is open in Add mode — skipped for Edit
  // (real code already known) and while closed.
  const nextCode = useNextPriceListCode(open && !isEdit);

  // Active price lists for the "Base Price List" dropdown — fetched
  // whenever the dialog is open, regardless of mode, since Edit also needs
  // the list (minus itself) to let the user change the base.
  const { data: activePriceLists } = useGetPriceListsQuery(
    { status: 'ACTIVE', pageSize: 200 },
    { skip: !open },
  );
  const basePriceListOptions = useMemo(() => {
    const rows = (activePriceLists || []).filter((row) => row.id !== initialValues?.id);
    return [
      { value: '', label: 'None' },
      ...rows.map((row) => ({ value: row.id, label: `${row.name} (${row.code})` })),
    ];
  }, [activePriceLists, initialValues?.id]);

  const methods = useForm({
    resolver: zodResolver(priceListFormSchema),
    defaultValues: priceListDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  useEffect(() => {
    if (open) reset(isEdit && initialValues ? priceListToFormValues(initialValues) : priceListDefaultValues);
  }, [open, isEdit, initialValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = priceListFormValuesToPayload(values);
      if (isEdit) {
        await updatePriceList({ id: initialValues.id, ...payload }).unwrap();
        dispatch(showToast('Price List updated successfully', 'success'));
      } else {
        await createPriceList(payload).unwrap();
        dispatch(showToast('Price List saved successfully', 'success'));
      }
      onClose?.();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save price list', 'error'));
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <DescriptionOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit Price List' : 'Add Price List'}</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} noValidate>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Price List Code *"
                  value={isEdit ? (initialValues?.code || '') : (nextCode || 'Auto generated')}
                  disabled
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="name" label="Price List Name *" placeholder="Enter price list name" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="type" label="Price List Type" options={TYPE_SELECT_OPTIONS} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="applicableTo" label="Applicable To" options={APPLICABLE_TO_SELECT_OPTIONS} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="basePriceListId" label="Base Price List" options={basePriceListOptions} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="currency" label="Currency *" placeholder="e.g. INR" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormDatePicker name="effectiveFrom" label="Effective From" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormDatePicker name="effectiveTo" label="Effective To" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="status" label="Status *" options={STATUS_OPTIONS} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button variant="outlined" color="inherit" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={14} /> : null}
            >
              {isEdit ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
