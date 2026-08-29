import { Paper, Stack, Box, Typography, Divider } from '@mui/material';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';

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
  draft: 'Draft', 'pending-approval': 'Pending Approval', approved: 'Approved', rejected: 'Rejected',
};

/**
 * Right-hand "Indent Details" panel for whichever row is selected in
 * StockIndentTable — mirrors InvoiceDetailsCard/OrderDetailsCard's layout,
 * but shows outlet/requestor/priority fields instead of customer/tax
 * fields, and an items table with Required/Available Qty instead of
 * pricing columns since a stock indent is a material request rather than
 * a priced document.
 */
export default function IndentDetailsCard({ indent, title = 'Indent Details', showApprovedFields = false }) {
  const itemColumns = [
    { key: 'index', label: '#', render: (_row, i) => i + 1 },
    { key: 'code', label: 'Item Code' },
    { key: 'name', label: 'Item Name' },
    { key: 'hsn', label: 'HSN Code' },
    { key: 'uom', label: 'UoM' },
    { key: 'requiredQty', label: 'Required Qty', align: 'right', render: (row) => row.requiredQty.toFixed(2) },
    { key: 'availableQty', label: 'Available Qty', align: 'right', render: (row) => row.availableQty.toFixed(2) },
    { key: 'issueWarehouse', label: 'Issue Warehouse' },
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
              <PlaylistAddCheckOutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>{indent.code}</Typography>
                <StatusBadge status={indent.status} label={STATUS_LABEL[indent.status]} />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {indent.date} &nbsp;|&nbsp; {indent.department}
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, flexShrink: 0 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Est. Value</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {formatCurrency(indent.estimatedValue, { decimals: true })}
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <Field label="From Outlet" value={indent.fromOutlet} />
            <Field label="To Outlet / HO" value={indent.toOutlet} />
            <Field label="Requestor" value={indent.requestor} />
          </Stack>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <Field label="Priority" value={indent.priority} />
            <Field label="Required Date" value={indent.requiredDate} />
            {showApprovedFields ? (
              <Field label="Approved By" value={`${indent.approvedBy} · ${indent.approvedOn}`} />
            ) : (
              <Field label="Created By" value={indent.createdBy} />
            )}
          </Stack>
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Items</Typography>
        <Box sx={{ overflow: 'auto' }}>
          <DataTable columns={itemColumns} rows={indent.items} getRowKey={(r) => r.code} dense />
        </Box>
      </Box>
    </Paper>
  );
}
