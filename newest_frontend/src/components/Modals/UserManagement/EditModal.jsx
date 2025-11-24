// // src/components/Modals/UserManagement/EditModal.jsx
// import * as React from "react";
// import {
//   Box,
//   Button,
//   Typography,
//   Modal,
//   Stack,
//   MenuItem,
//   TextField,
// } from "@mui/material";
// import { Lock, Mail, User2 } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import InputField from "../../Inputs/InputField";
// import PasswordField from "../../Inputs/PasswordField";
// import Swal from "sweetalert2";
// import {
//   fetchAllManagers,
//   UpdateManager,
//   setManagerEditModalOpen,
// } from "../../../slices/ManagerSlice";
// import { fetchAllOrganizations } from "../../../slices/OrganizationSlice";
// import { useStore } from "../../../contexts/storecontexts";
// import { useNavigate } from "react-router";
// import './EditModalStyle.css'
// const style = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: 500,
//   bgcolor: "background.paper",
//   borderRadius: "8px",
//   boxShadow: 24,
//   p: 4,
// };

// export default function UserEditModal({ handleClose, id }) {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { User } = useStore();

//   const { ManagerEditModalOpen, Managers, isLoading } = useSelector(
//     (s) => s.Manager || {}
//   );
//   const { Organizations = [] } = useSelector(
//     (s) => s.Organization || {}
//   );

//   const [formData, setFormData] = React.useState({
//     id: null,
//     name: "",
//     current_email: "",
//     updated_email: "",
//     updated_password: "",
//     organizationId: "",
//   });

//   // Ensure organizations are loaded
//   React.useEffect(() => {
//     dispatch(fetchAllOrganizations());
//   }, [dispatch]);

//   // Populate form from Managers redux state. If manager not found, fetch managers.
//   React.useEffect(() => {
//     if (!ManagerEditModalOpen || !id) return;

//     const mgr = (Managers || []).find((m) => String(m._id) === String(id));
//     if (mgr) {
//       // organization might be populated object or id
//       const orgId =
//         mgr.organization && typeof mgr.organization === "object"
//           ? mgr.organization._id || mgr.organization.id
//           : mgr.organization || "";


//       setFormData({
//         id: mgr._id,
//         name: mgr.name || "",
//         current_email: mgr.email || "",
//         updated_email: "",
//         updated_password: "",
//         organizationId: orgId,
//       });
//     } else {
//       // fallback: fetch managers and let the effect re-run when Managers updates
//       dispatch(fetchAllManagers()).catch(() => {});
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [ManagerEditModalOpen, id, Managers]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({ ...p, [name]: value }));
//   };

//   const closeModal = () => {
//     dispatch(setManagerEditModalOpen(false));
//     handleClose && handleClose();
//   };

//   const handleUpdate = async () => {
//     // basic validation
//     if (!formData.name || !formData.organizationId) {
//       return Swal.fire({
//         icon: "warning",
//         title: "Missing fields",
//         text: "Name and Organization are required.",
//       });
//     }

//     // If password provided, you may optionally add more validation here (length/complexity).
//     try {
//       const payload = {
//         id: formData.id,
//         name: formData.name,
//         // only include optional fields if they were filled
//         email: formData.updated_email !== "" ? formData.updated_email : undefined,
//         password:
//           formData.updated_password && formData.updated_password.length > 0
//             ? formData.updated_password
//             : undefined,
//         organization: formData.organizationId,
//       };

//       const updated = await dispatch(UpdateManager(payload)).unwrap();

//       Swal.fire({
//         icon: "success",
//         title: "Updated",
//         text: "User updated successfully.",
//       });

//       // close modal
//       closeModal();

//       // If admin updated themself (by id or current_email), force logout so tokens/session refresh
//       if (User && (String(User._id) === String(updated._id) || User.email === formData.current_email)) {
//         navigate("/logout");
//         return;
//       }

//       // No manual page refresh required — reducer replaced the user in Managers.
//       // If you want to be extra safe, you may re-fetch:
//       // dispatch(fetchAllManagers());
//     } catch (err) {
//       const message = err || "Failed to update user";
//       Swal.fire({
//         icon: "error",
//         title: "Update failed",
//         text: message,
//         customClass: { container: "swal2-topmost" },
//       });
//     }
//   };

//   return (
//     <Modal
//       open={!!ManagerEditModalOpen}
//       onClose={() => { closeModal(); }}
//     >
//       <Box sx={style}>
//         <Typography variant="h6" fontWeight="bold" mb={2}>
//           Edit User
//         </Typography>

//         <InputField
//           label="Current Email"
//           id="Current_Email"
//           name="current_email"
//           type="email"
//           value={formData.current_email}
//           disabled={true}
//           placeholder="Current Email"
//           icon={<Mail size={18} className="text-gray-400" />}
//         />

//         <InputField
//           label="Name"
//           id="name"
//           name="name"
//           type="text"
//           value={formData.name}
//           onchange={handleChange}
//           placeholder="Full name"
//           icon={<User2 size={18} className="text-gray-400" />}
//         />

//         <InputField
//           label="Updated Email (optional)"
//           id="Updated_Email"
//           name="updated_email"
//           type="email"
//           value={formData.updated_email}
//           onchange={handleChange}
//           placeholder="Enter updated email (leave blank to keep)"
//           icon={<Mail size={18} className="text-gray-400" />}
//         />

