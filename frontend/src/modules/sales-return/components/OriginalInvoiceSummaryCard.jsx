import { Stack, Typography, Link as MuiLink } from '@mui/material';
import InfoCard from '../../../components/common/InfoCard';
import { formatCurrency } from '../../../utils/format';

export default function OriginalInvoiceSummaryCard({ invoice }) {
  const rows = [
    { label: 'Invoice No.', value: <MuiLink href="#" underline="hover" sx={{ fontWeight: 700 }}>{invoice.invoiceNo}</MuiLink> },
    { label: 'Invoice Date', value: invoice.invoiceDate },
    { label: 'Total Amount', value: formatCurrency(invoice.totalAmount, { decimals: true }) },
    { label: 'Paid Amount', value: formatCurrency(invoice.paidAmount, { decimals: true }) },
    { label: 'Balance Amount', value: formatCurrency(invoice.totalAmount - invoice.paidAmount, { decimals: true }) },
  ];

  return (
    <InfoCard title="Original Invoice Summary" dense sx={{ height: '100%' }}>
      <Stack spacing={1.25}>
        {rows.map((row) => (
          <Stack key={row.label} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{row.label}</Typography>
            {typeof row.value === 'string' ? (
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.value}</Typography>
            ) : (
              row.value
            )}
          </Stack>
        ))}
      </Stack>
    </InfoCard>
  );
}
