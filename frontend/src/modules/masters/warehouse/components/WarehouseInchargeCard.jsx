import { Paper, Stack, Typography, Grid, Button } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import FormTextField from '../../../../components/form/FormTextField';

/**
 * "Warehouse Incharge" sidebar card — Name / Phone fields bound to the
 * same form as the rest of the page, plus an "Edit" action matching the
 * reference (not wired to anything separate — it just surfaces a toast,
 * same as Registered Address's Edit button on the Company/Outlet
 * masters).
 */
export default function WarehouseInchargeCard({ disabled, onEdit }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Warehouse Incharge</Typography>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="inchargeName" label="Name" disabled={disabled} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="inchargePhone" label="Phone / Mobile" disabled={disabled} />
        </Grid>
      </Grid>

      <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 2 }}>
        <Button variant="outlined" color="primary" size="small" startIcon={<EditOutlinedIcon fontSize="small" />} onClick={onEdit}>
          Edit
        </Button>
      </Stack>
    </Paper>
  );
}
