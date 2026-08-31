import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  TextField, InputAdornment, IconButton, Popover, Paper, Box, Stack, Typography, Button,
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function formatPickerDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  return `${day} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

// Parses the "DD Mon YYYY" strings this app already uses everywhere (e.g.
// "25 May 2026", seen throughout the mock data) back into a Date, so
// re-opening the picker on an existing value starts on the right day/month
// instead of always resetting to today.
export function parsePickerDate(value) {
  if (!value || typeof value !== 'string') return null;
  const match = /^(\d{1,2})\s+([A-Za-z]{3})\w*\s+(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const monthIndex = MONTH_NAMES.findIndex((m) => m.toLowerCase() === match[2].slice(0, 3).toLowerCase());
  if (monthIndex === -1) return null;
  const date = new Date(Number(match[3]), monthIndex, Number(match[1]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildMonthGrid(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function isSameDay(a, b) {
  return Boolean(a) && Boolean(b)
    && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Plain controlled (`value`/`onChange`) date picker — the same working
 * calendar-popover UI as `FormDatePicker`, but for pages that hold the date
 * in local `useState` instead of react-hook-form (e.g. cashier-panel
 * screens, report date filters). `value`/`onChange` mirror a normal
 * controlled TextField: `onChange` is called with the new "DD Mon YYYY"
 * string directly (not an event object).
 */
export function DatePickerField({
  value, onChange, label, disabled, placeholder = 'Select date', error, helperText, slotProps, ...rest
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());
  const selected = parsePickerDate(value);

  const openPicker = (e) => {
    if (disabled) return;
    setViewDate(selected || new Date());
    setAnchorEl(e.currentTarget);
  };
  const closePicker = () => setAnchorEl(null);
  const handlePick = (date) => {
    onChange(formatPickerDate(date));
    closePicker();
  };
  const handleClear = () => {
    onChange('');
    closePicker();
  };

  return (
    <>
      <TextField
        value={value || ''}
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
                <IconButton size="small" onClick={openPicker} disabled={disabled} edge="end" aria-label={`Open ${label || 'date'} picker`}>
                  <CalendarTodayOutlinedIcon fontSize="small" />
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
        <Paper sx={{ p: 1.5, width: 280 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <IconButton size="small" onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))} aria-label="Previous month">
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </Typography>
            <IconButton size="small" onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))} aria-label="Next month">
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
            {WEEKDAY_LABELS.map((w) => (
              <Typography key={w} variant="caption" align="center" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {w}
              </Typography>
            ))}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
            {buildMonthGrid(viewDate).map((date, i) => {
              if (!date) return <Box key={`empty-${i}`} />;
              const isSelected = isSameDay(date, selected);
              const isToday = isSameDay(date, new Date());
              return (
                <Box
                  key={date.toISOString()}
                  onClick={() => handlePick(date)}
                  sx={{
                    height: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    fontSize: 13,
                    cursor: 'pointer',
                    bgcolor: isSelected ? 'primary.main' : 'transparent',
                    color: isSelected ? '#fff' : 'text.primary',
                    border: isToday && !isSelected ? '1px solid' : '1px solid transparent',
                    borderColor: isToday && !isSelected ? 'primary.main' : 'transparent',
                    '&:hover': { bgcolor: isSelected ? 'primary.main' : 'action.hover' },
                  }}
                >
                  {date.getDate()}
                </Box>
              );
            })}
          </Box>

          <Stack direction="row" spacing={1} sx={{ mt: 1.5, justifyContent: 'space-between' }}>
            <Button size="small" onClick={handleClear}>Clear</Button>
            <Button size="small" onClick={() => handlePick(new Date())}>Today</Button>
          </Stack>
        </Paper>
      </Popover>
    </>
  );
}

/**
 * A real, working date picker wired into react-hook-form — replaces the
 * old "FormTextField + decorative calendar icon that did nothing" pattern
 * used across every create/report page. Click the field (or its calendar
 * icon) to open a month calendar; pick a day, or use Today/Clear, to set
 * the value — formatted the same "DD Mon YYYY" way the rest of the app
 * already displays dates (e.g. "25 May 2026"), so it drops in without
 * changing any downstream display logic. Self-contained (no date-picker
 * library dependency), so it works without an `npm install` step.
 *
 * Requires a react-hook-form `FormProvider` ancestor (it reads `control`
 * via `useFormContext()`). For pages that hold the date in local
 * `useState` instead, use the plain `DatePickerField` export above.
 */
export default function FormDatePicker({ name, label, disabled, placeholder = 'Select date', ...rest }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DatePickerField
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
