import { Paper, Stack, Box, Typography, Divider } from '@mui/material';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';

import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatNumber } from '../../../utils/format';

function Field({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}

const STATUS_LABEL = {
  draft: 'Draft', 'pending-print': 'Pending Print', printed: 'Printed',
};

/**
 * Right-hand "Batch Details" panel for whichever row is selected in
 * BarcodeLabelTable — mirrors InvoiceDetailsCard/OrderDetailsCard's
 * layout, but shows label configuration fields instead of customer/tax
 * fields, and an items table without pricing columns since a label batch
 * isn't a priced document.
 */
export default function LabelDetailsCard({ batch, title = 'Batch Details', showPrintedFields = false }) {
  const itemColumns = [
    { key: 'index', label: '#', render: (_row, i) => i + 1 },
    { key: 'code', label: 'Item Code' },
    { key: 'name', label: 'Item Name' },
    { key: 'hsn', label: 'HSN Code' },
    { key: 'uom', label: 'UoM' },
    { key: 'barcode', label: 'Barcode' },
    { key: 'printQty', label: 'Print Qty', align: 'right', render: (row) => row.printQty.toFixed(2) },
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
              <QrCode2OutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>{batch.code}</Typography>
                <StatusBadge status={batch.status} label={STATUS_LABEL[batch.status]} />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {batch.date} &nbsp;|&nbsp; {batch.labelName}
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, flexShrink: 0 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Total Labels</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {formatNumber(batch.totalLabels)}
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <Field label="Label Type" value={batch.labelType} />
            <Field label="Label Size" value={batch.labelSize} />
            <Field label="Print Template" value={batch.printTemplate} />
          </Stack>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <Field label="Item Category" value={batch.itemCategory} />
            <Field label="Brand" value={batch.brand} />
            {showPrintedFields ? (
              <Field label="Printed On" value={batch.printedOn} />
            ) : (
              <Field label="Created By" value={batch.createdBy} />
            )}
          </Stack>
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Items</Typography>
        <Box sx={{ overflow: 'auto' }}>
          <DataTable columns={itemColumns} rows={batch.items} getRowKey={(r) => r.code} dense />
        </Box>
      </Box>
    </Paper>
  );
}
