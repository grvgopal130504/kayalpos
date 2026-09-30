import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, TextField, MenuItem,
  IconButton, Stack, Button,
} from '@mui/material';
import { Controller, useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';

import FormDatePicker from '../../../components/form/FormDatePicker';
import ItemCodeAutocomplete from '../../../components/form/ItemCodeAutocomplete';
import { UOM_OPTIONS, emptyItemRow } from '../createStockWastageSchema';

// Only autofill the UoM select when the picked product's own uom matches one
// of this grid's fixed dropdown values — see IndentItemsTable's own comment.
function matchUom(value) {
  return UOM_OPTIONS.some((opt) => opt.value === value) ? value : '';
}

const COLUMNS = [
  { key: 'itemCode', label: 'Item Code *', minWidth: 150 },
  { key: 'itemName', label: 'Item Name', minWidth: 150 },
  { key: 'hsnCode', label: 'HSN Code', minWidth: 110 },
  { key: 'uom', label: 'UoM', minWidth: 100 },
  { key: 'batchNo', label: 'Batch No. (if any)', minWidth: 140 },
  { key: 'expiryDate', label: 'Expiry Date (if any)', minWidth: 150 },
  { key: 'availableQty', label: 'Available Qty', minWidth: 110 },
  { key: 'wastageQty', label: 'Wastage Qty *', minWidth: 110 },
  { key: 'unitCost', label: 'Unit Cost (₹)', minWidth: 110 },
  { key: 'wastageValue', label: 'Wastage Value (₹)', minWidth: 140 },
  { key: 'remarks', label: 'Remarks', minWidth: 140 },
];

function toNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

// wastageQty * unitCost — no discount/tax on a stock write-off, so the
// computed cell is a plain value product, shaded read-only like the other
// create forms' derived columns.
export function computeLineValue(row) {
  return toNumber(row.wastageQty) * toNumber(row.unitCost);
}

/**
 * Inline, editable line-items grid for the Create Stock Wastage form —
 * spreadsheet-style row entry matching ReturnItemsTable/ReceiptItemsTable,
 * with Available Qty as a free-typed reference figure (no linked
 * PO/GRN/transfer to look it up from) alongside the editable Wastage Qty,
 * and a computed Wastage Value in place of a priced Total Cost (no
 * discount/tax on a write-off). Item Code is a searchable select
 * (ItemCodeAutocomplete) backed by the real Product master; picking a
 * product autofills Item Name/HSN/UoM only.
 */
export default function WastageItemsTable({ onAddItem, products = [] }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  return (
    <Stack spacing={1.5}>
      <Box sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table size="small" sx={{ minWidth: 1400 }}>
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
              <ItemRow key={field.id} index={index} control={control} onRemove={() => remove(index)} removable={fields.length > 1} products={products} />
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

function ItemRow({
  index, control, onRemove, removable, products,
}) {
  const { setValue } = useFormContext();
  const row = useWatch({ control, name: `items.${index}` });
  const wastageValue = computeLineValue(row);

  return (
    <TableRow sx={{ '& td': { py: 0.75 } }}>
      <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
      <TableCell>
        <ItemCodeAutocomplete
          control={control}
          name={`items.${index}.itemCode`}
          products={products}
          onSelectProduct={(product) => {
            setValue(`items.${index}.itemName`, product.name, { shouldDirty: true });
            setValue(`items.${index}.hsnCode`, product.hsnSac || '', { shouldDirty: true });
            setValue(`items.${index}.uom`, matchUom(product.uom), { shouldDirty: true });
          }}
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
          name={`items.${index}.batchNo`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="Enter Batch No." />}
        />
      </TableCell>
      <TableCell>
        <FormDatePicker name={`items.${index}.expiryDate`} placeholder="Select Date" size="small" />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.availableQty`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="0.00" inputMode="decimal" />}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.wastageQty`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="0.00" inputMode="decimal" />}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.unitCost`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="0.00" inputMode="decimal" />}
        />
      </TableCell>
      <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap', bgcolor: 'rgba(0,0,0,0.03)' }}>
        {wastageValue.toFixed(2)}
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
