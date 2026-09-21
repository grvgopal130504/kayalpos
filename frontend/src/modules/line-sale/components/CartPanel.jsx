import {
  Box, Paper, Stack, Typography, IconButton, TextField, MenuItem, Link as MuiLink, Divider,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import DataTable from '../../../components/common/DataTable';
import { formatCurrency } from '../../../utils/format';

const DISCOUNT_TYPES = [
  { value: 'amount', label: 'Amount' },
  { value: 'percent', label: 'Percentage' },
];

/**
 * Right-hand "Current Sale" cart: editable-quantity line items, a global
 * discount field, and the sub total / discount / tax / grand total summary.
 * All the math (line amounts, tax, grand total) is computed by the parent
 * (LineSalePage) and handed down via `lines` + `totals` — this component is
 * display + input plumbing only.
 */
export default function CartPanel({
  lines, onQtyChange, onRemove,
  discount, discountType, onDiscountChange, onDiscountTypeChange,
  totals,
}) {
  // Explicit widths (summing to 100%) so the table always fits the panel —
  // see DataTable's `fitContainer` doc comment. Discount and Tax (previously
  // their own columns) are folded into the Price cell as a caption line, so
  // there are fewer, wider columns and every value can show in full — the
  // item name wraps onto a second line instead of ellipsizing or forcing
  // the table wider than the panel, which is what caused the earlier
  // horizontal scrollbar.
  const columns = [
    { key: 'index', label: '#', width: '5%', render: (_row, i) => i + 1 },
    {
      key: 'item',
      label: 'Item Details',
      width: '26%',
      wrap: true,
      render: (row) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.25 }}>
            {row.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.code}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'qty',
      label: 'Qty',
      width: '17%',
      render: (row) => (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <TextField
            size="small"
            type="number"
            value={row.qty}
            onChange={(e) => onQtyChange(row.code, Math.max(1, Number(e.target.value) || 1))}
            slotProps={{ htmlInput: { min: 1, style: { width: 36, textAlign: 'center', padding: '6px 2px' } } }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.uom}</Typography>
        </Stack>
      ),
    },
    {
      key: 'pricing',
      label: 'Price / Tax',
      width: '22%',
      wrap: true,
      render: (row) => (
        <Box>
          <Typography variant="body2">{formatCurrency(row.price, { decimals: true })}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Disc {formatCurrency(0, { decimals: true })} <br /> Tax {(row.taxRate * 100).toFixed(0)}%
          </Typography>
        </Box>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      width: '20%',
      wrap: true,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {formatCurrency(row.qty * row.price, { decimals: true })}
        </Typography>
      ),
    },
    {
      key: 'remove',
      label: '',
      align: 'right',
      width: '10%',
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
          Current Sale ({lines.length} {lines.length === 1 ? 'Item' : 'Items'})
        </Typography>
        <MuiLink component="button" type="button" variant="body2" underline="hover" sx={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <EditOutlinedIcon fontSize="inherit" /> Edit Cart
        </MuiLink>
      </Stack>

      <Box sx={{ px: 2.5, flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        <DataTable
          columns={columns}
          rows={lines}
          getRowKey={(r) => r.code}
          emptyMessage="Cart is empty — add items from the left"
          fitContainer
        />
      </Box>

      <Box sx={{ px: 2.5, pb: 2.5, pt: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: 'stretch' }}>
          {/* Left: discount inputs, stacked */}
          <Stack spacing={1.5} sx={{ flex: 1, justifyContent: 'center' }}>
            <TextField
              label="Discount (₹)"
              size="small"
              type="number"
              fullWidth
              value={discount}
              onChange={(e) => onDiscountChange(Math.max(0, Number(e.target.value) || 0))}
            />
            <TextField
              select
              label="Discount Type"
              size="small"
              fullWidth
              value={discountType}
              onChange={(e) => onDiscountTypeChange(e.target.value)}
            >
              {DISCOUNT_TYPES.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Stack>

          {/* Right: compact sub total / discount / tax / grand total summary */}
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5, bgcolor: 'background.default', flex: 1 }}>
            <Stack spacing={0.5}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Sub Total</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(totals.subTotal, { decimals: true })}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Discount</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(totals.discountAmount, { decimals: true })}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Tax (GST 5%)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(totals.tax, { decimals: true })}</Typography>
              </Stack>
              <Divider sx={{ my: 0.25 }} />
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Grand Total</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {formatCurrency(totals.grandTotal, { decimals: true })}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Paper>
  );
}
