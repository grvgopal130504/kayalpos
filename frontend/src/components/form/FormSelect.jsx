import { Controller, useFormContext } from 'react-hook-form';
import { TextField, MenuItem } from '@mui/material';

/**
 * React Hook Form <-> MUI select bridge (built on TextField select mode so
 * it visually matches every other FormTextField). `options` is
 * [{ value, label }]. Reused by every dropdown-backed form field
 * (Select Outlet today; Customer/Supplier/Category etc. later).
 */
export default function FormSelect({ name, label, options, ...rest }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          select
          label={label}
          fullWidth
          error={Boolean(error)}
          helperText={error?.message}
          {...rest}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
