import { useMemo, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
  Paper, IconButton, InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import FormTextField from '../../components/form/FormTextField';
import FormSelect from '../../components/form/FormSelect';

import LabelItemsTable from './components/LabelItemsTable';
import LabelPrintSummaryCard from './components/LabelPrintSummaryCard';
import { DEFAULT_TERMS } from './components/LabelTermsAndNotes';
import { BATCHES, getBatchDetails } from './barcodeLabelMockData';
import {
  createBarcodeLabelSchema, createBarcodeLabelDefaultValues,
  LABEL_TYPE_OPTIONS, LABEL_SIZE_OPTIONS, PRINT_TEMPLATE_OPTIONS,
  ITEM_CATEGORY_OPTIONS, ITEM_OPTIONS, UOM_OPTIONS, BRAND_OPTIONS, WAREHOUSE_OPTIONS,
  BARCODE_TYPE_OPTIONS, ADDITIONAL_FILTER_OPTIONS, SORT_BY_OPTIONS,
} from './createBarcodeLabelSchema';

function nextBatchCode() {
  const maxNum = BATCHES.reduce((max, b) => Math.max(max, Number(b.code.slice(4))), 0);
  return `LBL-${String(maxNum + 1).padStart(5, '0')}`;
}

// The detail record's `labelType`/`labelSize`/`printTemplate`/`itemCategory`
// are display labels ("Barcode", "50mm x 25mm", "Standard 3-Column",
// "Grocery"), not the form selects' underlying option values — build
// label->value lookups from the option lists themselves so edit mode can
// prefill those selects correctly.
function labelToValueMap(options) {
  return Object.fromEntries(options.filter((o) => o.value).map((o) => [o.label, o.value]));
}
const LABEL_TYPE_LABEL_TO_VALUE = labelToValueMap(LABEL_TYPE_OPTIONS);
const LABEL_SIZE_LABEL_TO_VALUE = labelToValueMap(LABEL_SIZE_OPTIONS);
const PRINT_TEMPLATE_LABEL_TO_VALUE = labelToValueMap(PRINT_TEMPLATE_OPTIONS);
const ITEM_CATEGORY_LABEL_TO_VALUE = labelToValueMap(ITEM_CATEGORY_OPTIONS);

// Maps a detail record's plain {code, name, hsn, uom, barcode, printQty}
// item into the create form's item-row shape.
function itemToRow(item) {
  return {
    selected: false,
    itemCode: item.code,
    itemName: item.name,
    hsnCode: item.hsn,
    uom: item.uom,
    barcode: item.barcode,
    printQty: String(item.printQty ?? '1.00'),
    fromSerialBatch: '',
    toSerialBatch: '',
  };
}

/**
 * "New Barcode & Label" screen — matches the reference design's full
 * create form: a Label Details card (label config) beside a wider Filter
 * Criteria card (3-fields-per-row, used to resolve which items appear in
 * the grid below), a full-width editable items grid with a per-row
 * selection checkbox, and a 3-column row below it (Terms & Conditions /
 * Notes / Summary) — same layout pattern as CreateSalesInvoicePage.
 *
 * Item Category, Item, and Brand each get an inline "+" add button in the
 * reference (to add a new category/item/brand on the fly), matching the
 * Customer field's "+" pattern on the other create forms. From/To Item
 * Code get a search-icon adornment instead. Saving is mocked (no Barcode
 * & Label backend module yet).
 */
export default function CreateBarcodeLabelPage({ onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { code } = useParams();
  const isEditMode = Boolean(code);
  const existingBatch = isEditMode ? getBatchDetails(code) : null;
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const batchCode = useMemo(() => (isEditMode ? code : nextBatchCode()), [isEditMode, code]);

  const methods = useForm({
    resolver: zodResolver(createBarcodeLabelSchema),
    defaultValues: useMemo(() => {
      if (!existingBatch) return createBarcodeLabelDefaultValues;
      return {
        ...createBarcodeLabelDefaultValues,
        labelName: existingBatch.labelName,
        labelType: LABEL_TYPE_LABEL_TO_VALUE[existingBatch.labelType] || createBarcodeLabelDefaultValues.labelType,
        labelSize: LABEL_SIZE_LABEL_TO_VALUE[existingBatch.labelSize] || '',
        printTemplate: PRINT_TEMPLATE_LABEL_TO_VALUE[existingBatch.printTemplate] || '',
        itemCategory: ITEM_CATEGORY_LABEL_TO_VALUE[existingBatch.itemCategory] || '',
        items: existingBatch.items?.length ? existingBatch.items.map(itemToRow) : createBarcodeLabelDefaultValues.items,
      };
    }, [existingBatch]),
    mode: 'onTouched',
  });
  const { handleSubmit } = methods;

  const handleBack = () => {
    if (isEditMode) navigate(`/barcode-label/view/${code}`);
    else if (onBack) onBack();
    else navigate('/barcode-label/overview');
  };

  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleAddCategory = () => dispatch(showToast('Item Category picker is coming soon', 'info'));
  const handleAddItem2 = () => dispatch(showToast('Item picker is coming soon', 'info'));
  const handleAddBrand = () => dispatch(showToast('Brand picker is coming soon', 'info'));
  const handleAddItemRow = () => dispatch(showToast('Item picker is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  const onSaveAsDraft = handleSubmit(() => {
    dispatch(showToast(isEditMode ? `Barcode & Label batch ${batchCode} updated successfully` : `Barcode & Label batch ${batchCode} saved as draft`, 'success'));
    handleBack();
  });
  const onSaveAndSend = handleSubmit(() => {
    dispatch(showToast(isEditMode ? `Barcode & Label batch ${batchCode} updated successfully` : `Barcode & Label batch ${batchCode} saved and sent to print queue`, 'success'));
    handleBack();
  });

  if (isEditMode && !existingBatch) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Batch not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={() => navigate('/barcode-label')} sx={{ width: 'fit-content' }}>
          Back to Barcode &amp; Label List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{isEditMode ? `Barcode & Label (Edit ${batchCode})` : 'Barcode & Label (New)'}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/barcode-label" underline="hover" color="text.secondary">Barcode &amp; Label</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{isEditMode ? 'Edit Batch' : 'New Barcode & Label'}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' }, justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            {isEditMode ? 'Back to Batch' : 'Back'}
          </Button>
          <Button variant="outlined" color="inherit" startIcon={<PrintOutlinedIcon fontSize="small" />} onClick={handlePrintPreview}>
            Print / Preview
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            endIcon={<ExpandMoreIcon />}
            onClick={(e) => setMoreActionsAnchor(e.currentTarget)}
          >
            More Actions
          </Button>
          <Menu anchorEl={moreActionsAnchor} open={Boolean(moreActionsAnchor)} onClose={() => setMoreActionsAnchor(null)}>
            <MenuItem onClick={() => handleMoreAction('Save as Template')}>Save as Template</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Import Items')}>Import Items</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Reset Form')}>Reset Form</MenuItem>
          </Menu>
          {isEditMode ? (
            <Button variant="contained" color="warning" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSaveAsDraft}>
              Update Batch
            </Button>
          ) : (
            <>
              <Button variant="outlined" color="warning" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSaveAsDraft}>
                Save as Draft
              </Button>
              <Button variant="contained" color="warning" startIcon={<SendOutlinedIcon fontSize="small" />} onClick={onSaveAndSend}>
                Save &amp; Send
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      <FormProvider {...methods}>
        <Stack spacing={2} component="form" noValidate>
          <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Label Details</Typography>
                <Stack spacing={2}>
                  <FormTextField name="labelName" label="Label Name *" placeholder="Enter Label Name" />
                  <FormSelect name="labelType" label="Label Type *" options={LABEL_TYPE_OPTIONS} />
                  <FormSelect name="labelSize" label="Label Size *" options={LABEL_SIZE_OPTIONS} />
                  <FormSelect name="printTemplate" label="Print Template" options={PRINT_TEMPLATE_OPTIONS} />
                  <FormTextField name="labelsAcross" label="No. of Labels Across" placeholder="Enter No. of Labels Across" />
                  <FormTextField name="labelsDown" label="No. of Labels Down" placeholder="Enter No. of Labels Down" />
                  <FormTextField name="remarks" label="Remarks" placeholder="Enter Remarks (if any)" multiline minRows={3} />
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Filter Criteria</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <FormSelect name="itemCategory" label="Item Category" options={ITEM_CATEGORY_OPTIONS} />
                      </Box>
                      <IconButton
                        onClick={handleAddCategory}
                        sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                        aria-label="Add item category"
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <FormSelect name="item" label="Item" options={ITEM_OPTIONS} />
                      </Box>
                      <IconButton
                        onClick={handleAddItem2}
                        sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                        aria-label="Add item"
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormSelect name="uom" label="UoM" options={UOM_OPTIONS} />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <FormSelect name="brand" label="Brand" options={BRAND_OPTIONS} />
                      </Box>
                      <IconButton
                        onClick={handleAddBrand}
                        sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                        aria-label="Add brand"
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormSelect name="warehouse" label="Warehouse" options={WAREHOUSE_OPTIONS} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormTextField name="batchNo" label="Batch No." placeholder="Enter Batch No." />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormTextField
                      name="fromItemCode"
                      label="From Item Code"
                      placeholder="Enter From Item Code"
                      slotProps={{ input: { endAdornment: <InputAdornment position="end"><SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormTextField
                      name="toItemCode"
                      label="To Item Code"
                      placeholder="Enter To Item Code"
                      slotProps={{ input: { endAdornment: <InputAdornment position="end"><SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormSelect name="barcodeType" label="Barcode Type" options={BARCODE_TYPE_OPTIONS} />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 8 }}>
                    <FormSelect name="additionalFilter" label="Additional Filter" options={ADDITIONAL_FILTER_OPTIONS} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormSelect name="sortBy" label="Sort By" options={SORT_BY_OPTIONS} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Items</Typography>
            <LabelItemsTable onAddItem={handleAddItemRow} />
          </Paper>

          <BottomRow />
        </Stack>
      </FormProvider>
    </Stack>
  );
}

// Terms & Conditions / Notes / Print Summary, laid out as a 3-column row
// matching the reference, with Notes bound to the form's `notes` field.
function BottomRow() {
  return (
    <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Terms &amp; Conditions</Typography>
          <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
            {DEFAULT_TERMS.map((term) => (
              <Typography key={term} component="li" variant="body2" sx={{ color: 'text.secondary' }}>
                {term}
              </Typography>
            ))}
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <NotesField />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <LabelPrintSummaryCard />
      </Grid>
    </Grid>
  );
}

function NotesField() {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Notes</Typography>
      <FormTextField name="notes" placeholder="Enter notes (optional)" multiline minRows={4} fullWidth />
    </Paper>
  );
}
