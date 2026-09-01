import { Paper, Stack, Box, Typography, Divider } from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

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

function TotalRow({ label, value, strong }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
      <Typography variant="body2" sx={{ color: strong ? 'inherit' : 'text.secondary', fontWeight: strong ? 800 : 500 }}>
        {label}
      </Typography>
      <Typography variant={strong ? 'subtitle1' : 'body2'} sx={{ fontWeight: 800, color: strong ? 'success.main' : 'text.primary' }}>
        {value}
      </Typography>
    </Stack>
  );
}

const STATUS_LABEL = {
  pending: 'Pending', confirmed: 'Confirmed', delivered: 'Delivered',
};

/**
 * Right-hand "Order Details" panel for whichever row is selected in
 * SalesOrderTable — mirrors QuotationDetailsCard's layout exactly, but with
 * a Delivery Date field instead of Valid Till, and a Delivered-On field in
 * place of the Converted-On/Converted-To pair.
 */
export default function OrderDetailsCard({ order, title = 'Order Details', showDeliveredFields = false }) {
  const itemColumns = [
    { key: 'index', label: '#', render: (_row, i) => i + 1 },
    { key: 'code', label: 'Item Code' },
    { key: 'name', label: 'Item Name' },
    { key: 'hsn', label: 'HSN Code' },
    { key: 'qty', label: 'Qty', align: 'right', render: (row) => row.qty.toFixed(2) },
    { key: 'unitPrice', label: 'Unit Price (₹)', align: 'right', render: (row) => formatCurrency(row.unitPrice, { decimals: true }) },
    { key: 'discount', label: 'Discount (₹)', align: 'right', render: (row) => formatCurrency(row.discount, { decimals: true }) },
    { key: 'amount', label: 'Amount (₹)', align: 'right', render: (row) => formatCurrency(row.amount, { decimals: true }) },
  ];

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
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
              <ReceiptLongOutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>{order.code}</Typography>
                <StatusBadge status={order.status} label={STATUS_LABEL[order.status]} />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {order.date} &nbsp;|&nbsp; Ref: {order.ref}
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, flexShrink: 0 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Total Amount</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {formatCurrency(order.totalAmount, { decimals: true })}
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <Field label="Customer" value={order.customer.name} />
            <Field label="Mobile" value={order.customer.mobile} />
            <Field label="Email" value={order.customer.email} />
            <Field label="Address" value={order.customer.address} />
          </Stack>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <Field label="Delivery Date" value={order.deliveryDate} />
            <Field label="Payment Terms" value={order.paymentTerms} />
            <Field label="Sales Person" value={order.salesPerson} />
            {showDeliveredFields ? (
              <Field label="Delivered On" value={order.deliveredOn} />
            ) : (
              <Field label="Created By" value={order.createdBy} />
            )}
          </Stack>
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Items</Typography>
        <Box sx={{ overflow: 'auto' }}>
          <DataTable columns={itemColumns} rows={order.items} getRowKey={(r) => r.code} dense />
        </Box>
      </Box>

      <Divider />

      <Box sx={{ p: { xs: 2, sm: 2.5 }, pt: 2 }}>
        <Stack spacing={1} sx={{ ml: 'auto', width: { xs: '100%', sm: 280 } }}>
          <TotalRow label="Sub Total" value={formatCurrency(order.totals.subTotal, { decimals: true })} />
          <TotalRow label="Discount" value={formatCurrency(order.totals.discount, { decimals: true })} />
          <TotalRow label="Taxable Amount" value={formatCurrency(order.totals.taxableAmount, { decimals: true })} />
          <TotalRow label={`SGST (${order.totals.sgst.rate}%)`} value={formatCurrency(order.totals.sgst.amount, { decimals: true })} />
          <TotalRow label={`CGST (${order.totals.cgst.rate}%)`} value={formatCurrency(order.totals.cgst.amount, { decimals: true })} />
          <Divider sx={{ my: 0.5 }} />
          <Box sx={{ bgcolor: 'rgba(34,160,107,0.08)', borderRadius: 2, px: 1.5, py: 1 }}>
            <TotalRow label="Grand Total" value={formatCurrency(order.totals.grandTotal, { decimals: true })} strong />
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
