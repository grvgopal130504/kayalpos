import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Stack, Typography, Link as MuiLink,
} from '@mui/material';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const COLUMNS = [
  { key: 'code', label: 'Brand Code' },
  { key: 'name', label: 'Brand Name' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Action' },
];

function BrandRow({ row, onOpenBrand, onEditRow, onDeleteRow }) {
  return (
    <TableRow hover>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 26, height: 26, borderRadius: 1, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(229,72,77,0.12)', color: '#E5484D',
            }}
          >
            <CardGiftcardOutlinedIcon sx={{ fontSize: 15 }} />
          </Box>
          <MuiLink
            component="button"
            type="button"
            underline="hover"
            onClick={() => onOpenBrand?.(row)}
            sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            {row.code}
          </MuiLink>
        </Stack>
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.name}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.category}</TableCell>
      <TableCell sx={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {row.description || '—'}
      </TableCell>
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
}

function EmptyRow() {
  return (
    <TableRow>
      <TableCell colSpan={COLUMNS.length}>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
          No brands found — create one to get started.
        </Typography>
      </TableCell>
    </TableRow>
  );
}

/**
 * "Brand List" table — a small colored square stands in for each brand's
 * logo (no image field on the Brand master), Brand Code is a link opening
 * BrandViewDialog, Status is a green/grey chip. Same visual convention as
 * ProductTable/WarehousePage's list table.
 */
export default function BrandTable({ rows, onOpenBrand, onEditRow, onDeleteRow }) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 900 }}>
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
            <BrandRow key={row.id} row={row} onOpenBrand={onOpenBrand} onEditRow={onEditRow} onDeleteRow={onDeleteRow} />
          ))}
          {rows.length === 0 && <EmptyRow />}
        </TableBody>
      </Table>
    </Box>
  );
}
