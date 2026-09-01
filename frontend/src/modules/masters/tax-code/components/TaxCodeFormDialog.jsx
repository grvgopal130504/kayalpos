import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, TextField, MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

import { useAppDispatch } from '../../../../app/hooks';
import { showToast } from '../../../../features/ui/uiSlice';
import { TAX_TYPE_OPTIONS, TAX_CATEGORY_OPTIONS } from '../taxCodeMockData';

const CALCULATION_TYPE_OPTIONS = ['On Gross', 'On Net'];
const APPLIES_TO_OPTIONS = ['Sales & Purchase', 'Sales Only', 'Purchase Only'];

const EMPTY_VALUES = {
  code: '', name: '', type: TAX_TYPE_OPTIONS[0], category: TAX_CATEGORY_OPTIONS[0], rate: '',
  calculationType: CALCULATION_TYPE_OPTIONS[0], appliesTo: APPLIES_TO_OPTIONS[0], effectiveFrom: '', status: 'Active',
};

/** Add/Edit dialog for the Tax Code master. No backend yet, so Save/Update just toasts and closes. */
export default function TaxCodeFormDialog({ open, mode = 'add', initialValues, onClose }) {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState(EMPTY_VALUES);
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) setValues(isEdit && initialValues ? { ...EMPTY_VALUES, ...initialValues } : EMPTY_VALUES);
  }, [open, isEdit, initialValues]);

  const setField = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(showToast(isEdit ? 'Tax Code updated successfully' : 'Tax Code saved successfully', 'success'));
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ReceiptLongOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit Tax Code' : 'Add Tax Code'}</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Tax Code *"
                value={isEdit ? values.code : 'Auto generated'}
                onChange={setField('code')}
                disabled={!isEdit}
                fullWidth
                slotProps={{ input: { readOnly: !isEdit } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Tax Name *" value={values.name} onChange={setField('name')} placeholder="e.g. GST 5%" fullWidth required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Tax Type" value={values.type} onChange={setField('type')} fullWidth>
                {TAX_TYPE_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Tax Category" value={values.category} onChange={setField('category')} fullWidth>
                {TAX_CATEGORY_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Rate (%)" value={values.rate} onChange={setField('rate')} placeholder="0.00" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Calculation Type" value={values.calculationType} onChange={setField('calculationType')} fullWidth>
                {CALCULATION_TYPE_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Applies To" value={values.appliesTo} onChange={setField('appliesTo')} fullWidth>
                {APPLIES_TO_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
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
