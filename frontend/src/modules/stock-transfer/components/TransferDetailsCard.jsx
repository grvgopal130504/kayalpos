import { Paper, Stack, Box, Typography, Divider } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatCurrency } from '../../../utils/format';

function Field({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}

const STATUS_LABEL = {
  draft: 'Draft', 'in-transit': 'In Transit', received: 'Received', cancelled: 'Cancelled',
};

/**
 * Right-hand "Transfer Details" panel for whichever row is selected in
 * StockTransferTable — mirrors IndentDetailsCard's layout, but shows
 * from/to outlet and indent-reference fields, and an items table with
 * Available/Transfer Qty plus Unit/Total Cost instead of pricing tax
 * columns, since a stock transfer is a goods movement rather than a sale.
 */
export default function TransferDetailsCard({ transfer, title = 'Transfer Details', showReceivedFields = false }) {
  const itemColumns = [
    { key: 'index', label: '#', render: (_row, i) => i + 1 },
    { key: 'code', label: 'Item Code' },
    { key: 'name', label: 'Item Name' },
    { key: 'hsn', label: 'HSN Code' },
    { key: 'uom', label: 'UoM' },
    { key: 'transferQty', label: 'Transfer Qty', align: 'right', render: (row) => row.transferQty.toFixed(2) },
    { key: 'unitCost', label: 'Unit Cost (₹)', align: 'right', render: (row) => formatCurrency(row.unitCost, { decimals: true }) },
    { key: 'totalCost', label: 'Total Cost (₹)', align: 'right', render: (row) => formatCurrency(row.totalCost, { decimals: true }) },
  ];

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: { xs: 2, sm: 2.5 }, pb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>{title}</Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'flex-start' }, justifyContent: 'space-between', mb: 2.5 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Box
              sx={{
                width: 44, height: 44, borderRadius: 2, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'rgba(37,99,235,0.1)', color: '#2563EB',
              }}
            >
              <LocalShippingOutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>{transfer.code}</Typography>
                <StatusBadge status={transfer.status} label={STATUS_LABEL[transfer.status]} />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {transfer.date} &nbsp;|&nbsp; Ref: {transfer.indentRef}
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, flexShrink: 0 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Est. Value</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {formatCurrency(transfer.estimatedValue, { decimals: true })}
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <Field label="From Outlet" value={transfer.fromOutlet} />
            <Field label="To Outlet / HO" value={transfer.toOutlet} />
            <Field label="Priority" value={transfer.priority} />
          </Stack>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <Field label="Required By" value={transfer.requiredBy} />
            <Field label="Cost Center" value={transfer.costCenter} />
            {showReceivedFields ? (
              <Field label="Received By" value={`${transfer.receivedBy} · ${transfer.receivedOn}`} />
            ) : (
              <Field label="Created By" value={transfer.createdBy} />
            )}
          </Stack>
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Items</Typography>
        <Box sx={{ overflow: 'auto' }}>
          <DataTable columns={itemColumns} rows={transfer.items} getRowKey={(r) => r.code} dense />
        </Box>
      </Box>
    </Paper>
  );
}
