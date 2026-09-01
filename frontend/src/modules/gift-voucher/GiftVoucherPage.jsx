import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';

import GiftVoucherSummaryCards from './components/GiftVoucherSummaryCards';
import GiftVoucherTable from './components/GiftVoucherTable';
import GiftVoucherDetailsCard from './components/GiftVoucherDetailsCard';
import { SUMMARY, VOUCHERS, TOTAL_VOUCHER_COUNT, VOUCHER_DETAILS } from './giftVoucherMockData';

const VOUCHER_BY_CODE = Object.fromEntries(VOUCHERS.map((v) => [v.code, v]));

/**
 * Landing page for the sidebar's Gift Voucher item — summary tiles, the
 * voucher list with a detail panel for whichever row is selected.
 * "Create Gift Voucher" navigates to its own dedicated page. The Gift
 * Voucher backend module doesn't exist yet, so everything is driven by
 * giftVoucherMockData.js — selecting a row other than GV-0001 falls back to
 * reusing VOUCHER_DETAILS' shape (only name/code/type/value/status/dates
 * differ) since we don't have full mock detail records for every row.
 */
export default function GiftVoucherPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedCode, setSelectedCode] = useState(VOUCHER_DETAILS.code);

  const selectedRow = VOUCHER_BY_CODE[selectedCode];
  const voucherDetails = selectedCode === VOUCHER_DETAILS.code
    ? VOUCHER_DETAILS
    : {
        ...VOUCHER_DETAILS,
        code: selectedRow.code,
        name: selectedRow.name,
        type: selectedRow.type,
        value: selectedRow.value,
        status: selectedRow.status,
        validFrom: selectedRow.validFrom,
        validTill: selectedRow.validTill,
        redemptionsTillDate: selectedRow.usage,
      };

  const handleSelectVoucher = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => {
    if (label === 'View') return navigate(`/gift-voucher/view/${row.code}`);
    if (label === 'Edit') return navigate(`/gift-voucher/edit/${row.code}`);
    return dispatch(showToast(`${label} "${row.name}" is coming soon`, 'info'));
  };
  const handleImport = () => dispatch(showToast('Import Vouchers is coming soon', 'info'));
  const handleCreate = () => navigate('/gift-voucher/create');
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleEdit = () => dispatch(showToast('Edit Gift Voucher is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Gift Voucher</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Gift Voucher</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import Vouchers
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Create Gift Voucher
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
            <MenuItem onClick={() => handleMoreAction('Export Vouchers')}>Export Vouchers</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Bulk Deactivate')}>Bulk Deactivate</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Voucher Settings')}>Voucher Settings</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <GiftVoucherSummaryCards summary={SUMMARY} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <GiftVoucherTable
              vouchers={VOUCHERS}
              totalCount={TOTAL_VOUCHER_COUNT}
              selectedCode={selectedCode}
              onSelectVoucher={handleSelectVoucher}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <GiftVoucherDetailsCard voucher={voucherDetails} onEdit={handleEdit} />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
