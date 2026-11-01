import { useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, TextField, CircularProgress,
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CloseIcon from '@mui/icons-material/Close';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import { useAppDispatch } from '../../../../app/hooks';
import { showToast } from '../../../../features/ui/uiSlice';
import FormTextField from '../../../../components/form/FormTextField';
import FormSelect from '../../../../components/form/FormSelect';
import { useCreateUomGroupMutation, useUpdateUomGroupMutation, useNextUomGroupCode, useGetUomsQuery } from '../../../../api/uomApi';
import {
  createUomGroupSchema, createUomGroupDefaultValues, uomGroupToFormValues, uomGroupFormValuesToPayload, STATUS_OPTIONS, BASE_UOM_PLACEHOLDER_OPTION,
} from '../createUomGroupSchema';

/**
 * Add/Edit dialog for a UOM Group, backed by the real UOM Group API (see
 * api/uomApi.js) — react-hook-form + zod, same shape as Brand's form
 * dialog. Group Code is server-generated (GRP001, ...) and shown read-only.
 */
export default function UomGroupFormDialog({ open, mode = 'add', initialValues, onClose }) {
  const dispatch = useAppDispatch();
  const isEdit = mode === 'edit';

  const [createUomGroup] = useCreateUomGroupMutation();
  const [updateUomGroup] = useUpdateUomGroupMutation();
  const nextCode = useNextUomGroupCode(open && !isEdit);
  const { data: allUoms = [] } = useGetUomsQuery(open ? {} : undefined, { skip: !open });

  // Base UOM is one of the UOMs in the catalog (those already in this group
  // when editing, otherwise all) with a "None" option; the existing value
  // stays selectable even if that UOM is no longer in the list.
  const baseUomOptions = useMemo(() => {
    const groupId = isEdit ? initialValues?.id : null;
    const candidates = groupId ? allUoms.filter((u) => (u.groupId || u.group?.id) === groupId) : allUoms;
    const options = [BASE_UOM_PLACEHOLDER_OPTION, ...candidates.map((u) => ({ value: u.code, label: `${u.code} — ${u.name}` }))];
    const existingBaseUom = isEdit ? initialValues?.baseUom : '';
    if (existingBaseUom && !options.some((o) => o.value === existingBaseUom)) {
      options.push({ value: existingBaseUom, label: existingBaseUom });
    }
    return options;
  }, [allUoms, isEdit, initialValues]);

  const methods = useForm({
    resolver: zodResolver(createUomGroupSchema),
    defaultValues: createUomGroupDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  useEffect(() => {
    if (open) reset(isEdit && initialValues ? uomGroupToFormValues(initialValues) : createUomGroupDefaultValues);
  }, [open, isEdit, initialValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = uomGroupFormValuesToPayload(values);
      if (isEdit) {
        await updateUomGroup({ id: initialValues.id, ...payload }).unwrap();
        dispatch(showToast('UOM Group updated successfully', 'success'));
      } else {
        await createUomGroup(payload).unwrap();
        dispatch(showToast('UOM Group saved successfully', 'success'));
      }
      onClose?.();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save UOM group', 'error'));
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Inventory2OutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit UOM Group' : 'Add UOM Group'}</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} noValidate>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  label="Group Code *"
                  value={isEdit ? (initialValues?.code || '') : (nextCode || 'Auto generated')}
                  disabled
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                />
              </Grid>
              <Grid size={12}>
                <FormTextField name="name" label="Group Name *" placeholder="Enter group name" />
              </Grid>
              <Grid size={12}>
                <FormTextField name="description" label="Description" placeholder="Enter description" multiline minRows={2} />
              </Grid>
              <Grid size={12}>
                <FormSelect name="baseUom" label="Base UOM" options={baseUomOptions} />
              </Grid>
              <Grid size={12}>
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
