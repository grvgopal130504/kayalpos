import { Controller, useFormContext } from 'react-hook-form';
import { TextField } from '@mui/material';

/**
 * React Hook Form <-> MUI TextField bridge. Every text/password input in
 * the app should use this instead of wiring register()/Controller by hand
 * per page, so validation-error display stays consistent everywhere.
 *
 * `slotProps` follows MUI's current slot API (e.g. { input: { startAdornment } })
 * rather than the deprecated `InputProps`.
 *
 * `numeric` strips any non-digit character as the user types (so letters,
 * spaces, +, -, etc. never make it into the field at all — not just
 * rejected on submit) and switches the on-screen keyboard to numeric on
 * mobile. `maxLength` truncates the value at that many characters on every
 * keystroke, so e.g. a 10-digit mobile number field simply stops accepting
 * more input at the 11th digit instead of allowing it and only failing
 * validation afterwards. Both are opt-in and off by default so every other
 * text field keeps its current behavior.
 */
export default function FormTextField({
  name, label, type = 'text', slotProps, numeric = false, maxLength, ...rest
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const handleChange = (event) => {
          let { value } = event.target;
          if (numeric) value = value.replace(/\D/g, '');
          if (maxLength) value = value.slice(0, maxLength);
          field.onChange(value);
        };

        return (
          <TextField
            {...field}
            onChange={handleChange}
            type={type}
            label={label}
            fullWidth
            error={Boolean(error)}
            helperText={error?.message}
            slotProps={{
              ...slotProps,
              htmlInput: {
                ...(numeric ? { inputMode: 'numeric', pattern: '[0-9]*' } : null),
                ...(maxLength ? { maxLength } : null),
                ...slotProps?.htmlInput,
              },
            }}
            {...rest}
          />
        );
      }}
    />
  );
}
