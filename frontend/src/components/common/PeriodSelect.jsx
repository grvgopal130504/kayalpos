import { Select, MenuItem } from '@mui/material';

const DEFAULT_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

/**
 * Small period/range dropdown used on chart and list card headers
 * ("This Month", "Today", etc.) throughout both dashboards.
 */
export default function PeriodSelect({ value, onChange, options = DEFAULT_OPTIONS, size = 'small' }) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      size={size}
      sx={{
        fontSize: 13,
        fontWeight: 600,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
      }}
    >
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  );
}
