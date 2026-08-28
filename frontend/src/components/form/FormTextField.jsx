import { Controller, useFormContext } from 'react-hook-form';
import { TextField } from '@mui/material';

/**
 * React Hook Form <-> MUI TextField bridge. Every text/password input in
 * the app should use this instead of wiring register()/Controller by hand
 * per page, so validation-error display stays consistent everywhere.
 *
 * `slotProps` follows MUI's current slot API (e.g. { input: { startAdornment } })
 * rather than the deprecated `InputProps`.
 */
export default function FormTextField({ name, label, type = 'text', slotProps, ...rest }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          type={type}
          label={label}
          fullWidth
          error={Boolean(error)}
          helperText={error?.message}
          slotProps={slotProps}
          {...rest}
        />
      )}
    />
  );
}
