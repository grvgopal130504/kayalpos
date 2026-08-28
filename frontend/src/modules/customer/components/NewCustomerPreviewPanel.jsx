import { useFormContext, useWatch } from 'react-hook-form';
import { Paper, Stack, Box, Typography, Chip } from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

import FormTextField from '../../../components/form/FormTextField';
import { formatCurrency } from '../../../utils/format';
import { CUSTOMER_TYPE_OPTIONS, GROUP_OPTIONS, PRICE_CATEGORY_OPTIONS } from '../createCustomerSchema';

function labelFor(options, value) {
  return options.find((o) => o.value === value)?.label;
}

function SummaryField({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{value || '-'}</Typography>
    </Box>
  );
}

function UploadDropzone({ icon: Icon, title, hint }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        border: '1.5px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        px: 2,
        py: 3,
        textAlign: 'center',
        cursor: 'pointer',
        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
      }}
    >
      <Icon sx={{ fontSize: 28, color: 'text.secondary', mb: 0.5 }} />
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{title}</Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{hint}</Typography>
    </Box>
  );
}

/**
 * Right-hand panel for Add New Customer — Customer Summary (live preview
 * driven by `useWatch`), Upload Documents (placeholder dropzones, no actual
 * upload wiring yet), and a plain Notes textarea.
 */
export default function NewCustomerPreviewPanel() {
  const { control } = useFormContext();
  const values = useWatch({ control });

  const customerTypeLabel = labelFor(CUSTOMER_TYPE_OPTIONS, values.customerType);
  const groupLabel = labelFor(GROUP_OPTIONS, values.group);
  const priceCategoryLabel = labelFor(PRICE_CATEGORY_OPTIONS, values.priceCategory);
  const creditLimitDisplay = formatCurrency(Number(values.creditLimit || 0), { decimals: true });
  const balanceDisplay = formatCurrency(Number(values.openingBalance || 0), { decimals: true });

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, bgcolor: 'rgba(242,107,33,0.04)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Customer Summary</Typography>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
          <Box
            sx={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(37,99,235,0.12)', color: '#2563EB',
            }}
          >
            <PersonOutlinedIcon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                {values.customerName || 'New Customer'}
              </Typography>
              <Chip label={values.activeCustomer ? 'Active' : 'Inactive'} size="small" sx={{ bgcolor: values.activeCustomer ? '#E6F7EF' : '#FDEBEC', color: values.activeCustomer ? 'success.main' : 'error.main', fontWeight: 700, height: 22 }} />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>N/A</Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <SummaryField label="Mobile Number" value={values.mobileNumber} />
            <SummaryField label="Email" value={values.email} />
            <SummaryField label="Customer Type" value={customerTypeLabel} />
            <SummaryField label="Credit Limit" value={creditLimitDisplay} />
          </Stack>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <SummaryField label="GSTIN" value={values.gstin} />
            <SummaryField label="Group" value={groupLabel} />
            <SummaryField label="Price Category" value={priceCategoryLabel} />
            <SummaryField label="Balance" value={balanceDisplay} />
          </Stack>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Upload Documents</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <UploadDropzone icon={ImageOutlinedIcon} title="Upload Customer Image" hint="Drag & drop or click to browse (Max 2MB)" />
          <UploadDropzone icon={DescriptionOutlinedIcon} title="Upload Documents" hint="Drag & drop or click to browse (Max 2MB)" />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Notes</Typography>
        <FormTextField
          name="notes"
          label=""
          multiline
          minRows={4}
          placeholder="Enter notes or remarks"
        />
      </Paper>
    </Stack>
  );
}
