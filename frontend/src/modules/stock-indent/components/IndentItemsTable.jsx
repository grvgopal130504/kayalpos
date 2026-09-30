import { useMemo } from 'react';
import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, TextField, MenuItem,
  IconButton, Stack, Button,
} from '@mui/material';
import { Controller, useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';

import ItemCodeAutocomplete from '../../../components/form/ItemCodeAutocomplete';
import { UOM_OPTIONS, WAREHOUSE_OPTIONS, emptyItemRow } from '../createStockIndentSchema';

// Only autofill the UoM select when the picked product's own uom matches one
// of this grid's fixed dropdown values — a Product master uom outside that
// list is a real mismatch, not something to fabricate a nonexistent option
// for, so the field is just left for the user to pick themselves.
function matchUom(value) {
  return UOM_OPTIONS.some((opt) => opt.value === value) ? value : '';
}

const COLUMNS = [
  { key: 'itemCode', label: 'Item Code *', minWidth: 150 },
  { key: 'itemName', label: 'Item Name', minWidth: 160 },
  { key: 'hsnCode', label: 'HSN Code', minWidth: 110 },
  { key: 'uom', label: 'UoM', minWidth: 100 },
  { key: 'requiredQty', label: 'Required Qty *', minWidth: 110 },
  { key: 'availableQty', label: 'Available Qty', minWidth: 100 },
  { key: 'issueWarehouse', label: 'Issue Warehouse *', minWidth: 140 },
  { key: 'remarks', label: 'Remarks', minWidth: 140 },
];

/**
 * Inline, editable line-items grid for the Create Stock Indent form — same
 * spreadsheet-style row entry as the other create forms, but with an
 * Available Qty column instead of pricing columns, since a stock indent is
 * a material request rather than a priced document. Available Qty is now a
 * real per-row lookup against the actual Product master (matched by the row's
 * Item Code, via the `productByCode` map built in CreateStockIndentPage from
 * useGetProductsQuery) — an item code with no matching product honestly
 * shows 0.00 rather than the old mock's permanently-static "0.00" text.
 */
export default function IndentItemsTable({ onAddItem, productByCode = {} }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const products = useMemo(() => Object.values(productByCode), [productByCode]);

  return (
    <Stack spacing={1.5}>
      <Box sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table size="small" sx={{ minWidth: 1080 }}>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12.5, whiteSpace: 'nowrap', bgcolor: 'rgba(0,0,0,0.02)' } }}>
              <TableCell sx={{ width: 44 }}>#</TableCell>
              {COLUMNS.map((col) => (
                <TableCell key={col.key} sx={{ minWidth: col.minWidth }}>{col.label}</TableCell>
              ))}
              <TableCell sx={{ width: 44 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field, index) => (
              <ItemRow
                key={field.id}
                index={index}
                control={control}
                onRemove={() => remove(index)}
                removable={fields.length > 1}
                productByCode={productByCode}
                products={products}
              />
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
  index, control, onRemove, removable, productByCode, products,
}) {
  const { setValue } = useFormContext();
  const itemCode = useWatch({ control, name: `items.${index}.itemCode` });
  const matchedProduct = productByCode[itemCode?.trim()];
  const availableQty = matchedProduct ? Number(matchedProduct.availableQty) : 0;

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
          name={`items.${index}.requiredQty`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="Qty" inputMode="decimal" />}
        />
      </TableCell>
      <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap', bgcolor: 'rgba(0,0,0,0.03)' }}>
        {availableQty.toFixed(2)}
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.issueWarehouse`}
          control={control}
          render={({ field }) => (
            <TextField {...field} select size="small" fullWidth>
              {WAREHOUSE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</MenuItem>
              ))}
            </TextField>
          )}
        />
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
