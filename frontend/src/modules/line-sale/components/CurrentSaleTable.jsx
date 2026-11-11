import {
  Paper, Stack, Box, Typography, Chip, IconButton, Avatar,
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import DataTable from '../../../components/common/DataTable';
import { formatCurrency } from '../../../utils/format';
import { colorForCode, initialsForCode } from '../lineSaleMockData';

/**
 * "Current Sale" panel — the cart itself, styled after the reference design:
 * a two-letter colored badge per line (from the product code), a +/- qty
 * stepper instead of a bare number field, and Price / Total columns. Replaces
 * the old split ItemsPanel (browsable catalog) + CartPanel layout on the
 * billing step; items are now added via the search bar above instead of a
 * separate catalog list.
 */
export default function CurrentSaleTable({ lines, onQtyChange, onRemove }) {
  const columns = [
    { key: 'index', label: '#', width: '6%', render: (_row, i) => i + 1 },
    {
      key: 'item',
      label: 'Item Name',
      width: '34%',
      wrap: true,
      render: (row) => (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: colorForCode(row.code), color: '#fff', width: 30, height: 30,
              fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}
          >
            {initialsForCode(row.code, row.name)}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {row.name}
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      width: '18%',
      render: (row) => (
        <Typography variant="body2">{formatCurrency(row.price, { decimals: true })}</Typography>
      ),
    },
    {
      key: 'qty',
      label: 'QTY',
      width: '26%',
      render: (row) => (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <IconButton size="small" onClick={() => onQtyChange(row.code, row.qty - 1)} disabled={row.qty <= 1}>
            <RemoveCircleOutlineIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" sx={{ fontWeight: 700, width: 22, textAlign: 'center' }}>
            {row.qty}
          </Typography>
          <IconButton size="small" onClick={() => onQtyChange(row.code, row.qty + 1)}>
            <AddCircleOutlineIcon fontSize="small" sx={{ color: 'primary.main' }} />
          </IconButton>
        </Stack>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      align: 'right',
      width: '16%',
      render: (row) => (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {formatCurrency(row.qty * row.price, { decimals: true })}
          </Typography>
          <IconButton size="small" color="error" onClick={() => onRemove(row.code)}>
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 2.5, pt: 2, pb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Current Sale</Typography>
        <Chip label={`${lines.length} ${lines.length === 1 ? 'Item' : 'Items'}`} size="small" sx={{ fontWeight: 700 }} />
      </Stack>

      <Box sx={{ px: 2.5, pb: 2.5, flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        <DataTable
          columns={columns}
          rows={lines}
          getRowKey={(r) => r.code}
          emptyMessage="Scan a barcode or search an item above to start the sale"
          fitContainer
        />
      </Box>
    </Paper>
  );
}
