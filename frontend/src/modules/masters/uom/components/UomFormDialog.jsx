import { useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, CircularProgress,
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';

import { useAppDispatch } from '../../../../app/hooks';
import { showToast } from '../../../../features/ui/uiSlice';
import FormTextField from '../../../../components/form/FormTextField';
import FormSelect from '../../../../components/form/FormSelect';
import { useCreateUomMutation, useUpdateUomMutation, useGetUomGroupsQuery, useGetUomsQuery } from '../../../../api/uomApi';
import {
  createUomSchema, createUomDefaultValues, uomToFormValues, uomFormValuesToPayload, STATUS_OPTIONS,
  GROUP_PLACEHOLDER_OPTION, BASE_UOM_PLACEHOLDER_OPTION,
} from '../createUomSchema';

/**
 * Add/Edit dialog for a UOM, backed by the real UOM API (see api/uomApi.js)
 * — react-hook-form + zod, same shape as Product/Brand's form dialogs.
 * Unlike those, UOM Code is a real editable field on Add (disabled on Edit)
 * since it's a short user-chosen abbreviation (KG, PC, ...), not
 * server-generated. The UOM Group dropdown is backed by the real UOM Group
 * master (active groups); Base UOM is backed by the other UOMs already in
 * the catalog (excluding this row itself when editing) with a "None"
 * option, same "keep the existing value selectable even if it's fallen out
 * of the active list" fallback ProductFormDialog uses for Brand.
 */
export default function UomFormDialog({ open, mode = 'add', initialValues, onClose }) {
  const dispatch = useAppDispatch();
  const isEdit = mode === 'edit';

  const [createUom] = useCreateUomMutation();
  const [updateUom] = useUpdateUomMutation();
  const { data: groups = [] } = useGetUomGroupsQuery(open ? { status: 'ACTIVE' } : undefined, { skip: !open });
  const { data: allUoms = [] } = useGetUomsQuery(open ? {} : undefined, { skip: !open });

  const groupOptions = useMemo(() => {
    const options = [GROUP_PLACEHOLDER_OPTION, ...groups.map((g) => ({ value: g.id, label: g.name }))];
    const existingGroupId = isEdit ? (initialValues?.groupId || initialValues?.group?.id) : '';
    const existingGroupName = isEdit ? initialValues?.group?.name : '';
    if (existingGroupId && !options.some((o) => o.value === existingGroupId) && existingGroupName) {
      options.push({ value: existingGroupId, label: existingGroupName });
    }
    return options;
  }, [groups, isEdit, initialValues]);

  const baseUomOptions = useMemo(() => {
    const others = allUoms.filter((u) => u.code !== initialValues?.code);
    const options = [BASE_UOM_PLACEHOLDER_OPTION, ...others.map((u) => ({ value: u.code, label: `${u.code} — ${u.name}` }))];
    const existingBaseUom = isEdit ? initialValues?.baseUom : '';
    if (existingBaseUom && !options.some((o) => o.value === existingBaseUom)) {
      options.push({ value: existingBaseUom, label: existingBaseUom });
    }
    return options;
  }, [allUoms, isEdit, initialValues]);

  const methods = useForm({
    resolver: zodResolver(createUomSchema),
    defaultValues: createUomDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  useEffect(() => {
    if (open) reset(isEdit && initialValues ? uomToFormValues(initialValues) : createUomDefaultValues);
  }, [open, isEdit, initialValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = uomFormValuesToPayload(values);
      if (isEdit) {
        await updateUom({ id: initialValues.id, ...payload }).unwrap();
        dispatch(showToast('UOM updated successfully', 'success'));
      } else {
        await createUom(payload).unwrap();
        dispatch(showToast('UOM saved successfully', 'success'));
      }
      onClose?.();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save UOM', 'error'));
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ReceiptOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit UOM' : 'Add UOM'}</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} noValidate>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="code" label="UOM Code *" placeholder="e.g. KG" disabled={isEdit} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="name" label="UOM Name *" placeholder="Enter UOM name" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="groupId" label="UOM Group" options={groupOptions} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="baseUom" label="Base UOM" options={baseUomOptions} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="conversionFactor" label="Conversion Factor" placeholder="1" />
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
