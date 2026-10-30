import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Stack,
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Grid,
  Paper,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import MoveToInboxOutlinedIcon from "@mui/icons-material/MoveToInboxOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";

import { useAppDispatch } from "../../../app/hooks";
import { showToast } from "../../../features/ui/uiSlice";
import StatCard from "../../../components/common/StatCard";
import { formatNumber } from "../../../utils/format";
import FormTextField from "../../../components/form/FormTextField";
import FormSelect from "../../../components/form/FormSelect";
import { useGetOutletsQuery } from "../../../api/outletApi";
import {
  useGetWarehousesQuery,
  useGetWarehouseQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
  useNextWarehouseCode,
  useAddWarehouseContactMutation,
  useUpdateWarehouseContactMutation,
  useDeleteWarehouseContactMutation,
} from "../../../api/warehouseApi";

import ContactPersonTable from "../company/components/ContactPersonTable";
import ContactPersonFormDialog from "../company/components/ContactPersonFormDialog";
import WarehouseLogoCard from "./components/WarehouseLogoCard";
import WarehouseCapacityCard from "./components/WarehouseCapacityCard";
import WarehouseInchargeCard from "./components/WarehouseInchargeCard";
import {
  createWarehouseSchema,
  createWarehouseDefaultValues,
  warehouseToFormValues,
  warehouseFormValuesToPayload,
  WAREHOUSE_TYPE_OPTIONS,
  LOCATION_OPTIONS,
  COMPANY_OPTIONS,
  STATE_OPTIONS,
  COUNTRY_OPTIONS,
  STATUS_OPTIONS,
  OUTLET_PLACEHOLDER_OPTION,
} from "./createWarehouseSchema";

const LIST_COLUMNS = [
  "Code",
  "Name",
  "Type",
  "Outlet",
  "State",
  "Status",
  "Action",
];
const DETAIL_TABS = ["Warehouse Details"];

/**
 * Warehouse — the Masters > Warehouse master, ALL in one page and one
 * route (`/masters/warehouse`): the list, "New Warehouse", View, and Edit
 * all live here as one component swapping between a
 * `view: 'list' | 'detail'` state, the same single-page pattern
 * Company/Outlet's own pages use (see OutletPage.jsx) rather than
 * separate list/detail routes — a row's View/Edit and "New Warehouse" all
 * just switch `view` and `activeId` in place instead of navigating away.
 *
 * List view: search/status-filter run server-side against the real
 * Warehouse API (see api/warehouseApi.js). Detail view: tabs, Basic
 * Information + Contact Person on the left, Logo/Warehouse Capacity/
 * Warehouse Incharge on the right, view-then-Edit-to-unlock-fields screen —
 * reached by clicking "New Warehouse" (blank form, already in edit mode)
 * or a row's View/Edit action (loads that warehouse, starts read-only).
 * It has a single "Warehouse Details" tab. The Outlet dropdown is
 * backed by the real, active Outlet list (Warehouse.outletId is a real
 * foreign key — see schema.prisma) rather than a static picklist. The
 * Contact Person grid is its own real CRUD against the Warehouse Contact
 * endpoints, independent of the main form's Edit/Save toggle, and only
 * available once the warehouse has been saved at least once (a contact
 * needs a real warehouseId to attach to).
 */
