// // src/components/Modals/UserManagement/DeleteModal.jsx
// import * as React from "react";
// import Box from "@mui/material/Box";
// import Button from "@mui/material/Button";
// import Typography from "@mui/material/Typography";
// import Modal from "@mui/material/Modal";
// import InputField from "../../Inputs/InputField";
// import { useSelector } from "react-redux";

// const style = { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, bgcolor: "background.paper", borderRadius: "8px", boxShadow: 24, p: 4 };

// export default function UserDeleteModal({ handleClose, handleDelete, userEmail }) {
//   const { ManagerDeleteModalOpen } = useSelector((state) => state.Manager);
//   return (
//     <Modal open={ManagerDeleteModalOpen} onClose={handleClose} aria-labelledby="delete-user-title">
//       <Box sx={style}>
//         <Typography id="delete-user-title" variant="h6" fontWeight="bold" mb={2}>Are you sure you want to delete this user?</Typography>

//         <InputField label="User Email" id="email" name="email" type="email" value={userEmail} placeholder="User Email" disabled />

//         <div className="flex justify-end gap-2 mt-4">
//           <Button onClick={handleClose} variant="outlined">Cancel</Button>
//           <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
//         </div>
//       </Box>
//     </Modal>
//   );
// }





import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import InputField from "../../Inputs/InputField";
import { useSelector } from "react-redux";
import { useTheme, useMediaQuery } from "@mui/material";

export default function UserDeleteModal({ handleClose, handleDelete, userEmail }) {
  const { ManagerDeleteModalOpen } = useSelector((state) => state.Manager);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? "90%" : 400,
    maxWidth: 400,
    bgcolor: "background.paper",
    borderRadius: "8px",
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal open={ManagerDeleteModalOpen} onClose={handleClose} aria-labelledby="delete-user-title">
      <Box sx={modalStyle}>
        <Typography id="delete-user-title" variant="h6" fontWeight="bold" mb={2}>
          Are you sure you want to delete this user?
        </Typography>

        <InputField
          label="User Email"
          id="email"
          name="email"
          type="email"
          value={userEmail}
          placeholder="User Email"
          disabled
        />

        <Box mt={3} display="flex" gap={2} justifyContent="flex-end" flexDirection={isMobile ? "column" : "row"}>
          <Button onClick={handleClose} variant="outlined" fullWidth={isMobile}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" fullWidth={isMobile}>
            Delete
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
