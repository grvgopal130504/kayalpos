import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Stack, Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import { formatCurrency } from '../../../../utils/format';

const COLUMNS = [
  { key: 'itemCode', label: 'Item Code' },
  { key: 'itemName', label: 'Item Name' },
  { key: 'priceList', label: 'Price List' },
  { key: 'mrp', label: 'MRP (₹)' },
  { key: 'pricingMethod', label: 'Pricing Method' },
  { key: 'marginPercent', label: 'Margin %' },
  { key: 'sellingPriceExclTax', label: 'Selling Price (Excl. Tax)' },
  { key: 'sellingPriceInclTax', label: 'Selling Price (Incl. Tax)' },
  { key: 'effectiveFrom', label: 'Effective From' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Action' },
];

/**
 * "Selling Price List" table — every saved selling-price record, plain
 * rows with a green/grey Status chip and edit/delete row actions, neither
 * wired to a real form yet.
 */
export default function SellingPriceListTable({ rows, onViewRow, onEditRow, onDeleteRow }) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 1250 }}>
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
          {rows.map((row) => (
            <TableRow key={row.itemCode} hover>
              <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.itemCode}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.itemName}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.priceList}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.mrp, { decimals: true })}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.pricingMethod}</TableCell>
              <TableCell>{row.marginPercent.toFixed(2)}%</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.sellingPriceExclTax, { decimals: true })}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{formatCurrency(row.sellingPriceInclTax, { decimals: true })}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.effectiveFrom}</TableCell>
              <TableCell>
                <Chip
                  label={row.status}
                  size="small"
                  sx={{
                    bgcolor: row.status === 'Active' ? 'rgba(34,160,107,0.12)' : 'rgba(107,114,128,0.12)',
                    color: row.status === 'Active' ? 'success.main' : 'text.secondary',
                    fontWeight: 700, height: 22,
                  }}
                />
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => onViewRow?.(row)} aria-label={`View ${row.itemName}`}>
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="primary" onClick={() => onEditRow?.(row)} aria-label={`Edit ${row.itemName}`}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onDeleteRow?.(row)} aria-label={`Delete ${row.itemName}`}>
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
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
