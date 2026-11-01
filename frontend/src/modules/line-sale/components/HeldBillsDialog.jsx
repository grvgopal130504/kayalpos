import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Stack, Box, Typography, Button, IconButton,
  Paper, Chip, Alert, Skeleton, Tooltip, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutlined';

import { formatCurrency } from '../../../utils/format';

const parkedAtFormat = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true,
});

function Field({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{value}</Typography>
    </Box>
  );
}

/**
 * "Held Bills" picker for the Line Sale screen: every parked bill this
 * cashier may resume (reference, customer, item count, total, parked time),
 * with Resume and Discard actions. Presentational — the page owns the data
 * (useHeldBillsQuery) and the resume/discard handlers, so the "you still
 * have an unsaved bill" guard lives in one place next to the cart state.
 * Rows are large cards with 48px-high buttons for touchscreen use; on a
 * phone-width screen the dialog goes full screen.
 */
export default function HeldBillsDialog({
  open, onClose, bills, isLoading, isError, isFetching, onRefresh,
  activeBillId, busyBillId, onResume, onDiscard,
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [discardTarget, setDiscardTarget] = useState(null);

  const confirmDiscard = async () => {
    const target = discardTarget;
    setDiscardTarget(null);
    if (target) await onDiscard(target);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" fullScreen={fullScreen} scroll="paper">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}>
          <PauseCircleOutlineIcon color="warning" />
          <Box sx={{ flex: 1 }}>Held Bills</Box>
          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={onRefresh} disabled={isFetching} aria-label="Refresh held bills" sx={{ width: 44, height: 44 }}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          <IconButton onClick={onClose} aria-label="Close" sx={{ width: 44, height: 44 }}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: 'background.default' }}>
          {isError ? (
            <Alert
              severity="error"
              action={<Button color="inherit" size="small" onClick={onRefresh}>Retry</Button>}
            >
              Couldn&apos;t load held bills. Check your connection and try again.
            </Alert>
          ) : isLoading ? (
            <Stack spacing={1.5}>
              {[1, 2, 3].map((k) => <Skeleton key={k} variant="rounded" height={92} />)}
            </Stack>
          ) : bills.length === 0 ? (
            <Stack spacing={1} sx={{ alignItems: 'center', py: 6, color: 'text.secondary' }}>
              <PauseCircleOutlineIcon sx={{ fontSize: 48, opacity: 0.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>No held bills</Typography>
              <Typography variant="body2">Bills you park with &ldquo;Hold Bill&rdquo; will appear here.</Typography>
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              {bills.map((bill) => {
                const isActive = bill.id === activeBillId;
                const isBusy = bill.id === busyBillId;
                return (
                  <Paper key={bill.id} variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
                      <Box sx={{
                        display: 'grid', flex: 1, minWidth: 0, gap: 1.5,
                        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
                      }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Bill reference</Typography>
                          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{bill.reference}</Typography>
                            {bill.status === 'RESUMED' && (
                              <Chip size="small" color="warning" variant="outlined" label={isActive ? 'On screen' : 'Unfinished'} />
                            )}
                          </Stack>
                        </Box>
                        <Field label="Customer" value={bill.customerName} />
                        <Field label="Items" value={`${bill.itemCount} item${bill.itemCount === 1 ? '' : 's'}`} />
                        <Field label="Total" value={formatCurrency(bill.grandTotal, { decimals: true })} />
                        <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Parked {parkedAtFormat.format(new Date(bill.heldAt))}
                            {bill.cashierName ? ` · ${bill.cashierName}` : ''}
                          </Typography>
                        </Box>
                      </Box>

                      <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                        <Button
                          variant="contained"
                          startIcon={<PlayArrowRoundedIcon />}
                          disabled={isBusy || isActive}
                          onClick={() => onResume(bill)}
                          sx={{ minHeight: 48, minWidth: 130, flex: { xs: 1, md: 'none' } }}
                        >
                          {isActive ? 'Open' : isBusy ? 'Resuming…' : 'Resume'}
                        </Button>
                        <Tooltip title="Discard this held bill">
                          <span>
                            <IconButton
                              color="error"
                              disabled={isBusy}
                              onClick={() => setDiscardTarget(bill)}
                              aria-label={`Discard ${bill.reference}`}
                              sx={{ width: 48, height: 48, border: 1, borderColor: 'divider', borderRadius: 2 }}
                            >
                              <DeleteOutlineOutlinedIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button color="inherit" onClick={onClose} sx={{ minHeight: 44 }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(discardTarget)} onClose={() => setDiscardTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Discard held bill?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {discardTarget?.reference} ({discardTarget?.itemCount} item{discardTarget?.itemCount === 1 ? '' : 's'},
            {' '}{discardTarget ? formatCurrency(discardTarget.grandTotal, { decimals: true }) : ''}) will be removed
            and can no longer be resumed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setDiscardTarget(null)} sx={{ minHeight: 44 }}>Keep it</Button>
          <Button color="error" variant="contained" onClick={confirmDiscard} sx={{ minHeight: 44 }}>Discard</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