export default function WarehousePage() {
  const dispatch = useAppDispatch();

  const [view, setView] = useState("list");
  const [activeId, setActiveId] = useState(null);
  const isNew = view === "detail" && !activeId;

  // ---- List state ----
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("All");
  const [appliedSearch, setAppliedSearch] = useState("");

  const {
    data: warehouses = [],
    isLoading: isListLoading,
    isError: isListError,
  } = useGetWarehousesQuery(
    {
      search: appliedSearch || undefined,
      isActive: status !== "All" ? String(status === "Active") : undefined,
    },
    { skip: view !== "list" },
  );
  const [deleteWarehouse] = useDeleteWarehouseMutation();

  // ---- Detail state ----
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [logoName, setLogoName] = useState("");
  const [contactDialog, setContactDialog] = useState({
    open: false,
    mode: "add",
    row: null,
  });

  const {
    data: warehouse,
    isLoading,
    isFetching,
  } = useGetWarehouseQuery(activeId, { skip: view !== "detail" || isNew });
  const nextCode = useNextWarehouseCode(isNew);
  const [createWarehouse] = useCreateWarehouseMutation();
  const [updateWarehouse] = useUpdateWarehouseMutation();
  const [addWarehouseContact] = useAddWarehouseContactMutation();
  const [updateWarehouseContact] = useUpdateWarehouseContactMutation();
  const [deleteWarehouseContact] = useDeleteWarehouseContactMutation();

  // Only active outlets, same restriction the login screen's own outlet
  // dropdown uses — a warehouse shouldn't be assignable to a deactivated
  // outlet going forward, even though an already-saved warehouse keeps
  // showing its (now-inactive) outlet's name via the detail GET's include.
  const { data: outlets = [] } = useGetOutletsQuery(
    { isActive: "true" },
    { skip: view !== "detail" },
  );
  const outletOptions = useMemo(
    () => [
      OUTLET_PLACEHOLDER_OPTION,
      ...outlets.map((o) => ({ value: o.id, label: o.name })),
    ],
    [outlets],
  );

  const methods = useForm({
    resolver: zodResolver(createWarehouseSchema),
    defaultValues: createWarehouseDefaultValues,
    mode: "onTouched",
  });
  const { handleSubmit, reset, setValue } = methods;

  // Resets the form to the real warehouse once it loads. Guarded on
  // `warehouse` itself (not just `!isFetching`) — right after switching
  // into the detail view, RTK Query briefly reports isFetching:false/
  // data:undefined for the still-uninitialized query (before its own
  // effect has dispatched the request), and resetting to blank defaults on
  // that transient render clobbered the real values a moment later raced
  // against. Also skipped while a save is in flight so the just-submitted
  // values aren't clobbered by a stale refetch racing the mutation's own
  // cache invalidation.
  useEffect(() => {
    if (view === "detail" && !isNew && warehouse && !isFetching) {
      reset(warehouseToFormValues(warehouse));
      setLogoName(warehouse?.logoName || "");
    }
  }, [view, warehouse, isNew, isFetching, reset]);

  // The live "WH004"-style code preview only exists in "new" mode; fill
  // the (otherwise-blank) Warehouse Code field with it as soon as it
  // arrives.
  useEffect(() => {
    if (isNew && nextCode) setValue("warehouseCode", nextCode);
  }, [isNew, nextCode, setValue]);

  const contacts = warehouse?.contacts || [];


  // ---- List actions ----
  const goToList = () => {
    setView("list");
    setActiveId(null);
  };
  const openNewWarehouse = () => {
    reset(createWarehouseDefaultValues);
    setLogoName("");
    setIsEditing(true);
    setActiveId(null);
    setView("detail");
  };
  const openWarehouse = (row) => {
    setIsEditing(false);
    setActiveId(row.id);
    setView("detail");
  };
  const handleSearch = () => setAppliedSearch(searchInput.trim());
  const handleReset = () => {
    setSearchInput("");
    setStatus("All");
    setAppliedSearch("");
  };
  const handleDeleteRow = async (row) => {
    if (
      !window.confirm(`Delete warehouse "${row.name}"? This cannot be undone.`)
    )
      return;
    try {
      await deleteWarehouse(row.id).unwrap();
      dispatch(showToast(`${row.name} deleted`, "success"));
    } catch (err) {
      dispatch(
        showToast(err?.data?.message || "Failed to delete warehouse", "error"),
      );
    }
  };

  const stats = useMemo(
    () => ({
      total: warehouses.length,
      active: warehouses.filter((w) => w.isActive).length,
      inactive: warehouses.filter((w) => !w.isActive).length,
    }),
    [warehouses],
  );

  // ---- Detail actions ----
  const handleEdit = () => setIsEditing(true);
  const handleMoreAction = (label) => {
    setMoreAnchor(null);
    dispatch(showToast(`${label} is coming soon`, "info"));
  };
  const handleLogoUpload = (file) => setLogoName(file?.name || "");
  const handleLogoRemove = () => setLogoName("");

  const onSave = handleSubmit(async (values) => {
    setIsSaving(true);
    try {
      const payload = warehouseFormValuesToPayload(values, logoName);
      if (isNew) {
        const created = await createWarehouse(payload).unwrap();
        dispatch(showToast(`${created.name} created successfully`, "success"));
        setActiveId(created.id);
        setIsEditing(false);
      } else {
        await updateWarehouse({ id: activeId, ...payload }).unwrap();
        setIsEditing(false);
        dispatch(
          showToast(`${values.warehouseName} saved successfully`, "success"),
        );
      }
    } catch (err) {
      dispatch(
        showToast(
          err?.data?.message ||
            "Could not save this warehouse. Please try again.",
          "error",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  });

  const handleAddContact = () =>
    setContactDialog({ open: true, mode: "add", row: null });
  const handleEditContact = (row) =>
    setContactDialog({ open: true, mode: "edit", row });
  const closeContactDialog = () =>
    setContactDialog((prev) => ({ ...prev, open: false }));

  const handleSubmitContact = async (payload) => {
    try {
      if (contactDialog.mode === "edit") {
        await updateWarehouseContact({
          warehouseId: activeId,
          id: contactDialog.row.id,
          ...payload,
        }).unwrap();
        dispatch(showToast("Contact person updated successfully", "success"));
      } else {
        await addWarehouseContact({
          warehouseId: activeId,
          ...payload,
        }).unwrap();
        dispatch(showToast("Contact person added successfully", "success"));
      }
    } catch (err) {
      dispatch(
        showToast(
          err?.data?.message ||
            "Could not save this contact person. Please try again.",
          "error",
        ),
      );
      throw err;
    }
  };

  const handleDeleteContact = async (row) => {
    if (
      !window.confirm(
        `Delete contact person "${row.name}"? This cannot be undone.`,
      )
    )
      return;
    try {
      await deleteWarehouseContact({
        warehouseId: activeId,
        id: row.id,
      }).unwrap();
      dispatch(showToast(`${row.name} deleted`, "success"));
    } catch (err) {
      dispatch(
        showToast(
          err?.data?.message || "Failed to delete contact person",
          "error",
        ),
      );
    }
  };

  const disabledProps = { disabled: !isEditing || isSaving };

  const HeaderBar = ({ crumb }) => (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Warehouse
        </Typography>
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 14 }} />}
          sx={{ "& .MuiTypography-root, & .MuiLink-root": { fontSize: 12.5 } }}
        >
          <MuiLink
            component={RouterLink}
            to="/home"
            underline="hover"
            color="text.secondary"
          >
            Home
          </MuiLink>
          <MuiLink
            component={RouterLink}
            to="/masters"
            underline="hover"
            color="text.secondary"
          >
            Masters
          </MuiLink>
          {view === "list" ? (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Warehouse
            </Typography>
          ) : (
            <MuiLink
              component="button"
              type="button"
              underline="hover"
              color="text.secondary"
              onClick={goToList}
            >
              Warehouse
            </MuiLink>
          )}
          {crumb && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {crumb}
            </Typography>
          )}
        </Breadcrumbs>
      </Box>
    </Stack>
  );

  if (view === "list") {
    return (
      <Stack spacing={2}>
        <HeaderBar />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              icon={MoveToInboxOutlinedIcon}
              iconColor="#8B5CF6"
              iconShape="circle"
              label="Total Warehouses"
              value={formatNumber(stats.total)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              icon={FactCheckOutlinedIcon}
              iconColor="success"
              iconShape="circle"
              label="Active Warehouses"
              value={formatNumber(stats.active)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              icon={HighlightOffOutlinedIcon}
              iconColor="error"
              iconShape="circle"
              label="Inactive Warehouses"
              value={formatNumber(stats.inactive)}
            />
          </Grid>
        </Grid>

        <Paper
          variant="outlined"
          sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}
        >
          <Grid container spacing={1.5} sx={{ alignItems: "flex-end" }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                label="Search Warehouse"
                placeholder="Search by warehouse name or code..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <TextField
                select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                fullWidth
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon fontSize="small" />}
                onClick={handleSearch}
                fullWidth
              >
                Search
              </Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<CloseIcon fontSize="small" />}
                onClick={handleReset}
                fullWidth
              >
                Reset
              </Button>
            </Grid>
            <Grid
              size={{ xs: 6, sm: 3, md: 3 }}
              sx={{
                display: "flex",
                justifyContent: { xs: "flex-start", md: "flex-end" },
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon fontSize="small" />}
                onClick={openNewWarehouse}
                fullWidth
              >
                New Warehouse
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper
          variant="outlined"
          sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Warehouse List
          </Typography>
          {isListError ? (
            <Typography
              variant="body2"
              sx={{ color: "error.main", textAlign: "center", py: 3 }}
            >
              Failed to load warehouses. Please try again.
            </Typography>
          ) : (
            <Box
              sx={{
                overflowX: "auto",
                opacity: isListLoading ? 0.6 : 1,
                transition: "opacity 0.15s ease",
              }}
            >
              <Table size="small" sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow>
                    {LIST_COLUMNS.map((col) => (
                      <TableCell
                        key={col}
                        className={col === "Action" ? "sticky-action" : undefined}
                        sx={{
                          color: "text.secondary",
                          fontWeight: 600,
                          fontSize: 12.5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {warehouses.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={LIST_COLUMNS.length}
                        sx={{ textAlign: "center", py: 3 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          {isListLoading
                            ? "Loading warehouses…"
                            : "No warehouses found — create one to get started."}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {warehouses.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => openWarehouse(row)}
                    >
                      <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                        {row.code}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.name}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.warehouseType || "—"}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.outlet?.name || "—"}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.state || "—"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.isActive ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            bgcolor: row.isActive
                              ? "rgba(34,160,107,0.12)"
                              : "rgba(107,114,128,0.12)",
                            color: row.isActive
                              ? "success.main"
                              : "text.secondary",
                            fontWeight: 700,
                            height: 22,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        className="sticky-action"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openWarehouse(row)}
                            aria-label={`Open ${row.name}`}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openWarehouse(row)}
                            aria-label={`Edit ${row.name}`}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteRow(row)}
                            aria-label={`Delete ${row.name}`}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
            Showing {warehouses.length} of {warehouses.length} records
          </Typography>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <HeaderBar crumb={isNew ? "New" : warehouse?.name || "..."} />

      <Paper
        variant="outlined"
        sx={{ borderRadius: 3, px: { xs: 1, sm: 1.5 } }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.5}
          sx={{
            alignItems: { xs: "stretch", lg: "center" },
            justifyContent: "space-between",
            py: { xs: 1, lg: 0 },
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              px: 1.5,
              py: { xs: 0.5, lg: 1.5 },
            }}
          >
            {DETAIL_TABS[0]}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{
              flexWrap: "wrap",
              py: { xs: 1, lg: 1.5 },
              justifyContent: { xs: "flex-start", lg: "flex-end" },
            }}
          >
            <Button variant="outlined" color="inherit" onClick={goToList}>
              Back to List
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditOutlinedIcon fontSize="small" />}
              onClick={handleEdit}
              disabled={isEditing || isLoading}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={
                isSaving ? (
                  <CircularProgress size={14} />
                ) : (
                  <SaveOutlinedIcon fontSize="small" />
                )
              }
              onClick={onSave}
              disabled={!isEditing || isSaving}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="primary"
              endIcon={<ExpandMoreIcon fontSize="small" />}
              onClick={(e) => setMoreAnchor(e.currentTarget)}
            >
              More
            </Button>
            <Menu
              anchorEl={moreAnchor}
              open={Boolean(moreAnchor)}
              onClose={() => setMoreAnchor(null)}
            >
              <MenuItem onClick={() => handleMoreAction("Duplicate Warehouse")}>
                Duplicate Warehouse
              </MenuItem>
              <MenuItem onClick={() => handleMoreAction("Export Details")}>
                Export Details
              </MenuItem>
              <MenuItem
                onClick={() => handleMoreAction("Deactivate Warehouse")}
              >
                Deactivate Warehouse
              </MenuItem>
            </Menu>
          </Stack>
        </Stack>
      </Paper>

      {!isNew && (isLoading || !warehouse) ? (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            p: 4,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={28} />
        </Paper>
      ) : (
        <FormProvider {...methods}>
          <Stack spacing={2} component="form" noValidate>
            <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <Paper
                  variant="outlined"
                  sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, color: "primary.main", mb: 2 }}
                  >
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField
                        name="warehouseCode"
                        label="Warehouse Code *"
                        {...disabledProps}
                        disabled={disabledProps.disabled || isNew}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect
                        name="warehouseType"
                        label="Warehouse Type *"
                        options={WAREHOUSE_TYPE_OPTIONS}
                        {...disabledProps}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField
                        name="warehouseName"
                        label="Warehouse Name *"
                        {...disabledProps}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect
                        name="location"
                        label="Location"
                        options={LOCATION_OPTIONS}
                        {...disabledProps}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect
                        name="company"
                        label="Company *"
                        options={COMPANY_OPTIONS}
                        {...disabledProps}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect
                        name="state"
                        label="State *"
                        options={STATE_OPTIONS}
                        {...disabledProps}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect
                        name="outlet"
                        label="Outlet *"
                        options={outletOptions}
                        {...disabledProps}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect
                        name="country"
                        label="Country *"
                        options={COUNTRY_OPTIONS}
                        {...disabledProps}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField
                        name="address"
                        label="Address *"
                        multiline
                        minRows={3}
                        {...disabledProps}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField
                        name="pincode"
                        label="Pincode *"
                        {...disabledProps}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField
                        name="landmark"
                        label="Landmark"
                        {...disabledProps}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect
                        name="status"
                        label="Status *"
                        options={STATUS_OPTIONS}
                        {...disabledProps}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <Stack spacing={2}>
                  <WarehouseLogoCard
                    warehouseName={warehouse?.name}
                    logoName={logoName}
                    onUpload={handleLogoUpload}
                    onRemove={handleLogoRemove}
                  />
                  <WarehouseCapacityCard disabled={disabledProps.disabled} />
                  <WarehouseInchargeCard
                    disabled={disabledProps.disabled}
                    onEdit={() =>
                      dispatch(
                        showToast(
                          "Edit Warehouse Incharge is coming soon",
                          "info",
                        ),
                      )
                    }
                  />
                </Stack>
              </Grid>
            </Grid>

            <Paper
              variant="outlined"
              sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "primary.main", mb: 2 }}
              >
                Contact Person
              </Typography>
              {isNew ? (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Save this warehouse first, then add contact persons here.
                </Typography>
              ) : (
                <ContactPersonTable
                  rows={contacts}
                  onAdd={handleAddContact}
                  onEditRow={handleEditContact}
                  onDeleteRow={handleDeleteContact}
                />
              )}
            </Paper>
          </Stack>
        </FormProvider>
      )}

      {!isNew && (
        <ContactPersonFormDialog
          open={contactDialog.open}
          mode={contactDialog.mode}
          initialValues={contactDialog.row}
          onClose={closeContactDialog}
          onSubmit={handleSubmitContact}
        />
      )}
    </Stack>
  );
}
