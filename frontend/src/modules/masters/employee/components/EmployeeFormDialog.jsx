import { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, TextField, CircularProgress,
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CloseIcon from '@mui/icons-material/Close';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

import { useAppDispatch } from '../../../../app/hooks';
import { showToast } from '../../../../features/ui/uiSlice';
import FormTextField from '../../../../components/form/FormTextField';
import FormSelect from '../../../../components/form/FormSelect';
import FormDatePicker from '../../../../components/form/FormDatePicker';
import { useGetOutletsQuery } from '../../../../api/outletApi';
import { useCreateEmployeeMutation, useUpdateEmployeeMutation, useNextEmployeeCode } from '../../../../api/employeeApi';
import {
  createEmployeeSchema, createEmployeeDefaultValues, employeeToFormValues, employeeFormValuesToPayload,
  TYPE_SELECT_OPTIONS, STATUS_OPTIONS,
} from '../createEmployeeSchema';

/**
 * Add/Edit dialog for the Employee master, backed by the real Employee API
 * (see api/employeeApi.js) — react-hook-form + zod, same shape as
 * Supplier/Brand/HSN-SAC's own form dialogs (FormTextField/FormSelect +
 * inline per-field errors), validated against the same rules as the
 * backend's createEmployeeSchema (employee.schema.js) before the request
 * ever leaves the browser. "Location" is a real dropdown of the tenant's
 * active Outlets (not the old static LOCATION_OPTIONS list). Employee Code
 * is server-generated (EMP001, ...) and shown read-only, same convention as
 * Product/Brand/Outlet's own codes. "Login User" stays a plain descriptive
 * field, not a real login account — see the backend model's own doc
 * comment for why creating actual POS credentials is out of scope here.
 */
export default function EmployeeFormDialog({ open, mode = 'add', initialValues, onClose }) {
  const dispatch = useAppDispatch();
  const isEdit = mode === 'edit';

  const [createEmployee] = useCreateEmployeeMutation();
  const [updateEmployee] = useUpdateEmployeeMutation();
  // Only fetched while the dialog is open in Add mode — skipped for Edit
  // (real code already known) and while closed.
  const nextCode = useNextEmployeeCode(open && !isEdit);

  // Outlet is an `isActive` boolean model (see outlet.schema.js), not a
  // `status` enum — same note as BatchSerial's Warehouse dropdown.
  const { data: outlets = [] } = useGetOutletsQuery({ isActive: true }, { skip: !open });
  const outletOptions = outlets.map((o) => ({ value: o.id, label: o.name }));

  const methods = useForm({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: createEmployeeDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  useEffect(() => {
    if (open) reset(isEdit && initialValues ? employeeToFormValues(initialValues) : createEmployeeDefaultValues);
  }, [open, isEdit, initialValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = employeeFormValuesToPayload(values);
      if (isEdit) {
        await updateEmployee({ id: initialValues.id, ...payload }).unwrap();
        dispatch(showToast('Employee updated successfully', 'success'));
      } else {
        await createEmployee(payload).unwrap();
        dispatch(showToast('Employee saved successfully', 'success'));
      }
      onClose?.();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save employee', 'error'));
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <PeopleAltOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit Employee' : 'Add Employee'}</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} noValidate>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Employee Code *"
                  value={isEdit ? (initialValues?.code || '') : (nextCode || 'Auto generated')}
                  disabled
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="name" label="Employee Name *" placeholder="Enter employee name" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="type" label="Employee Type" options={TYPE_SELECT_OPTIONS} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="outletId" label="Location *" options={outletOptions} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="phone" label="Phone" placeholder="Enter 10-digit phone number" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="email" label="Email" placeholder="Enter email address" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="loginUsername" label="Login User" placeholder="Enter login username" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormDatePicker name="joiningDate" label="Joining Date" />
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
