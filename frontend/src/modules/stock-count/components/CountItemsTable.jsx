import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, TextField, MenuItem,
  IconButton, InputAdornment, Stack, Button,
} from '@mui/material';
import { Controller, useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';

import { UOM_OPTIONS, emptyItemRow } from '../createStockCountSchema';

const COLUMNS = [
  { key: 'itemCode', label: 'Item Code *', minWidth: 150 },
  { key: 'itemName', label: 'Item Name', minWidth: 150 },
  { key: 'hsnCode', label: 'HSN Code', minWidth: 110 },
  { key: 'uom', label: 'UoM', minWidth: 100 },
  { key: 'systemQty', label: 'System Qty', minWidth: 100 },
  { key: 'countedQty', label: 'Counted Qty *', minWidth: 110 },
  { key: 'varianceQty', label: 'Variance Qty', minWidth: 110 },
  { key: 'unitCost', label: 'Unit Cost (₹)', minWidth: 110 },
  { key: 'varianceValue', label: 'Variance Value (₹)', minWidth: 140 },
  { key: 'remarks', label: 'Remarks', minWidth: 140 },
];

function toNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

// Counted Qty minus System Qty — negative when there's a shortage,
// positive on a surplus — with Variance Value simply that variance priced
// at Unit Cost. Both computed cells are shaded read-only like the other
// create forms' derived columns.
export function computeVarianceQty(row) {
  return toNumber(row.countedQty) - toNumber(row.systemQty);
}
export function computeVarianceValue(row) {
  return computeVarianceQty(row) * toNumber(row.unitCost);
}

/**
 * Inline, editable line-items grid for the Create Stock Count form —
 * spreadsheet-style row entry matching WastageItemsTable, with a free-typed
 * System Qty (the expected on-hand figure) alongside the editable Counted
 * Qty, and computed Variance Qty / Variance Value columns instead of a
 * priced Total Cost.
 */
export default function CountItemsTable({ onAddItem }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  return (
    <Stack spacing={1.5}>
      <Box sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table size="small" sx={{ minWidth: 1300 }}>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12.5, whiteSpace: 'nowrap', bgcolor: 'rgba(0,0,0,0.02)' } }}>
              <TableCell sx={{ width: 44 }}>#</TableCell>
              {COLUMNS.map((col) => (
                <TableCell key={col.key} sx={{ minWidth: col.minWidth }}>{col.label}</TableCell>
              ))}
              <TableCell sx={{ width: 60 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field, index) => (
              <ItemRow key={field.id} index={index} control={control} onRemove={() => remove(index)} removable={fields.length > 1} />
            ))}
          </TableBody>
        </Table>
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          color="warning"
          size="small"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => append(emptyItemRow())}
        >
          Add Row
        </Button>
        <Button
          variant="outlined"
          color="warning"
          size="small"
          startIcon={<AddIcon fontSize="small" />}
          onClick={onAddItem}
        >
          Add Item
        </Button>
      </Stack>
    </Stack>
  );
}

function ItemRow({ index, control, onRemove, removable }) {
  const row = useWatch({ control, name: `items.${index}` });
  const varianceQty = computeVarianceQty(row);
  const varianceValue = computeVarianceValue(row);

  return (
    <TableRow sx={{ '& td': { py: 0.75 } }}>
      <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.itemCode`}
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              size="small"
              fullWidth
              placeholder="Search Item Code"
              slotProps={{ input: { endAdornment: <InputAdornment position="end"><SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
            />
          )}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.itemName`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="Enter Item Name" />}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.hsnCode`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="Enter HSN Code" />}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.uom`}
          control={control}
          render={({ field }) => (
            <TextField {...field} select size="small" fullWidth>
              {UOM_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</MenuItem>
              ))}
            </TextField>
          )}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.systemQty`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="0.00" inputMode="decimal" />}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.countedQty`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="0.00" inputMode="decimal" />}
        />
      </TableCell>
      <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap', bgcolor: 'rgba(0,0,0,0.03)' }}>
        {varianceQty.toFixed(2)}
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.unitCost`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="0.00" inputMode="decimal" />}
        />
      </TableCell>
      <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap', bgcolor: 'rgba(0,0,0,0.03)' }}>
        {varianceValue.toFixed(2)}
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.remarks`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="Enter Remarks" />}
        />
      </TableCell>
      <TableCell>
        <IconButton size="small" onClick={onRemove} disabled={!removable} aria-label="Remove row">
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
