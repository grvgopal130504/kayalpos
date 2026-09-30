import { Box, Paper, Stack, Typography, IconButton, Link as MuiLink } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

import DataTable from '../../../components/common/DataTable';
import { formatCurrency } from '../../../utils/format';

/**
 * "Current Return Items" table: each line's return quantity is adjusted
 * with a -/+ stepper (capped between 1 and that line's remaining
 * `returnableQty`, from the real invoice lookup) instead of a free-typed
 * number, since over-returning isn't valid. Rows are keyed by `saleLineId`
 * — the real original SaleLine each cart entry came from — and each row's
 * own `taxRate` (a snapshot of that line's real tax rate from the original
 * sale) drives its displayed tax %, rather than one shared global rate.
 */
export default function ReturnCartPanel({ lines, onQtyChange, onRemove }) {
  // Explicit widths (summing to 100%) so the table always fits the panel —
  // see DataTable's `fitContainer` doc comment.
  const columns = [
    { key: 'index', label: '#', width: '5%', render: (_row, i) => i + 1 },
    {
      key: 'item',
      label: 'Item Details',
      width: '24%',
      wrap: true,
      render: (row) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.25 }}>{row.name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{row.code}</Typography>
        </Box>
      ),
    },
    {
      key: 'qty',
      label: 'Return Qty',
      width: '21%',
      render: (row) => (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <IconButton
            size="small"
            onClick={() => onQtyChange(row.saleLineId, Math.max(1, row.qty - 1))}
            sx={{ border: '1px solid', borderColor: 'divider', width: 24, height: 24 }}
          >
            <RemoveIcon sx={{ fontSize: 13 }} />
          </IconButton>
          <Typography variant="body2" sx={{ fontWeight: 700, width: 18, textAlign: 'center' }}>{row.qty}</Typography>
          <IconButton
            size="small"
            onClick={() => onQtyChange(row.saleLineId, Math.min(row.maxQty, row.qty + 1))}
            disabled={row.qty >= row.maxQty}
            sx={{ border: '1px solid', borderColor: 'divider', width: 24, height: 24 }}
          >
            <AddIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Stack>
      ),
    },
    {
      key: 'pricing',
      label: 'Rate / Tax',
      width: '22%',
      wrap: true,
      render: (row) => (
        <Box>
          <Typography variant="body2">{formatCurrency(row.rate, { decimals: true })}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Tax {(row.taxRate * 100).toFixed(0)}%
          </Typography>
        </Box>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      width: '18%',
      wrap: true,
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
      width: '10%',
      render: (row) => (
        <IconButton size="small" color="error" onClick={() => onRemove(row.saleLineId)}>
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

      <Box sx={{ px: 2.5, pb: 2, flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        <DataTable
          columns={columns}
          rows={lines}
          getRowKey={(r) => r.saleLineId}
          emptyMessage="No items added for return yet"
          fitContainer
        />
      </Box>
    </Paper>
  );
}
