import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, CircularProgress, Stack,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

/**
 * "Find Original Invoice" (F3) — the one real lookup this whole screen
 * hinges on: the cashier types the real Bill No. from a completed Sale, and
 * on submit the parent calls GET /api/sales-returns/lookup/:billNo (see
 * SalesReturnPage). Kept as its own small dialog rather than an inline
 * always-visible search box so the page's default state can clearly say
 * "no invoice loaded yet" instead of showing an empty items panel.
 */
export default function FindInvoiceDialog({ open, onClose, onSubmit, isLoading, error }) {
  const [billNo, setBillNo] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!billNo.trim()) return;
    onSubmit(billNo.trim());
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Find Original Invoice</DialogTitle>
      <Stack component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Enter the Bill No. from the original Line Sale invoice this return is against.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label="Bill No."
              placeholder="e.g. LS-00001"
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
              error={Boolean(error)}
              helperText={error || ' '}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <SearchOutlinedIcon fontSize="small" />}
            disabled={isLoading || !billNo.trim()}
          >
            {isLoading ? 'Searching…' : 'Find Invoice'}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}
