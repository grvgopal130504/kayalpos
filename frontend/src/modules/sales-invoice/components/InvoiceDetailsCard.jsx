import { Paper, Stack, Box, Typography, Divider } from '@mui/material';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';

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
  draft: 'Draft', sent: 'Sent', paid: 'Paid', overdue: 'Overdue',
};

/**
 * Right-hand "Invoice Details" panel for whichever row is selected in
 * SalesInvoiceTable — mirrors QuotationDetailsCard/OrderDetailsCard, with
 * a Due Date field instead of Valid Till/Delivery Date, and a Paid-On
 * field in place of Converted-On/Delivered-On.
 */
export default function InvoiceDetailsCard({ invoice, title = 'Invoice Details', showPaidFields = false }) {
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
              <ReceiptOutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>{invoice.code}</Typography>
                <StatusBadge status={invoice.status} label={STATUS_LABEL[invoice.status]} />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {invoice.date} &nbsp;|&nbsp; Ref: {invoice.ref}
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, flexShrink: 0 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Total Amount</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {formatCurrency(invoice.totalAmount, { decimals: true })}
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <Field label="Customer" value={invoice.customer.name} />
            <Field label="Mobile" value={invoice.customer.mobile} />
            <Field label="Email" value={invoice.customer.email} />
            <Field label="Address" value={invoice.customer.address} />
          </Stack>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <Field label="Due Date" value={invoice.dueDate} />
            <Field label="Payment Terms" value={invoice.paymentTerms} />
            <Field label="Sales Person" value={invoice.salesPerson} />
            {showPaidFields ? (
              <Field label="Paid On" value={invoice.paidOn} />
            ) : (
              <Field label="Created By" value={invoice.createdBy} />
            )}
          </Stack>
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Items</Typography>
        <Box sx={{ overflow: 'auto' }}>
          <DataTable columns={itemColumns} rows={invoice.items} getRowKey={(r) => r.code} dense />
        </Box>
      </Box>

      <Divider />

      <Box sx={{ p: { xs: 2, sm: 2.5 }, pt: 2 }}>
        <Stack spacing={1} sx={{ ml: 'auto', width: { xs: '100%', sm: 280 } }}>
          <TotalRow label="Sub Total" value={formatCurrency(invoice.totals.subTotal, { decimals: true })} />
          <TotalRow label="Discount" value={formatCurrency(invoice.totals.discount, { decimals: true })} />
          <TotalRow label="Taxable Amount" value={formatCurrency(invoice.totals.taxableAmount, { decimals: true })} />
          <TotalRow label={`SGST (${invoice.totals.sgst.rate}%)`} value={formatCurrency(invoice.totals.sgst.amount, { decimals: true })} />
          <TotalRow label={`CGST (${invoice.totals.cgst.rate}%)`} value={formatCurrency(invoice.totals.cgst.amount, { decimals: true })} />
          <Divider sx={{ my: 0.5 }} />
          <Box sx={{ bgcolor: 'rgba(34,160,107,0.08)', borderRadius: 2, px: 1.5, py: 1 }}>
            <TotalRow label="Grand Total" value={formatCurrency(invoice.totals.grandTotal, { decimals: true })} strong />
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
