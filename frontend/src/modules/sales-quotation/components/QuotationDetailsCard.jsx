import { Paper, Stack, Box, Typography, Divider } from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

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
  converted: 'Converted', pending: 'Pending', draft: 'Draft', expired: 'Expired',
};

/**
 * Right-hand "Quotation Details" panel for whichever row is selected in
 * SalesQuotationTable — header identity block, Customer/Valid-Till fields,
 * a line-items table, and the tax/total breakdown, matching the reference
 * screenshot. Terms & Conditions and Notes live below this card at the page
 * level (they're full-width there, not part of this panel).
 */
export default function QuotationDetailsCard({ quotation, title = 'Quotation Details', showConvertedFields = false }) {
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
              <DescriptionOutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>{quotation.code}</Typography>
                <StatusBadge status={quotation.status} label={STATUS_LABEL[quotation.status]} />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {quotation.date} &nbsp;|&nbsp; Ref: {quotation.ref}
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, flexShrink: 0 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Total Amount</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {formatCurrency(quotation.totalAmount, { decimals: true })}
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <Field label="Customer" value={quotation.customer.name} />
            <Field label="Mobile" value={quotation.customer.mobile} />
            <Field label="Email" value={quotation.customer.email} />
            <Field label="Address" value={quotation.customer.address} />
          </Stack>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <Field label="Valid Till" value={quotation.validTill} />
            <Field label="Payment Terms" value={quotation.paymentTerms} />
            <Field label="Sales Person" value={quotation.salesPerson} />
            {showConvertedFields ? (
              <>
                <Field label="Converted On" value={quotation.convertedOn} />
                <Field label="Converted To" value={quotation.convertedTo} />
              </>
            ) : (
              <Field label="Created By" value={quotation.createdBy} />
            )}
          </Stack>
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Items</Typography>
        <Box sx={{ overflow: 'auto' }}>
          <DataTable columns={itemColumns} rows={quotation.items} getRowKey={(r) => r.code} dense />
        </Box>
      </Box>

      <Divider />

      <Box sx={{ p: { xs: 2, sm: 2.5 }, pt: 2 }}>
        <Stack spacing={1} sx={{ ml: 'auto', width: { xs: '100%', sm: 280 } }}>
          <TotalRow label="Sub Total" value={formatCurrency(quotation.totals.subTotal, { decimals: true })} />
          <TotalRow label="Discount" value={formatCurrency(quotation.totals.discount, { decimals: true })} />
          <TotalRow label="Taxable Amount" value={formatCurrency(quotation.totals.taxableAmount, { decimals: true })} />
          <TotalRow label={`SGST (${quotation.totals.sgst.rate}%)`} value={formatCurrency(quotation.totals.sgst.amount, { decimals: true })} />
          <TotalRow label={`CGST (${quotation.totals.cgst.rate}%)`} value={formatCurrency(quotation.totals.cgst.amount, { decimals: true })} />
          <Divider sx={{ my: 0.5 }} />
          <Box sx={{ bgcolor: 'rgba(34,160,107,0.08)', borderRadius: 2, px: 1.5, py: 1 }}>
            <TotalRow label="Grand Total" value={formatCurrency(quotation.totals.grandTotal, { decimals: true })} strong />
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
