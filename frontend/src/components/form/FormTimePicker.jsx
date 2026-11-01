import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  TextField, InputAdornment, IconButton, Popover, Paper, Box, Stack, Typography, Button,
} from '@mui/material';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ['AM', 'PM'];
const pad = (n) => String(n).padStart(2, '0');

export function formatPickerTime({ hour, minute, period }) {
  return `${pad(hour)}:${pad(minute)} ${period}`;
}

// Parses "hh:mm AM/PM" (the format this picker writes) back into parts.
export function parsePickerTime(value) {
  const text = String(value || '').trim();
  // 24-hour "HH:mm" (what <input type="time"> used to produce) is accepted too.
  const h24 = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(text);
  if (h24) {
    const h = Number(h24[1]);
    return { hour: h % 12 || 12, minute: Number(h24[2]), period: h >= 12 ? 'PM' : 'AM' };
  }
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(text);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 1 || hour > 12 || minute > 59) return null;
  return { hour, minute, period: match[3].toUpperCase() };
}

// "24h" stores HH:mm (for fields compared/sent as 24-hour strings); default stores "hh:mm AM".
function serializeTime(parts, valueFormat) {
  if (valueFormat !== '24h') return formatPickerTime(parts);
  const h = (parts.hour % 12) + (parts.period === 'PM' ? 12 : 0);
  return `${pad(h)}:${pad(parts.minute)}`;
}

function nowParts() {
  const d = new Date();
  const h = d.getHours();
  return { hour: h % 12 || 12, minute: d.getMinutes(), period: h >= 12 ? 'PM' : 'AM' };
}

function Column({ items, selected, onSelect, render = (v) => pad(v), label }) {
  return (
    <Box
      aria-label={label}
      sx={{ height: 200, overflowY: 'auto', width: 64, display: 'flex', flexDirection: 'column', gap: 0.5, pr: 0.5 }}
      ref={(el) => {
        // Scroll the selected entry into view when the popover opens.
        const active = el?.querySelector('[data-active="true"]');
        if (active) el.scrollTop = Math.max(active.offsetTop - 80, 0);
      }}
    >
      {items.map((item) => {
        const active = item === selected;
        return (
          <Box
            key={item}
            data-active={active}
            onClick={() => onSelect(item)}
            sx={{
              flex: '0 0 auto', height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 1, fontSize: 14, cursor: 'pointer',
              bgcolor: active ? 'primary.main' : 'transparent',
              color: active ? '#fff' : 'text.primary',
              '&:hover': { bgcolor: active ? 'primary.main' : 'action.hover' },
            }}
          >
            {render(item)}
          </Box>
        );
      })}
    </Box>
  );
}

/** Controlled time picker (value/onChange with a "hh:mm AM" string). */
export function TimePickerField({
  value, onChange, label, disabled, placeholder = 'Select time', valueFormat = '12h', error, helperText, slotProps, ...rest
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [draft, setDraft] = useState(nowParts());

  const openPicker = (e) => {
    if (disabled) return;
    setDraft(parsePickerTime(value) || nowParts());
    setAnchorEl(e.currentTarget);
  };
  const closePicker = () => setAnchorEl(null);
  const apply = (parts) => {
    onChange(serializeTime(parts, valueFormat));
    closePicker();
  };

  return (
    <>
      <TextField
        value={parsePickerTime(value) ? formatPickerTime(parsePickerTime(value)) : (value || '')}
        label={label}
        placeholder={placeholder}
        fullWidth
        disabled={disabled}
        error={error}
        helperText={helperText}
        onClick={openPicker}
        {...rest}
        slotProps={{
          ...slotProps,
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={openPicker} disabled={disabled} edge="end" aria-label={`Open ${label || 'time'} picker`}>
                  <TimerOutlinedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            ...(slotProps?.input || {}),
          },
        }}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={closePicker}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Paper sx={{ p: 1.5 }}>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-start' }}>
            <Column label="Hour" items={HOURS} selected={draft.hour} onSelect={(hour) => setDraft((d) => ({ ...d, hour }))} />
            <Column label="Minute" items={MINUTES} selected={draft.minute} onSelect={(minute) => setDraft((d) => ({ ...d, minute }))} />
            <Column label="AM/PM" items={PERIODS} selected={draft.period} render={(v) => v} onSelect={(period) => setDraft((d) => ({ ...d, period }))} />
          </Stack>
          <Typography variant="body2" align="center" sx={{ fontWeight: 700, mt: 1 }}>{formatPickerTime(draft)}</Typography>
          <Stack direction="row" sx={{ mt: 1, justifyContent: 'space-between' }}>
            <Button size="small" onClick={() => { onChange(''); closePicker(); }}>Clear</Button>
            <Button size="small" onClick={() => apply(nowParts())}>Now</Button>
            <Button size="small" variant="contained" onClick={() => apply(draft)}>OK</Button>
          </Stack>
        </Paper>
      </Popover>
    </>
  );
}

/** react-hook-form wrapper, same pattern as FormDatePicker. */
export default function FormTimePicker({ name, label, disabled, placeholder, ...rest }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TimePickerField
          value={field.value}
          onChange={field.onChange}
          label={label}
          disabled={disabled}
          placeholder={placeholder}
          error={Boolean(error)}
          helperText={error?.message}
          {...rest}
        />
      )}
    />
  );
}
