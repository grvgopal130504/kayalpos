import { Box, Paper, Stack, Typography, IconButton, Link as MuiLink } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

import DataTable from '../../../components/common/DataTable';
import { formatCurrency } from '../../../utils/format';

/**
 * "Current Return Items" table: each line's return quantity is adjusted
 * with a -/+ stepper (capped between 1 and the item's remaining returnable
 * qty) instead of a free-typed number, since over-returning isn't valid.
 * Amount math (line + grand totals) lives in the parent page and is handed
 * down elsewhere (ReturnTotalsCard) — this component is display + qty
 * stepper plumbing only.
 */
export default function ReturnCartPanel({ lines, onQtyChange, onRemove, taxRate }) {
  const columns = [
    { key: 'index', label: '#', render: (_row, i) => i + 1 },
    {
      key: 'item',
      label: 'Item Details',
      render: (row) => (
        <Box sx={{ minWidth: 120 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{row.name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.code}</Typography>
        </Box>
      ),
    },
    { key: 'batch', label: 'Batch / Serial', render: (row) => row.batch },
    { key: 'uom', label: 'UOM', render: (row) => row.uom },
    {
      key: 'qty',
      label: 'Return Qty',
      render: (row) => (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <IconButton
            size="small"
            onClick={() => onQtyChange(row.code, Math.max(1, row.qty - 1))}
            sx={{ border: '1px solid', borderColor: 'divider', width: 26, height: 26 }}
          >
            <RemoveIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <Typography variant="body2" sx={{ fontWeight: 700, width: 22, textAlign: 'center' }}>{row.qty}</Typography>
          <IconButton
            size="small"
            onClick={() => onQtyChange(row.code, Math.min(row.maxQty, row.qty + 1))}
            disabled={row.qty >= row.maxQty}
            sx={{ border: '1px solid', borderColor: 'divider', width: 26, height: 26 }}
          >
            <AddIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Stack>
      ),
    },
    { key: 'rate', label: 'Rate (₹)', render: (row) => formatCurrency(row.rate, { decimals: true }) },
    { key: 'discount', label: 'Discount (₹)', render: () => formatCurrency(0, { decimals: true }) },
    { key: 'tax', label: 'Tax', render: () => `${(taxRate * 100).toFixed(0)}%` },
    {
      key: 'amount',
      label: 'Amount (₹)',
      align: 'right',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {formatCurrency(row.qty * row.rate, { decimals: true })}
        </Typography>
      ),
    },
    {
      key: 'remove',
      label: '',
      align: 'right',
      render: (row) => (
        <IconButton size="small" color="error" onClick={() => onRemove(row.code)}>
          <DeleteOutlineOutlinedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2.5, pt: 2, pb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Current Return Items ({lines.length} {lines.length === 1 ? 'Item' : 'Items'})
        </Typography>
        <MuiLink component="button" type="button" variant="body2" underline="hover" sx={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <EditOutlinedIcon fontSize="inherit" /> Edit Cart
        </MuiLink>
      </Stack>

      <Box sx={{ px: 2.5, pb: 2, flex: 1, minWidth: 0, overflow: 'auto' }}>
        <DataTable columns={columns} rows={lines} getRowKey={(r) => r.code} emptyMessage="No items added for return yet" />
      </Box>
    </Paper>
  );
}
