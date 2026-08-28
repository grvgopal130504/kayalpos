import { Controller, useFormContext } from 'react-hook-form';
import { Checkbox, FormControlLabel } from '@mui/material';

/**
 * React Hook Form <-> MUI Checkbox bridge, matching the pattern used by
 * FormTextField/FormSelect. Reuse for any boolean form field.
 */
export default function FormCheckbox({ name, label, ...rest }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
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
      )}
    />
  );
}
