import { Paper, Stack, Typography, Grid, TextField } from '@mui/material';
import { useWatch } from 'react-hook-form';

import FormTextField from '../../../../components/form/FormTextField';
import FormSelect from '../../../../components/form/FormSelect';
import { CAPACITY_UNIT_OPTIONS } from '../createWarehouseSchema';

function toNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * "Warehouse Capacity" sidebar card — Total Capacity (editable, with an
 * editable Unit dropdown) plus Used Capacity and a computed Available
 * Capacity (Total − Used), both shown with the same unit as plain
 * read-only text rather than their own dropdowns, matching the
 * reference. Available Capacity updates live via `useWatch`.
 */
export default function WarehouseCapacityCard({ disabled }) {
  const totalCapacity = toNumber(useWatch({ name: 'totalCapacity' }));
  const usedCapacity = toNumber(useWatch({ name: 'usedCapacity' }));
  const capacityUnit = useWatch({ name: 'capacityUnit' });
  const availableCapacity = Math.max(totalCapacity - usedCapacity, 0);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Warehouse Capacity</Typography>

      <Stack spacing={2}>
        <Grid container spacing={1.5}>
          <Grid size={8}>
            <FormTextField name="totalCapacity" label="Total Capacity" disabled={disabled} />
          </Grid>
          <Grid size={4}>
            <FormSelect name="capacityUnit" label="Unit" options={CAPACITY_UNIT_OPTIONS} disabled={disabled} />
          </Grid>
        </Grid>

        <Grid container spacing={1.5}>
          <Grid size={8}>
            <FormTextField name="usedCapacity" label="Used Capacity" disabled={disabled} />
          </Grid>
          <Grid size={4}>
            <TextField label=" " value={capacityUnit} disabled fullWidth slotProps={{ input: { readOnly: true } }} />
          </Grid>
        </Grid>

        <Grid container spacing={1.5}>
          <Grid size={8}>
            <TextField label="Available Capacity" value={availableCapacity.toFixed(2)} disabled fullWidth slotProps={{ input: { readOnly: true } }} />
          </Grid>
          <Grid size={4}>
            <TextField label=" " value={capacityUnit} disabled fullWidth slotProps={{ input: { readOnly: true } }} />
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
}
