import { useState } from 'react';
import { Box, Button, Menu, MenuItem, Typography, Stack } from '@mui/material';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectActiveOutletId, setActiveOutlet } from '../../features/auth/authSlice';
import { MOCK_OUTLETS } from '../../constants/outlets';

export default function OutletSwitcher() {
  const dispatch = useAppDispatch();
  const activeOutletId = useAppSelector(selectActiveOutletId);
  const [anchorEl, setAnchorEl] = useState(null);

  const activeOutlet = MOCK_OUTLETS.find((o) => o.value === activeOutletId) || MOCK_OUTLETS[0];

  return (
    <Box>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        variant="outlined"
        color="inherit"
        sx={{
          borderColor: 'divider',
          color: 'text.primary',
          px: 1.5,
          py: 0.75,
          textTransform: 'none',
          justifyContent: 'space-between',
          minWidth: { xs: 0, sm: 220 },
        }}
        endIcon={<KeyboardArrowDownIcon fontSize="small" />}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', overflow: 'hidden' }}>
          <StorefrontOutlinedIcon fontSize="small" sx={{ color: 'primary.main', flexShrink: 0 }} />
          <Typography noWrap variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
            {activeOutlet.label}
          </Typography>
        </Stack>
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {MOCK_OUTLETS.map((outlet) => (
          <MenuItem
            key={outlet.value}
            selected={outlet.value === activeOutletId}
            onClick={() => {
              dispatch(setActiveOutlet(outlet.value));
              setAnchorEl(null);
            }}
          >
            {outlet.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
