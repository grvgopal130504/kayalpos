import { Controller, useFormContext } from 'react-hook-form';
import { Switch, FormControlLabel } from '@mui/material';

/**
 * React Hook Form <-> MUI Switch bridge, matching the pattern used by
 * FormCheckbox/FormTextField/FormSelect. Used for on/off settings rendered
 * as toggle switches rather than checkboxes (e.g. Add New Customer's
 * "Active Customer" / "Allow Credit Sale" / "SMS Notification" row).
 */
export default function FormSwitch({ name, label, ...rest }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={
            <Switch
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
