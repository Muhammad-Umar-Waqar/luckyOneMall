// src/pages/management/DeviceList.jsx
import { Pencil, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  FormHelperText,
  Stack,
} from "@mui/material";



import { fetchAllDevices, updateDevice, deleteDevice } from "../../slices/DeviceSlice";
import "../../styles/pages/management-pages.css";
import TableSkeleton from "../../components/skeletons/TableSkeleton";

const DeviceList = ({ onDeviceSelect, selectedDevice }) => {
  const dispatch = useDispatch();
  const { DeviceArray = [], isLoading, error } = useSelector((state) => state.Device || {});
  const { Venues = [] } = useSelector((state) => state.Venue || {});
  const [working, setWorking] = useState(false);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [editForm, setEditForm] = useState({
    deviceId: "",
    venueId: "",
    ambientOp: ">=",
    ambientVal: "",
    freezerOp: ">=",
    freezerVal: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete confirm dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: null, name: "" });

  // Snackbar state
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });

  useEffect(() => {
    dispatch(fetchAllDevices());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      console.error("Device error:", error);
      setSnack({ open: true, severity: "error", message: String(error) });
    }
  }, [error]);

  // ---- Delete flow using MUI dialog
  const openDeleteConfirm = (id, displayName) => {
    setDeleteTarget({ id, name: displayName });
    setDeleteOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteOpen(false);
    setDeleteTarget({ id: null, name: "" });
  };

  const handleDeleteConfirm = async () => {
    const id = deleteTarget.id;
    setDeleteOpen(false);
    if (!id) return;
    try {
      setWorking(true);
      await dispatch(deleteDevice(id)).unwrap();

      setSnack({ open: true, severity: "success", message: "Device deleted." });
      dispatch(fetchAllDevices());
    } catch (err) {
      console.error("Delete device error:", err);
      setSnack({ open: true, severity: "error", message: err?.toString() || "Delete failed" });
    } finally {
      setWorking(false);
      setDeleteTarget({ id: null, name: "" });
    }
  };

  // --- Edit flow: opens MUI dialog with prefilled values
  const handleEdit = (device) => {
    const currentDeviceId = device.deviceId || "";
    const currentVenueId = device.venue?._id ?? device.venue ?? "";
    const condMap = {};
    (device.conditions || []).forEach((c) => {
      condMap[c.type] = c;
    });

    const ambient = condMap.ambient || { operator: ">=", value: "" };
    const freezer = condMap.freezer || { operator: ">=", value: "" };

    setEditingDeviceId(device._id ?? device.id ?? null);
    setEditForm({
      deviceId: currentDeviceId,
      venueId: currentVenueId,
      ambientOp: ambient.operator ?? ">=",
      ambientVal:
        ambient.value === undefined || ambient.value === null ? "" : String(ambient.value),
      freezerOp: freezer.operator ?? ">=",
      freezerVal:
        freezer.value === undefined || freezer.value === null ? "" : String(freezer.value),
    });
    setFormErrors({});
    setEditOpen(true);
  };

  const handleEditChange = (field) => (e) => {
    const v = e?.target?.value ?? "";
    setEditForm((s) => ({ ...s, [field]: v }));
    setFormErrors((s) => ({ ...s, [field]: undefined }));
  };

  const handleEditCancel = () => {
    setEditOpen(false);
    setFormErrors({});
    setEditingDeviceId(null);
  };

  const handleEditSave = async () => {
    const { deviceId, venueId, ambientOp, ambientVal, freezerOp, freezerVal } = editForm;
    const errors = {};
    if (!deviceId || !deviceId.toString().trim()) errors.deviceId = "Device ID is required";
    if (!venueId) errors.venueId = "Venue is required";

    if (ambientVal !== "" && Number.isNaN(Number(ambientVal))) errors.ambientVal = "Must be a number";
    if (freezerVal !== "" && Number.isNaN(Number(freezerVal))) errors.freezerVal = "Must be a number";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const conditions = [];
    if (ambientVal !== "") conditions.push({ type: "ambient", operator: ambientOp, value: Number(ambientVal) });
    if (freezerVal !== "") conditions.push({ type: "freezer", operator: freezerOp, value: Number(freezerVal) });

    try {
      setWorking(true);
      await dispatch(
        updateDevice({
          id: editingDeviceId,
          deviceId: deviceId.toString().trim(),
          venueId,
          conditions,
        })
      ).unwrap();

      setSnack({ open: true, severity: "success", message: "Device updated." });
      setEditOpen(false);
      dispatch(fetchAllDevices());
    } catch (err) {
      console.error("Update device error:", err);
      setSnack({ open: true, severity: "error", message: err?.toString() || "Update failed" });
    } finally {
      setWorking(false);
      setEditingDeviceId(null);
    }
  };

  const displayDevices = DeviceArray || [];

  return (
    <div className="ListPage device-list-container bg-white rounded-xl shadow-sm w-full h-full border border-[#E5E7EB]">
      <h1 className="device-list-title font-semibold text-gray-800 mb-4">Device Management</h1>
      <div className="mb-4">
        <h2 className="device-list-header text-center font-semibold text-gray-800">Device List</h2>
        <div className="mx-auto mt-2 h-px w-4/5 bg-[#2563EB]/40"></div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 font-bold text-gray-800">Device ID</th>
              <th className="py-2 px-4 text-center">Actions</th>
            </tr>
          </thead>
        </table>

        <div className="overflow-y-auto pr-1 user-table-scroll h-[60vh] ">
          <table className="w-full table-auto text-left">
            <tbody>
              {isLoading && <TableSkeleton />}

              {!isLoading &&
                displayDevices.map((d, idx) => {
                  const id = d._id ?? idx;
                  const deviceIdDisplay = d.deviceId ?? `Device ${idx + 1}`;
                  const venueName = d.venue?.name ?? d.venue ?? "—";

                  return (
                    <tr
                      key={id}
                      className={`border-b border-gray-200 cursor-pointer transition-colors hover:bg-blue-50/60 ${
                        selectedDevice?._id === id || selectedDevice?.id === id ? "bg-blue-50 border-blue-300" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeviceSelect?.(d);
                      }}
                    >
                      <td className="py-2 sm:py-3 px-2 sm:px-4">{deviceIdDisplay}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="flex justify-center gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEdit(d)}
                            className="rounded-full border border-green-500/50 bg-white flex items-center justify-center hover:bg-green-50 p-2 cursor-pointer"
                            disabled={working}
                          >
                            <Pencil className="text-green-600" size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(id, deviceIdDisplay)}
                            className="rounded-full border border-red-500/50 bg-white flex items-center justify-center hover:bg-red-50 p-2 cursor-pointer"
                            disabled={working}
                          >
                            <Trash className="text-red-600" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {!isLoading && displayDevices.length === 0 && <tr><td className="p-4">No devices found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog — vertical layout with operator+value pairs inline */}
 {/* Edit Dialog — vertical layout with operator+value pairs inline */}
<Dialog open={editOpen} onClose={handleEditCancel} maxWidth="xs" fullWidth>
  <DialogTitle>Edit Device</DialogTitle>

  {/* Use Stack for a simple vertical flow */}
  <DialogContent dividers >
    <Stack spacing={2} alignItems="center" justifyContent="center">

      {/* Device ID — Select (full width) */}
      <FormControl sx={{ width: "83%" }} error={!!formErrors.deviceId} >
          <TextField
            label="Device ID"
            value={editForm.deviceId}
            fullWidth
            error={!!formErrors.ambientVal}
            helperText={formErrors.ambientVal}
             onChange={(e) =>
            setEditForm({ ...editForm, deviceId: e.target.value })
          }
          />
        {formErrors.deviceId && <FormHelperText>{formErrors.deviceId}</FormHelperText>}
      </FormControl>

      {/* Venue — Select (full width) */}
      <FormControl sx={{ width: "83%" }} error={!!formErrors.venueId}>
        <InputLabel id="venue-select-label">Venue</InputLabel>
        <Select
          labelId="venue-select-label"
          label="Venue"
          value={editForm.venueId}
          onChange={handleEditChange("venueId")}
          fullWidth
          sx={{ minWidth: 0 }}
        >
          <MenuItem value="">Select venue</MenuItem>
          {Venues.map((v) => {
            const id = v._id ?? v.id;
            const name = v.name ?? id;
            return (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            );
          })}
        </Select>
        {formErrors.venueId && <FormHelperText>{formErrors.venueId}</FormHelperText>}
      </FormControl>

      {/* Ambient operator + value inline */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth sx={{ minWidth: { xs: "100%", sm: 90 } }}>
            <InputLabel id="ambient-op-label">Ambient op</InputLabel>
            <Select
              labelId="ambient-op-label"
              value={editForm.ambientOp}
              label="Ambient op"
              onChange={handleEditChange("ambientOp")}
              fullWidth
            >
              <MenuItem value=">=">&ge;</MenuItem>
              <MenuItem value="<=">&le;</MenuItem>
              <MenuItem value=">">&gt;</MenuItem>
              <MenuItem value="<">&lt;</MenuItem>
              <MenuItem value="==">==</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={9}>
          <TextField
            label="Ambient value"
            type="number"
            inputProps={{ step: 0.1 }}
            value={editForm.ambientVal}
            onChange={handleEditChange("ambientVal")}
            fullWidth
            error={!!formErrors.ambientVal}
            helperText={formErrors.ambientVal}
          />
        </Grid>
      </Grid>

      {/* Freezer operator + value inline */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth sx={{ minWidth: { xs: "100%", sm: 90 } }}>
            <InputLabel id="freezer-op-label">Freezer op</InputLabel>
            <Select
              labelId="freezer-op-label"
              value={editForm.freezerOp}
              label="Freezer op"
              onChange={handleEditChange("freezerOp")}
              fullWidth
            >
              <MenuItem value=">=">&ge;</MenuItem>
              <MenuItem value="<=">&le;</MenuItem>
              <MenuItem value=">">&gt;</MenuItem>
              <MenuItem value="<">&lt;</MenuItem>
              <MenuItem value="==">==</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={9}>
          <TextField
            label="Freezer value"
            type="number"
            inputProps={{ step: 0.1 }}
            value={editForm.freezerVal}
            onChange={handleEditChange("freezerVal")}
            fullWidth
            error={!!formErrors.freezerVal}
            helperText={formErrors.freezerVal}
          />
        </Grid>
      </Grid>

    </Stack>
  </DialogContent>

  <DialogActions sx={{ px: 3, py: 2 }}>
    <Button onClick={handleEditCancel} disabled={working}>Cancel</Button>
    <Button
      variant="contained"
      onClick={handleEditSave}
      disabled={working}
      endIcon={working ? <CircularProgress size={18} /> : null}
    >
      Save
    </Button>
  </DialogActions>
</Dialog>

      {/* Delete confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete {deleteTarget.name ? `"${deleteTarget.name}"` : "device"}?</DialogTitle>
        <DialogContent dividers>
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={working}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={working}
            endIcon={working ? <CircularProgress size={18} /> : null}
          >
            Yes, delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DeviceList;
