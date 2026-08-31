import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Stack, Typography, Link as MuiLink,
} from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import { formatCurrency, formatNumber } from '../../../../utils/format';
import { PRODUCT_GROUP_COLORS } from '../productMockData';

const COLUMNS = [
  { key: 'code', label: 'Product Code' },
  { key: 'name', label: 'Product Name' },
  { key: 'group', label: 'Product Group' },
  { key: 'brand', label: 'Brand' },
  { key: 'uom', label: 'UOM' },
  { key: 'hsnSac', label: 'HSN / SAC' },
  { key: 'taxCode', label: 'Tax Code' },
  { key: 'salePrice', label: 'Sale Price (₹)' },
  { key: 'mrp', label: 'MRP (₹)' },
  { key: 'availableQty', label: 'Available Qty' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Action' },
];

/**
 * "Product List" table — a small colored square stands in for each
 * product's photo (no real product images to show for mock data), the
 * Product Code is a link (matching the reference's blue-code convention
 * used elsewhere in this app), and Status is a green/grey chip. Row
 * edit/delete aren't wired to a real form yet, so both surface a toast.
 */
export default function ProductTable({ rows, onOpenProduct, onEditRow, onDeleteRow }) {
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
          {rows.map((row) => {
            const color = PRODUCT_GROUP_COLORS[row.group] || '#6B7280';
            return (
              <TableRow key={row.code} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 26, height: 26, borderRadius: 1, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: `${color}1F`, color,
                      }}
                    >
                      <Inventory2OutlinedIcon sx={{ fontSize: 15 }} />
                    </Box>
                    <MuiLink
                      component="button"
                      type="button"
                      underline="hover"
                      onClick={() => onOpenProduct?.(row)}
                      sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                    >
                      {row.code}
                    </MuiLink>
                  </Stack>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.name}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.group}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.brand}</TableCell>
                <TableCell>{row.uom}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.hsnSac}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.taxCode}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.salePrice, { decimals: true })}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.mrp, { decimals: true })}</TableCell>
                <TableCell>{formatNumber(row.availableQty)}</TableCell>
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
                    <IconButton size="small" color="primary" onClick={() => onEditRow?.(row)} aria-label={`Edit ${row.code}`}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDeleteRow?.(row)} aria-label={`Delete ${row.code}`}>
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={COLUMNS.length}>
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
                  No products match your search.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
