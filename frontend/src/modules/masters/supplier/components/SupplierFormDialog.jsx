import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, TextField, MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

import { useAppDispatch } from '../../../../app/hooks';
import { showToast } from '../../../../features/ui/uiSlice';
import { SUPPLIER_GROUP_OPTIONS, CITY_OPTIONS, STATE_OPTIONS } from '../supplierMockData';
import { useCreateSupplierMutation, useUpdateSupplierMutation, useNextSupplierCode } from '../../../../api/supplierApi';

const EMPTY_VALUES = {
  code: '', name: '', group: SUPPLIER_GROUP_OPTIONS[0], phone: '', email: '',
  city: CITY_OPTIONS[0], state: STATE_OPTIONS[0], gstNo: '', paymentTerms: '30 Days', status: 'Active',
};

/** Add/Edit dialog for the Supplier master, backed by the real Supplier API. */
export default function SupplierFormDialog({ open, mode = 'add', initialValues, onClose }) {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState(EMPTY_VALUES);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode === 'edit';

  const [createSupplier] = useCreateSupplierMutation();
  const [updateSupplier] = useUpdateSupplierMutation();
  // Only fetched while the dialog is open in Add mode — skipped for Edit
  // (real code already known) and while closed.
  const nextCode = useNextSupplierCode(open && !isEdit);

  useEffect(() => {
    if (open) setValues(isEdit && initialValues ? { ...EMPTY_VALUES, ...initialValues } : EMPTY_VALUES);
  }, [open, isEdit, initialValues]);

  const setField = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.name.trim()) {
      dispatch(showToast('Supplier name is required', 'error'));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        group: values.group || undefined,
        phone: values.phone?.trim() || undefined,
        email: values.email?.trim() || undefined,
        gstNo: values.gstNo?.trim() || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        paymentTerms: values.paymentTerms?.trim() || undefined,
        status: values.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
      };

      if (isEdit) {
        await updateSupplier({ id: values.id, ...payload }).unwrap();
        dispatch(showToast('Supplier updated successfully', 'success'));
      } else {
        await createSupplier(payload).unwrap();
        dispatch(showToast('Supplier saved successfully', 'success'));
      }
      onClose?.();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save supplier', 'error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <PeopleAltOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit Supplier' : 'Add Supplier'}</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Supplier Code *"
                value={isEdit ? values.code : (nextCode || 'Auto generated')}
                disabled
                fullWidth
                slotProps={{ input: { readOnly: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Supplier Name *" value={values.name} onChange={setField('name')} placeholder="Enter supplier name" fullWidth required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Supplier Group" value={values.group} onChange={setField('group')} fullWidth>
                {SUPPLIER_GROUP_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Phone" value={values.phone} onChange={setField('phone')} placeholder="Enter phone number" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Email" value={values.email} onChange={setField('email')} placeholder="Enter email address" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="GST No." value={values.gstNo} onChange={setField('gstNo')} placeholder="Enter GST number" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="City" value={values.city} onChange={setField('city')} fullWidth>
                {CITY_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="State" value={values.state} onChange={setField('state')} fullWidth>
                {STATE_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Payment Terms" value={values.paymentTerms} onChange={setField('paymentTerms')} placeholder="e.g. 30 Days" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Status" value={values.status} onChange={setField('status')} fullWidth>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" color="inherit" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>{isEdit ? 'Update' : 'Save'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
