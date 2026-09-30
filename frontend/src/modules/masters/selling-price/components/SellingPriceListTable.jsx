import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Stack, Typography, CircularProgress,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import { formatCurrency } from '../../../../utils/format';
import { formatPickerDate } from '../../../../components/form/FormDatePicker';
import { PRICING_METHOD_OPTIONS } from '../sellingPriceMockData';

const COLUMNS = [
  { key: 'itemCode', label: 'Item Code' },
  { key: 'itemName', label: 'Item Name' },
  { key: 'priceList', label: 'Price List' },
  { key: 'outlet', label: 'Outlet / Branch' },
  { key: 'mrp', label: 'MRP (₹)' },
  { key: 'pricingMethod', label: 'Pricing Method' },
  { key: 'marginPercent', label: 'Margin %' },
  { key: 'sellingPriceExclTax', label: 'Selling Price (Excl. Tax)' },
  { key: 'sellingPriceInclTax', label: 'Selling Price (Incl. Tax)' },
  { key: 'effectiveFrom', label: 'Effective From' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Action' },
];

function pricingMethodLabel(value) {
  return PRICING_METHOD_OPTIONS.find((o) => o.value === value)?.label || value;
}

function statusLabel(value) {
  return String(value).toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active';
}

/**
 * "Selling Price List" table — every saved SellingPrice row from the real
 * API (see api/sellingPriceApi.js), joined in with its Product/Outlet
 * (product.code/name, outlet.name — see backend's listSellingPrices). A
 * green/grey Status chip and view/edit/delete row actions; Edit loads the
 * row back into the Pricing Calculator above the list (SellingPricePage
 * owns that), Delete asks for confirmation before calling the API.
 */
export default function SellingPriceListTable({
  rows, loading, onViewRow, onEditRow, onDeleteRow,
}) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 1350 }}>
        <TableHead>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableCell key={col.key} sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 12.5, whiteSpace: 'nowrap' }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={COLUMNS.length} sx={{ textAlign: 'center', py: 3 }}>
                <CircularProgress size={22} />
              </TableCell>
            </TableRow>
          )}
          {!loading && rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.product?.code}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.product?.name}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.priceList}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.outlet?.name || 'All Outlets'}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.mrp, { decimals: true })}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{pricingMethodLabel(row.pricingMethod)}</TableCell>
              <TableCell>{Number(row.marginPercent).toFixed(2)}%</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.sellingPriceExclTax, { decimals: true })}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{formatCurrency(row.sellingPriceInclTax, { decimals: true })}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.effectiveFrom ? formatPickerDate(new Date(row.effectiveFrom)) : '-'}</TableCell>
              <TableCell>
                <Chip
                  label={statusLabel(row.status)}
                  size="small"
                  sx={{
                    bgcolor: statusLabel(row.status) === 'Active' ? 'rgba(34,160,107,0.12)' : 'rgba(107,114,128,0.12)',
                    color: statusLabel(row.status) === 'Active' ? 'success.main' : 'text.secondary',
                    fontWeight: 700, height: 22,
                  }}
                />
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => onViewRow?.(row)} aria-label={`View ${row.product?.name}`}>
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="primary" onClick={() => onEditRow?.(row)} aria-label={`Edit ${row.product?.name}`}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onDeleteRow?.(row)} aria-label={`Delete ${row.product?.name}`}>
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {!loading && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={COLUMNS.length}>
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
                  No selling prices match your search.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
