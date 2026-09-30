import { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, CircularProgress,
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
import { useCreateHsnSacMutation, useUpdateHsnSacMutation } from '../../../../api/hsnSacApi';
import {
  createHsnSacSchema, createHsnSacDefaultValues, hsnSacToFormValues, hsnSacFormValuesToPayload,
  STATUS_OPTIONS, TYPE_SELECT_OPTIONS, CHAPTER_SELECT_OPTIONS,
} from '../createHsnSacSchema';

/**
 * Add/Edit dialog for the HSN/SAC master, backed by the real HSN/SAC API
 * (see api/hsnSacApi.js) — react-hook-form + zod, same shape as
 * Brand/UOM/Tax Code's form dialogs. Unlike Tax Code, HSN/SAC Code is a
 * real editable field on Add (disabled on Edit) since it's a real
 * externally-defined classification code the user looks up and enters, not
 * server-generated — same convention as UOM's code.
 */
export default function HsnSacFormDialog({ open, mode = 'add', initialValues, onClose }) {
  const dispatch = useAppDispatch();
  const isEdit = mode === 'edit';

  const [createHsnSac] = useCreateHsnSacMutation();
  const [updateHsnSac] = useUpdateHsnSacMutation();

  const methods = useForm({
    resolver: zodResolver(createHsnSacSchema),
    defaultValues: createHsnSacDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  useEffect(() => {
    if (open) reset(isEdit && initialValues ? hsnSacToFormValues(initialValues) : createHsnSacDefaultValues);
  }, [open, isEdit, initialValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = hsnSacFormValuesToPayload(values);
      if (isEdit) {
        await updateHsnSac({ id: initialValues.id, ...payload }).unwrap();
        dispatch(showToast('HSN / SAC updated successfully', 'success'));
      } else {
        await createHsnSac(payload).unwrap();
        dispatch(showToast('HSN / SAC saved successfully', 'success'));
      }
      onClose?.();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save HSN / SAC', 'error'));
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <DescriptionOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit HSN / SAC' : 'Add HSN / SAC'}</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} noValidate>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="code" label="HSN / SAC Code *" placeholder="Enter code" disabled={isEdit} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="type" label="Type" options={TYPE_SELECT_OPTIONS} />
              </Grid>
              <Grid size={12}>
                <FormTextField name="description" label="Description *" placeholder="Enter description" multiline minRows={2} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="chapter" label="Chapter" options={CHAPTER_SELECT_OPTIONS} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="taxRate" label="Tax Rate (%) *" placeholder="0.00" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="uqc" label="UQC" placeholder="e.g. KGS, NOS" />
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
