import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, TextField, Checkbox,
  IconButton, InputAdornment, Stack, Button,
} from '@mui/material';
import { Controller, useFormContext, useFieldArray } from 'react-hook-form';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';

import { emptyItemRow } from '../createBarcodeLabelSchema';

const COLUMNS = [
  { key: 'itemCode', label: 'Item Code', minWidth: 130 },
  { key: 'itemName', label: 'Item Name', minWidth: 160 },
  { key: 'hsnCode', label: 'HSN Code', minWidth: 110 },
  { key: 'uom', label: 'UoM', minWidth: 90 },
  { key: 'barcode', label: 'Barcode', minWidth: 150 },
  { key: 'printQty', label: 'Print Qty *', minWidth: 100 },
  { key: 'fromSerialBatch', label: 'From Serial / Batch', minWidth: 170 },
  { key: 'toSerialBatch', label: 'To Serial / Batch', minWidth: 170 },
];

/**
 * Inline, editable line-items grid for the Create Barcode & Label form —
 * same spreadsheet-style row entry as QuotationItemsTable/OrderItemsTable/
 * InvoiceItemsTable, but with a per-row selection checkbox (Total
 * Items/Labels below only count checked rows, matching the reference,
 * where every row starts unchecked and the totals read 0.00) and no
 * pricing columns since a label batch isn't a priced document.
 */
export default function LabelItemsTable({ onAddItem }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  return (
    <Stack spacing={1.5}>
      <Box sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table size="small" sx={{ minWidth: 1080 }}>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12.5, whiteSpace: 'nowrap', bgcolor: 'rgba(0,0,0,0.02)' } }}>
              <TableCell sx={{ width: 44 }}>#</TableCell>
              <TableCell sx={{ width: 44 }} />
              {COLUMNS.map((col) => (
                <TableCell key={col.key} sx={{ minWidth: col.minWidth }}>{col.label}</TableCell>
              ))}
              <TableCell sx={{ width: 44 }} />
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
  return (
    <TableRow sx={{ '& td': { py: 0.75 } }}>
      <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.selected`}
          control={control}
          render={({ field }) => (
            <Checkbox
              checked={Boolean(field.value)}
              onChange={(e) => field.onChange(e.target.checked)}
              size="small"
            />
          )}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.itemCode`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="Item Code" />}
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
          name={`items.${index}.uom`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="UoM" />}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.barcode`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="Barcode" />}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.printQty`}
          control={control}
          render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="Print Qty" inputMode="decimal" />}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.fromSerialBatch`}
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              size="small"
              fullWidth
              placeholder="Enter From Serial / Batch"
              slotProps={{ input: { endAdornment: <InputAdornment position="end"><SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
            />
          )}
        />
      </TableCell>
      <TableCell>
        <Controller
          name={`items.${index}.toSerialBatch`}
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              size="small"
              fullWidth
              placeholder="Enter To Serial / Batch"
              slotProps={{ input: { endAdornment: <InputAdornment position="end"><SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
            />
          )}
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
