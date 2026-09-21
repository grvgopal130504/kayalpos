import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, TextField, MenuItem,
  IconButton, Stack, Button,
} from '@mui/material';
import {
  Controller, useFormContext, useFieldArray, useWatch,
} from 'react-hook-form';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';

import ItemCodeAutocomplete from '../../../components/form/ItemCodeAutocomplete';
import { UNIT_OPTIONS, TAX_CODE_OPTIONS, emptyItemRow } from '../createSalesInvoiceSchema';
import { formatCurrency } from '../../../utils/format';

// Only autofill the Unit select when the picked product's own uom matches
// one of this grid's fixed dropdown values — see QuotationItemsTable's own
// comment.
function matchUnit(value) {
  return UNIT_OPTIONS.some((opt) => opt.value === value) ? value : '';
}

const COLUMNS = [
  { key: 'itemCode', label: 'Item Code *', minWidth: 160 },
  { key: 'itemName', label: 'Item Name', minWidth: 160 },
  { key: 'hsnCode', label: 'HSN Code', minWidth: 110 },
  { key: 'qty', label: 'Qty *', minWidth: 90 },
  { key: 'unit', label: 'Unit', minWidth: 100 },
  { key: 'unitPrice', label: 'Unit Price (₹) *', minWidth: 130 },
  { key: 'discountPercent', label: 'Discount (%)', minWidth: 110 },
  { key: 'discountAmount', label: 'Discount (₹)', minWidth: 110 },
  { key: 'taxCode', label: 'Tax Code', minWidth: 110 },
  { key: 'amount', label: 'Amount (₹)', minWidth: 120 },
];

function toNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Inline, editable line-items grid for the Create Sales Invoice form —
 * mirrors QuotationItemsTable/OrderItemsTable exactly (same
 * spreadsheet-style row entry, "+ Add Row" / "+ Add Item" controls,
 * horizontal-scroll wrapper). The computed Discount (₹) cell gets a subtle
 * shaded background to match the reference design's read-only styling.
 * Item Code is a searchable select (ItemCodeAutocomplete) backed by the real
 * Product master; picking a product autofills Item Name/HSN/Unit only —
 * Qty, Unit Price, Discount, and Tax Code are always left for manual entry.
 */
export default function InvoiceItemsTable({ onAddItem, products = [] }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  return (
    <Stack spacing={1.5}>
      <Box sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table size="small" sx={{ minWidth: 980 }}>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12.5, whiteSpace: 'nowrap', bgcolor: 'rgba(0,0,0,0.02)' } }}>
              <TableCell sx={{ width: 44 }}>#</TableCell>
              {COLUMNS.map((col) => (
                <TableCell key={col.key} sx={{ minWidth: col.minWidth }}>{col.label}</TableCell>
              ))}
              <TableCell sx={{ width: 44 }} />
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
          color="inherit"
          size="small"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => append(emptyItemRow())}
        >
          Add Row
        </Button>
        <Button
          variant="outlined"
          color="inherit"
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
  const qty = useWatchField(control, `items.${index}.qty`);
  const unitPrice = useWatchField(control, `items.${index}.unitPrice`);
  const discountPercent = useWatchField(control, `items.${index}.discountPercent`);

  const lineTotal = toNumber(qty) * toNumber(unitPrice);
  const discountAmount = Math.round(lineTotal * (toNumber(discountPercent) / 100) * 100) / 100;
  const amount = Math.max(lineTotal - discountAmount, 0);

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
            setValue(`items.${index}.unit`, matchUnit(product.uom), { shouldDirty: true });
          }}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.itemName`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="Item Name" />}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.hsnCode`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="HSN Code" />}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.qty`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="Qty" inputMode="decimal" />}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.unit`}
          control={control}
          render={({ field }) => (
            <TextField {...field} select size="small" fullWidth>
              {UNIT_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</MenuItem>
              ))}
            </TextField>
          )}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.unitPrice`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="Unit Price" inputMode="decimal" />}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.discountPercent`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="Discount" inputMode="decimal" />}
        />
      </TableCell>
      <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap', bgcolor: 'rgba(0,0,0,0.03)' }}>
        {formatCurrency(discountAmount, { decimals: true })}
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.taxCode`}
          control={control}
          render={({ field }) => (
            <TextField {...field} select size="small" fullWidth>
              {TAX_CODE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</MenuItem>
              ))}
            </TextField>
          )}
        />
      </TableCell>
      <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
        {formatCurrency(amount, { decimals: true })}
      </TableCell>
      <TableCell>
        <IconButton size="small" onClick={onRemove} disabled={!removable} aria-label="Remove row">
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

// Small local watch helper so each row only re-renders itself, not the
// whole table, when one of its own fields changes.
function useWatchField(control, name) {
  return useWatch({ control, name });
}
