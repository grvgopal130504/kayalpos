import { Paper, Stack, Box, Typography, Button } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import StatusBadge from '../../../components/common/StatusBadge';
import { formatCurrency, formatNumber } from '../../../utils/format';

function DetailField({ label, value, valueColor }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: valueColor || 'text.primary' }}>{value}</Typography>
    </Box>
  );
}

/**
 * Right-hand "Receipt Details" panel for whichever row is selected in
 * StockReceiptTable — receipt no/date/status header, then supplier &
 * source details on the left and invoice/transport details on the right.
 */
export default function StockReceiptDetailsCard({ receipt, onEdit }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2.5, sm: 3 }, height: '100%' }}>
      <Stack spacing={2.5}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Receipt Details</Typography>
          <Button variant="outlined" color="inherit" size="small" startIcon={<EditOutlinedIcon fontSize="small" />} onClick={onEdit}>
            Edit Receipt
          </Button>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(37,99,235,0.12)', color: '#2563EB', fontWeight: 700, fontSize: 15,
            }}
          >
            RC
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>{receipt.code}</Typography>
              <StatusBadge status={receipt.status} label={receipt.status === 'draft' ? 'Draft' : 'Received'} />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{receipt.date}</Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <DetailField label="Supplier" value={receipt.supplier} />
            <DetailField label="Purchase Type" value={receipt.purchaseType} />
            <DetailField label="From Outlet / HO" value={receipt.fromOutlet} />
            <DetailField label="Contact Person" value={receipt.contactPerson} />
            <DetailField label="Mobile No." value={receipt.mobileNo} />
          </Stack>
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <DetailField label="Invoice No." value={receipt.invoiceNo} />
            <DetailField label="Invoice Date" value={receipt.invoiceDate} />
            <DetailField label="GRN / DC No." value={receipt.grnDcNo} />
            <DetailField label="Vehicle No." value={receipt.vehicleNo} />
            <DetailField label="Transporter" value={receipt.transporter} />
          </Stack>
        </Stack>

        <Stack direction="row" spacing={3}>
          <DetailField label="Items" value={formatNumber(receipt.items)} />
          <DetailField label="Total Value" value={formatCurrency(receipt.totalValue, { decimals: true })} valueColor="success.main" />
        </Stack>
      </Stack>
    </Paper>
  );
}
