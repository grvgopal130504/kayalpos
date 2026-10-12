import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Stack, Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import { formatNumber } from '../../../../utils/format';
import { formatPickerDate } from '../../../../components/form/FormDatePicker';

const COLUMNS = [
  { key: 'code', label: 'Price List Code' },
  { key: 'name', label: 'Price List Name' },
  { key: 'type', label: 'Price List Type' },
  { key: 'applicableTo', label: 'Applicable To' },
  { key: 'basePriceList', label: 'Base Price List' },
  { key: 'currency', label: 'Currency' },
  { key: 'status', label: 'Status' },
  { key: 'effectiveFrom', label: 'Effective From' },
  { key: 'effectiveTo', label: 'Effective To' },
  { key: 'itemCount', label: 'No. of Items' },
  { key: 'action', label: 'Action' },
];

function statusLabel(status) {
  return String(status).toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active';
}

function formatRowDate(value) {
  return value ? formatPickerDate(new Date(value)) : '-';
}

/**
 * "Price List" table — real API row shape: `basePriceList` is the joined
 * relation object ({id,name}) not a plain string, `status` is the backend's
 * 'ACTIVE'/'INACTIVE' enum, and `itemCount` is server-computed (see
 * priceList.service.js's withItemCounts). Same green/red Status chip and
 * edit/delete row actions as before, now wired to the real dialog/mutations
 * via PriceListPage.
 */
export default function PriceListTable({ rows, onViewRow, onEditRow, onDeleteRow }) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 1350 }}>
        <TableHead>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableCell key={col.key} className={col.key === 'action' ? 'sticky-action' : undefined} sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 12.5, whiteSpace: 'nowrap' }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const status = statusLabel(row.status);
            return (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.code}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.name}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.type}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.applicableTo}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.basePriceList?.name || '-'}</TableCell>
                <TableCell>{row.currency}</TableCell>
                <TableCell>
                  <Chip
                    label={status}
                    size="small"
                    sx={{
                      bgcolor: status === 'Active' ? 'rgba(34,160,107,0.12)' : 'rgba(229,72,77,0.12)',
                      color: status === 'Active' ? 'success.main' : 'error.main',
                      fontWeight: 700, height: 22,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatRowDate(row.effectiveFrom)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatRowDate(row.effectiveTo)}</TableCell>
                <TableCell>{formatNumber(row.itemCount)}</TableCell>
                <TableCell className="sticky-action">
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" onClick={() => onViewRow?.(row)} aria-label={`View ${row.name}`}>
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="primary" onClick={() => onEditRow?.(row)} aria-label={`Edit ${row.name}`}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDeleteRow?.(row)} aria-label={`Delete ${row.name}`}>
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
                  No price lists match your search.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
