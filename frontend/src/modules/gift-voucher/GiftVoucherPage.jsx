import { useMemo, useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';

import GiftVoucherSummaryCards from './components/GiftVoucherSummaryCards';
import GiftVoucherTable from './components/GiftVoucherTable';
import GiftVoucherDetailsCard from './components/GiftVoucherDetailsCard';
import CreateGiftVoucherPage from './CreateGiftVoucherPage';
import GiftVoucherViewPage from './GiftVoucherViewPage';
import {
  useGetGiftVouchersQuery, useDeleteGiftVoucherMutation, useUpdateGiftVoucherMutation,
} from '../../api/giftVoucherApi';
import { toGiftVoucherRow, toGiftVoucherDetails, buildGiftVoucherSummary } from './giftVoucherDisplay';

/**
 * Landing page for the sidebar's Gift Voucher item — summary tiles, the
 * voucher list, a detail panel for whichever row is selected, and
 * Create/Edit/View swapped in via local state. Fully wired to the backend
 * (see backend/src/modules/gift-voucher): every tile, row and detail field
 * comes from the real GiftVoucher table, so an empty table honestly shows
 * zeros instead of this page's old static mock numbers.
 *
 * "Redeemed"/"Total Voucher Value"/"Outstanding Value" are computed from the
 * real `voucherValue`/`usageCount` columns — redemption figures read 0 today
 * because nothing in the app applies a voucher at checkout yet (Line Sale
 * has no "redeem voucher" step). Once that wiring exists and starts
 * incrementing usageCount, these tiles update on their own.
 */
export default function GiftVoucherPage() {
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState('list');
  const [activeId, setActiveId] = useState(null);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const { data: vouchers = [], isLoading, isError } = useGetGiftVouchersQuery({});
  const [deleteGiftVoucher] = useDeleteGiftVoucherMutation();
  const [updateGiftVoucher] = useUpdateGiftVoucherMutation();

  const giftVoucherById = useMemo(() => Object.fromEntries(vouchers.map((v) => [v.id, v])), [vouchers]);
  const rows = useMemo(() => vouchers.map(toGiftVoucherRow), [vouchers]);
  const summary = useMemo(() => buildGiftVoucherSummary(vouchers), [vouchers]);

  const goToList = () => { setActiveId(null); setMode('list'); };
  const openEdit = (id) => { setActiveId(id); setMode('edit'); };
  const openView = (id) => { setActiveId(id); setMode('view'); };

  if (mode === 'create' || mode === 'edit') {
    return (
      <CreateGiftVoucherPage
        id={mode === 'edit' ? activeId : undefined}
        onBack={(savedId) => {
          if (savedId) setSelectedId(savedId);
          if (mode === 'edit') return openView(savedId || activeId);
          return goToList();
        }}
      />
    );
  }

  if (mode === 'view') {
    return <GiftVoucherViewPage id={activeId} onBack={goToList} onEdit={() => openEdit(activeId)} />;
  }

  const selectedVoucher = (selectedId && giftVoucherById[selectedId]) || vouchers[0] || null;
  const voucherDetails = selectedVoucher ? toGiftVoucherDetails(selectedVoucher) : null;

  const handleSelectVoucher = (row) => setSelectedId(row.id);
  const handleRowAction = async (label, row) => {
    if (label === 'View') return openView(row.id);
    if (label === 'Edit') return openEdit(row.id);
    if (label === 'Delete') {
      try {
        await deleteGiftVoucher(row.id).unwrap();
        dispatch(showToast(`Gift voucher "${row.name}" deleted`, 'success'));
        if (selectedId === row.id) setSelectedId(null);
      } catch (err) {
        dispatch(showToast(err?.data?.message || 'Failed to delete the gift voucher', 'error'));
      }
      return undefined;
    }
    if (label === 'Deactivate') {
      const existing = giftVoucherById[row.id];
      if (!existing) return undefined;
      try {
        await updateGiftVoucher({
          id: row.id,
          voucherName: existing.name,
          voucherType: existing.voucherType,
          voucherValue: Number(existing.voucherValue),
          description: existing.description || '',
          startDate: existing.startDate,
          endDate: existing.endDate,
          noExpiry: existing.noExpiry,
          minimumBillAmount: Number(existing.minimumBillAmount),
          maximumUsage: existing.maximumUsage,
          onePerCustomer: existing.onePerCustomer,
          partialRedemptionAllowed: existing.partialRedemptionAllowed,
          allowMultipleInOneBill: existing.allowMultipleInOneBill,
          applicableTo: existing.applicableTo,
          isActive: false,
          sendSms: existing.sendSms,
          sendEmail: existing.sendEmail,
        }).unwrap();
        dispatch(showToast(`Gift voucher "${row.name}" deactivated`, 'success'));
      } catch (err) {
        dispatch(showToast(err?.data?.message || 'Failed to deactivate the gift voucher', 'error'));
      }
      return undefined;
    }
    return dispatch(showToast(`${label} "${row.name}" is coming soon`, 'info'));
  };
  const handleImport = () => dispatch(showToast('Import Vouchers is coming soon', 'info'));
  const handleCreate = () => setMode('create');
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleEdit = () => selectedVoucher && openEdit(selectedVoucher.id);
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

      <GiftVoucherSummaryCards summary={summary} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <GiftVoucherTable
              vouchers={rows}
              totalCount={rows.length}
              selectedId={voucherDetails?.id}
              onSelectVoucher={handleSelectVoucher}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 560 } }}>
            {isLoading ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>Loading gift vouchers…</Typography>
            ) : isError ? (
              <Typography variant="body2" color="error" sx={{ p: 2 }}>Failed to load gift vouchers.</Typography>
            ) : voucherDetails ? (
              <GiftVoucherDetailsCard voucher={voucherDetails} onEdit={handleEdit} />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
                No gift vouchers yet — create one to get started.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
