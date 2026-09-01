import { Stack, Box, Typography, Button, Slider } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { showToast, selectMaxOpenTabs, setMaxOpenTabs, MAX_OPEN_TABS_CEILING } from '../../features/ui/uiSlice';
import { closeAllTabs } from '../../features/tabs/tabsSlice';
import { HOME_TAB_PATH } from '../../components/layout/pageMeta';
import { useNavigate } from 'react-router-dom';

/**
 * Just the "max open tabs" slider + "Close All Tabs" action — the body of
 * the Tabs card on the Settings page, factored out so the TabBar's gear
 * icon can pop this up on its own without opening the full Settings page.
 */
export default function TabsSettingsCard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const maxOpenTabs = useAppSelector(selectMaxOpenTabs);

  const handleCloseAllTabs = () => {
    dispatch(closeAllTabs());
    dispatch(showToast('All open tabs have been closed', 'success'));
    navigate(HOME_TAB_PATH);
  };

  return (
    <Stack spacing={2.5} sx={{ height: '100%', justifyContent: 'space-between' }}>
      <Stack spacing={1.5}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Max open tabs: {maxOpenTabs}
        </Typography>
        <Slider
          value={maxOpenTabs}
          min={1}
          max={MAX_OPEN_TABS_CEILING}
          step={1}
          marks
          valueLabelDisplay="auto"
          onChange={(e, value) => dispatch(setMaxOpenTabs(value))}
          sx={{ mx: 0.5, width: 'calc(100% - 8px)' }}
        />
      </Stack>
      <Box sx={{ textAlign: 'right' }}>
        <Button variant="outlined" color="error" size="small" onClick={handleCloseAllTabs}>
          Close All Tabs
        </Button>
      </Box>
    </Stack>
  );
}
