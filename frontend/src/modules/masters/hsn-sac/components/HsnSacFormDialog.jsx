import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, TextField, MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

import { useAppDispatch } from '../../../../app/hooks';
import { showToast } from '../../../../features/ui/uiSlice';
import { TYPE_OPTIONS, CHAPTER_OPTIONS } from '../hsnSacMockData';

const EMPTY_VALUES = {
  code: '', description: '', type: TYPE_OPTIONS[0], chapter: CHAPTER_OPTIONS[0],
  taxRate: '', uqc: '', effectiveFrom: '', status: 'Active',
};

/** Add/Edit dialog for the HSN/SAC master. No backend yet, so Save/Update just toasts and closes. */
export default function HsnSacFormDialog({ open, mode = 'add', initialValues, onClose }) {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState(EMPTY_VALUES);
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) setValues(isEdit && initialValues ? { ...EMPTY_VALUES, ...initialValues } : EMPTY_VALUES);
  }, [open, isEdit, initialValues]);

  const setField = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(showToast(isEdit ? 'HSN / SAC updated successfully' : 'HSN / SAC saved successfully', 'success'));
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <DescriptionOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit HSN / SAC' : 'Add HSN / SAC'}</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="HSN / SAC Code *" value={values.code} onChange={setField('code')} placeholder="Enter code" fullWidth required disabled={isEdit} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Type" value={values.type} onChange={setField('type')} fullWidth>
                {TYPE_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField label="Description *" value={values.description} onChange={setField('description')} placeholder="Enter description" fullWidth required multiline minRows={2} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Chapter" value={values.chapter} onChange={setField('chapter')} fullWidth>
                {CHAPTER_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Tax Rate (%)" value={values.taxRate} onChange={setField('taxRate')} placeholder="0.00" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="UQC" value={values.uqc} onChange={setField('uqc')} placeholder="e.g. KGS, NOS" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Effective From" value={values.effectiveFrom} onChange={setField('effectiveFrom')} placeholder="dd-mm-yyyy" fullWidth />
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
          <Button type="submit" variant="contained">{isEdit ? 'Update' : 'Save'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
