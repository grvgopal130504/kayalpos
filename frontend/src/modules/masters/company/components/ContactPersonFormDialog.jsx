import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, TextField, FormControlLabel, Checkbox,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

const EMPTY_VALUES = { name: '', designation: '', email: '', phone: '', isPrimary: false };

/**
 * Add/Edit dialog for a Company Contact Person, backed by the real
 * AddCompanyContact/UpdateCompanyContact mutations — same lightweight
 * inline-validation dialog shape as Brand's BrandFormDialog (no zod
 * resolver here either; just the one required field checked before
 * submit).
 */
export default function ContactPersonFormDialog({ open, mode = 'add', initialValues, onClose, onSubmit }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState('');
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) {
      setValues(isEdit && initialValues ? { ...EMPTY_VALUES, ...initialValues } : EMPTY_VALUES);
      setNameError('');
    }
  }, [open, isEdit, initialValues]);

  const setField = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.name.trim()) {
      setNameError('Name is required');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        designation: values.designation.trim() || undefined,
        email: values.email.trim() || undefined,
        phone: values.phone.trim() || undefined,
        isPrimary: values.isPrimary,
      });
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <PersonOutlineOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit Contact Person' : 'Add Contact Person'}</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Name *"
                value={values.name}
                onChange={(e) => { setNameError(''); setField('name')(e); }}
                error={Boolean(nameError)}
                helperText={nameError}
                placeholder="Enter contact name"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Designation" value={values.designation} onChange={setField('designation')} placeholder="Enter designation" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Email" type="email" value={values.email} onChange={setField('email')} placeholder="name@example.com" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Phone / Mobile" value={values.phone} onChange={setField('phone')} placeholder="Enter phone number" fullWidth />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={values.isPrimary}
                    onChange={(e) => setValues((prev) => ({ ...prev, isPrimary: e.target.checked }))}
                  />
                )}
                label="Set as Primary Contact"
              />
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
