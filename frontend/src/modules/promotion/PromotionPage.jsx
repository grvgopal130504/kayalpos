import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Breadcrumbs, Link as MuiLink, Tabs, Tab,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';

import PromotionStatusPage from './PromotionStatusPage';
import CreatePromotionPage from './CreatePromotionPage';

const TABS = [
  { value: 'active', label: 'Active Promotions' },
  { value: 'upcoming', label: 'Upcoming Promotions' },
  { value: 'expired', label: 'Expired Promotions' },
  { value: 'create', label: 'Create Promotion' },
];

/**
 * Landing page for the sidebar's Promotion item. Previously this was a card
 * grid linking out to separate Active/Upcoming/Expired/Create sub-pages;
 * now all four live on this one page as tabs, sharing a single header so
 * switching between them doesn't navigate away or lose the page chrome.
 */
export default function PromotionPage() {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState('active');
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);

  const handleImport = () => dispatch(showToast('Import Promotion is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Promotion</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Promotion</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import Promotion
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setTab('create')}>
            Create Promotion
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            endIcon={<ExpandMoreIcon />}
            onClick={(e) => setMoreActionsAnchor(e.currentTarget)}
          >
            More Actions
          </Button>
          <Menu anchorEl={moreActionsAnchor} open={Boolean(moreActionsAnchor)} onClose={() => setMoreActionsAnchor(null)}>
            <MenuItem onClick={() => handleMoreAction('Export Promotions')}>Export Promotions</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Bulk Deactivate')}>Bulk Deactivate</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Promotion Settings')}>Promotion Settings</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <Tabs
        value={tab}
        onChange={(e, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 40,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 700 },
        }}
      >
        {TABS.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} />
        ))}
      </Tabs>

      <Box>
        {tab === 'create' ? (
          <CreatePromotionPage embedded onCreated={() => setTab('active')} onCancel={() => setTab('active')} />
        ) : (
          <PromotionStatusPage status={tab} embedded />
        )}
      </Box>
    </Stack>
  );
}
