import { useState } from 'react';
import { IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import FormTextField from './FormTextField';

/**
 * FormTextField preconfigured for passwords, with the show/hide toggle seen
 * on the login screen. Reuse this anywhere a password is captured instead
 * of re-adding the adornment logic per form.
 */
export default function FormPasswordField({ name, label, ...rest }) {
  const [visible, setVisible] = useState(false);

  return (
    <FormTextField
      name={name}
      label={label}
      type={visible ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={visible ? 'Hide password' : 'Show password'}
                onClick={() => setVisible((v) => !v)}
                edge="end"
                size="small"
              >
                {visible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      {...rest}
    />
  );
}