//         <PasswordField
//           label="New Password (optional)"
//           id="password"
//           name="updated_password"
//           value={formData.updated_password}
//           onchange={handleChange}
//           placeholder="Enter new password (leave blank to keep)"
//           icon={<Lock size={18} className="text-gray-400"/>}
//         />

//         <TextField
//           select
//           fullWidth
//           label="Organization"
//           name="organizationId"
//           value={formData.organizationId || ""}
//           onChange={handleChange}
//           sx={{ mt: 2 }}
//         >
//           <MenuItem value="">Select Organization</MenuItem>
//           {(Organizations || []).map((org) => (
//             <MenuItem key={org._id || org.id} value={org._id || org.id}>
//               {org.name}
//             </MenuItem>
//           ))}
//         </TextField>

//         <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
//           <Button onClick={closeModal} variant="outlined" disabled={isLoading}>
//             Cancel
//           </Button>
//           <Button onClick={handleUpdate} variant="contained" color="primary" disabled={isLoading}>
//             {isLoading ? "Updating..." : "Update"}
//           </Button>
//         </Stack>
//       </Box>
//     </Modal>
//   );
// }







// src/components/Modals/UserManagement/EditModal.jsx
import * as React from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  Stack,
  MenuItem,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Lock, Mail, User2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import InputField from "../../Inputs/InputField";
import PasswordField from "../../Inputs/PasswordField";
import Swal from "sweetalert2";
import {
  fetchAllManagers,
  UpdateManager,
  setManagerEditModalOpen,
} from "../../../slices/ManagerSlice";
import { fetchAllOrganizations } from "../../../slices/OrganizationSlice";
import { useStore } from "../../../contexts/storecontexts";
import { useNavigate } from "react-router";
import './EditModalStyle.css'

export default function UserEditModal({ handleClose, id }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { User } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { ManagerEditModalOpen, Managers, isLoading } = useSelector(
    (s) => s.Manager || {}
  );
  const { Organizations = [] } = useSelector(
    (s) => s.Organization || {}
  );

  const [formData, setFormData] = React.useState({
    id: null,
    name: "",
    current_email: "",
    updated_email: "",
    updated_password: "",
    organizationId: "",
  });

  React.useEffect(() => {
    dispatch(fetchAllOrganizations());
  }, [dispatch]);

  React.useEffect(() => {
    if (!ManagerEditModalOpen || !id) return;
    const mgr = (Managers || []).find((m) => String(m._id) === String(id));
    if (mgr) {
      const orgId =
        mgr.organization && typeof mgr.organization === "object"
          ? mgr.organization._id || mgr.organization.id
          : mgr.organization || "";

      setFormData({
        id: mgr._id,
        name: mgr.name || "",
        current_email: mgr.email || "",
        updated_email: "",
        updated_password: "",
        organizationId: orgId,
      });
    } else {
      dispatch(fetchAllManagers()).catch(() => {});
    }
  }, [ManagerEditModalOpen, id, Managers, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const closeModal = () => {
    dispatch(setManagerEditModalOpen(false));
    handleClose && handleClose();
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.organizationId) {
      return Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Name and Organization are required.",
      });
    }

    try {
      const payload = {
        id: formData.id,
        name: formData.name,
        email: formData.updated_email !== "" ? formData.updated_email : undefined,
        password:
          formData.updated_password && formData.updated_password.length > 0
            ? formData.updated_password
            : undefined,
        organization: formData.organizationId,
      };

      const updated = await dispatch(UpdateManager(payload)).unwrap();

      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "User updated successfully.",
      });

      closeModal();

      if (User && (String(User._id) === String(updated._id) || User.email === formData.current_email)) {
        navigate("/logout");
        return;
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err || "Failed to update user",
        customClass: { container: "swal2-topmost" },
      });
    }
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? "90%" : 500,
    maxWidth: 500,
    bgcolor: "background.paper",
    borderRadius: "8px",
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal
      open={!!ManagerEditModalOpen}
      onClose={closeModal}
    >
      <Box sx={modalStyle}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Edit User
        </Typography>
    <Stack spacing={2}>
        <InputField
          label="Current Email"
          id="Current_Email"
          name="current_email"
          type="email"
          value={formData.current_email}
          disabled={true}
          placeholder="Current Email"
          icon={<Mail size={18} className="text-gray-400" />}
        />

        <InputField
          label="Name"
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onchange={handleChange}
          placeholder="Full name"
          icon={<User2 size={18} className="text-gray-400" />}
        />

        <InputField
          label="Updated Email (optional)"
          id="Updated_Email"
          name="updated_email"
          type="email"
          value={formData.updated_email}
          onchange={handleChange}
          placeholder="Enter updated email (leave blank to keep)"
          icon={<Mail size={18} className="text-gray-400" />}
        />

        <PasswordField
          label="New Password (optional)"
          id="password"
          name="updated_password"
          value={formData.updated_password}
          onchange={handleChange}
          placeholder="Enter new password (leave blank to keep)"
          icon={<Lock size={18} className="text-gray-400"/>}
        />

        <TextField
          select
          fullWidth
          label="Organization"
          name="organizationId"
          value={formData.organizationId || ""}
          onChange={handleChange}
          sx={{ mt: 2 }}
        >
          <MenuItem value="">Select Organization</MenuItem>
          {(Organizations || []).map((org) => (
            <MenuItem key={org._id || org.id} value={org._id || org.id}>
              {org.name}
            </MenuItem>
          ))}
        </TextField>
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
          <Button onClick={closeModal} variant="outlined" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} variant="contained" color="primary" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
