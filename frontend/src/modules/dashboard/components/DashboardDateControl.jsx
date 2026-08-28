import { useState } from 'react';
import { Stack, Button, Menu, MenuItem } from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAppDispatch } from '../../../app/hooks';
import { showToast } from '../../../features/ui/uiSlice';

const RANGE_OPTIONS = ['Today', 'Yesterday', 'This Week', 'This Month'];

// Purely presentational date-range control matching the reference header.
// Real date-range filtering will be wired in once the dashboard endpoints
// accept a date range param — for now selecting a range just acknowledges
// the choice via a toast rather than silently doing nothing.
export default function DashboardDateControl() {
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [range, setRange] = useState('Today');
  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <Stack direction="row" spacing={1}>
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<CalendarTodayOutlinedIcon fontSize="small" />}
        sx={{ borderColor: 'divider', color: 'text.primary' }}
      >
        {dateLabel}
      </Button>
      <Button
        variant="outlined"
        color="inherit"
        endIcon={<KeyboardArrowDownIcon fontSize="small" />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ borderColor: 'divider', color: 'text.primary' }}
      >
        {range}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {RANGE_OPTIONS.map((opt) => (
          <MenuItem
            key={opt}
            selected={opt === range}
            onClick={() => {
              setRange(opt);
              setAnchorEl(null);
              dispatch(showToast(`Showing data for: ${opt}`, 'info'));
            }}
          >
            {opt}
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
}
