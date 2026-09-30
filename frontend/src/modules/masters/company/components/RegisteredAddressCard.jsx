import { Paper, Stack, Box, Typography, IconButton } from '@mui/material';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';

import FormTextField from '../../../../components/form/FormTextField';

/**
 * "Registered Address" sidebar card — now real react-hook-form fields
 * (addressLine1-4 / addressLandmark on the Company profile) instead of a
 * static display block with its own separate "Edit" action. There's no
 * dedicated address-edit modal in this app, so the address is edited the
 * same way as every other Company Details field: unlocked by the page's
 * top-level Edit button, saved by the page's top-level Save button.
 * `disabledProps` is the same `{ disabled: !isEditing }` object CompanyPage
 * passes to its other fields.
 */
export default function RegisteredAddressCard({ disabledProps }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>Registered Address</Typography>
        <Box
          sx={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: 'rgba(37,99,235,0.12)', color: '#2563EB',
          }}
        >
          <IconButton size="small" sx={{ p: 0, color: 'inherit' }} disabled>
            <PlaceOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <FormTextField name="addressLine1" label="Address Line 1" {...disabledProps} />
        <FormTextField name="addressLine2" label="Address Line 2" {...disabledProps} />
        <FormTextField name="addressLine3" label="Address Line 3" {...disabledProps} />
        <FormTextField name="addressLine4" label="Address Line 4" {...disabledProps} />
        <FormTextField name="addressLandmark" label="Landmark" {...disabledProps} />
      </Stack>
    </Paper>
  );
}
