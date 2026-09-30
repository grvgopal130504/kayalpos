import { Controller, useFormContext } from 'react-hook-form';
import { Box, Checkbox, FormControlLabel, FormHelperText } from '@mui/material';

/**
 * React Hook Form <-> MUI Checkbox bridge, matching the pattern used by
 * FormTextField/FormSelect. Reuse for any boolean form field.
 *
 * Renders `fieldState.error` as red helper text below the checkbox — most
 * FormCheckbox usages are plain optional toggles (Active, Send SMS, No
 * Expiry, ...) that never fail validation, so this is a no-op for them, but
 * a field like Shift Opening's "I agree to the terms & conditions" (which
 * *is* required via a schema superRefine) needs this: without it, an
 * unchecked required checkbox fails validation completely silently —
 * handleSubmit's valid callback just never runs and nothing on screen tells
 * the user why "Open Shift" appeared to do nothing.
 */
export default function FormCheckbox({ name, label, ...rest }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(field.value)}
                onChange={(e) => field.onChange(e.target.checked)}
                size="small"
              />
            }
            label={label}
            {...rest}
          />
          {error?.message && (
            <FormHelperText error sx={{ ml: 4, mt: -0.5 }}>{error.message}</FormHelperText>
          )}
        </Box>
      )}
    />
  );
}
