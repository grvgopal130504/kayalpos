import { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, TextField, CircularProgress,
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

import { useAppDispatch } from '../../../../app/hooks';
import { showToast } from '../../../../features/ui/uiSlice';
import FormTextField from '../../../../components/form/FormTextField';
import FormSelect from '../../../../components/form/FormSelect';
import FormDatePicker from '../../../../components/form/FormDatePicker';
import { useCreateTaxCodeMutation, useUpdateTaxCodeMutation } from '../../../../api/taxCodeApi';
import {
  createTaxCodeSchema, createTaxCodeDefaultValues, taxCodeToFormValues, taxCodeFormValuesToPayload,
  STATUS_OPTIONS, TAX_TYPE_SELECT_OPTIONS, TAX_CATEGORY_SELECT_OPTIONS,
  CALCULATION_TYPE_SELECT_OPTIONS, APPLIES_TO_SELECT_OPTIONS,
} from '../createTaxCodeSchema';

/**
 * Add/Edit dialog for the Tax Code master, backed by the real Tax Code API
 * (see api/taxCodeApi.js) — react-hook-form + zod, same shape as
 * Brand/UOM's form dialogs. `code` is user-entered on Add and read-only on Edit.
 */
export default function TaxCodeFormDialog({ open, mode = 'add', initialValues, onClose }) {
  const dispatch = useAppDispatch();
  const isEdit = mode === 'edit';

  const [createTaxCode] = useCreateTaxCodeMutation();
  const [updateTaxCode] = useUpdateTaxCodeMutation();

  const methods = useForm({
    resolver: zodResolver(createTaxCodeSchema),
    defaultValues: createTaxCodeDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  useEffect(() => {
    if (open) reset(isEdit && initialValues ? taxCodeToFormValues(initialValues) : createTaxCodeDefaultValues);
  }, [open, isEdit, initialValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { code, ...rest } = taxCodeFormValuesToPayload(values);
      const payload = isEdit ? rest : { code, ...rest };
      if (isEdit) {
        await updateTaxCode({ id: initialValues.id, ...payload }).unwrap();
        dispatch(showToast('Tax Code updated successfully', 'success'));
      } else {
        await createTaxCode(payload).unwrap();
        dispatch(showToast('Tax Code saved successfully', 'success'));
      }
      onClose?.();
    } catch (err) {
      const details = err?.data?.details;
      const detailText = details && typeof details === 'object'
        ? Object.entries(details).map(([field, msgs]) => `${field}: ${[].concat(msgs).join(', ')}`).join(' | ')
        : '';
      const message = err?.data?.message || 'Failed to save Tax Code';
      dispatch(showToast(detailText ? `${message} — ${detailText}` : message, 'error'));
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ReceiptLongOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit Tax Code' : 'Add Tax Code'}</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} noValidate>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                {isEdit ? (
                  <TextField
                    label="Tax Code *"
                    value={initialValues?.code || ''}
                    disabled
                    fullWidth
                    slotProps={{ input: { readOnly: true } }}
                  />
                ) : (
                  <FormTextField name="code" label="Tax Code *" placeholder="e.g. GST5" />
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="name" label="Tax Name *" placeholder="e.g. GST 5%" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="type" label="Tax Type" options={TAX_TYPE_SELECT_OPTIONS} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="category" label="Tax Category" options={TAX_CATEGORY_SELECT_OPTIONS} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="rate" label="Rate (%) *" placeholder="0.00" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="calculationType" label="Calculation Type" options={CALCULATION_TYPE_SELECT_OPTIONS} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="appliesTo" label="Applies To" options={APPLIES_TO_SELECT_OPTIONS} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormDatePicker name="effectiveFrom" label="Effective From *" />
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
