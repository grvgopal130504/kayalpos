import { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, TextField, CircularProgress,
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CloseIcon from '@mui/icons-material/Close';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';

import { useAppDispatch } from '../../../../app/hooks';
import { showToast } from '../../../../features/ui/uiSlice';
import FormTextField from '../../../../components/form/FormTextField';
import FormSelect from '../../../../components/form/FormSelect';
import { useCreateBrandMutation, useUpdateBrandMutation, useNextBrandCode } from '../../../../api/brandApi';
import {
  createBrandSchema, createBrandDefaultValues, brandToFormValues, brandFormValuesToPayload, STATUS_OPTIONS,
} from '../createBrandSchema';

/**
 * Add/Edit dialog for the Brand master, backed by the real Brand API (see
 * api/brandApi.js) — same react-hook-form + zod shape as the Product/
 * Outlet/Warehouse forms (FormTextField/FormSelect + inline per-field
 * errors), validated against the same rules as the backend's
 * createBrandSchema (brand.schema.js) before the request ever leaves the
 * browser. Brand Code is server-generated (BR0001, ...) and shown
 * read-only, same convention as Product/Warehouse/Outlet's own codes.
 */
export default function BrandFormDialog({ open, mode = 'add', initialValues, onClose }) {
  const dispatch = useAppDispatch();
  const isEdit = mode === 'edit';

  const [createBrand] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  // Only fetched while the dialog is open in Add mode — skipped for Edit
  // (real code already known) and while closed.
  const nextCode = useNextBrandCode(open && !isEdit);

  const methods = useForm({
    resolver: zodResolver(createBrandSchema),
    defaultValues: createBrandDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  useEffect(() => {
    if (open) reset(isEdit && initialValues ? brandToFormValues(initialValues) : createBrandDefaultValues);
  }, [open, isEdit, initialValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = brandFormValuesToPayload(values);
      if (isEdit) {
        await updateBrand({ id: initialValues.id, ...payload }).unwrap();
        dispatch(showToast('Brand updated successfully', 'success'));
      } else {
        await createBrand(payload).unwrap();
        dispatch(showToast('Brand saved successfully', 'success'));
      }
      onClose?.();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save brand', 'error'));
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <CardGiftcardOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit Brand' : 'Add Brand'}</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} noValidate>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Brand Code *"
                  value={isEdit ? (initialValues?.code || '') : (nextCode || 'Auto generated')}
                  disabled
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="name" label="Brand Name *" placeholder="Enter brand name" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="category" label="Category *" placeholder="e.g. Grocery, Beverages" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="status" label="Status *" options={STATUS_OPTIONS} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormTextField name="description" label="Description" placeholder="Optional notes about this brand" multiline minRows={3} />
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
