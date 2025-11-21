// src/components/Modals/OrganizationManagement/EditModal.jsx
import React from "react";
import { Box, Button, Typography, Modal, Stack } from "@mui/material";
import InputField from "../../Inputs/InputField";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
};

export default function OrganizationEditModal({
  open,
  handleClose,
  organizationName = "",
  handleEdit,
  organizationId,
}) {
  const [orgName, setOrgName] = React.useState(organizationName || "");

  // Sync when modal opens or organizationName changes
  React.useEffect(() => {
    if (open) setOrgName(organizationName || "");
  }, [open, organizationName]);

  const onUpdate = () => {
    const trimmed = (orgName || "").trim();
    if (!trimmed) {
      // optionally show a nicer toast
      return;
    }
    handleEdit && handleEdit(organizationId, trimmed);
  };

  return (
    <Modal open={!!open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Edit Organization
        </Typography>

        <InputField
          label="Organization Name"
          id="organization_name"
          name="organization_name"
          type="text"
          value={orgName}
          onchange={(e) => setOrgName(e.target.value)}
          placeholder="Organization Name"
          icon={<Box size={18} className="text-gray-400" />}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={onUpdate} variant="contained" color="primary">
            Update
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}


