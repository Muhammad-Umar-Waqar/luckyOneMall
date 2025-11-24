// import * as React from 'react';
// import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
// import Typography from '@mui/material/Typography';
// import Modal from '@mui/material/Modal';
// import Stack from '@mui/material/Stack';
// import InputField from '../../Inputs/InputField';
// import { useSelector } from 'react-redux';

// const style = {
//   position: 'absolute',
//   top: '50%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   width: 400,
//   bgcolor: 'background.paper',
//   borderRadius: '8px',
//   boxShadow: 24,
//   p: 4,
// };

// export default function ManagerDeleteModal({  handleClose, handleDelete, ManagerEmail }) {
//  const {ManagerDeleteModalOpen}=useSelector((state)=>state.Manager)
//   return (
//     <Modal
//       open={ManagerDeleteModalOpen}
//       onClose={handleClose}
//       aria-labelledby="delete-org-title"
//       aria-describedby="delete-org-description"
//     >
//       <Box sx={style}>
//         <Typography id="delete-org-title" variant="h6" fontWeight="bold" mb={2}>
//           Are you sure you want to delete this manager?
//         </Typography>

//        <InputField
//           label="Manager Email"
//           id="email"
//           name="email"
//           type="email"
//           value={ManagerEmail}
        
//           placeholder="Manager Email"
//           icon={<Box size={18} className="text-gray-400" />}
//         />

//         <Stack direction="row" spacing={2} justifyContent="flex-end">
//           <Button onClick={handleClose} variant="outlined">
//             Cancel
//           </Button>
//           <Button onClick={handleDelete} variant="contained" color="error">
//             Delete
//           </Button>
//         </Stack>
//       </Box>
//     </Modal>
//   );
// }



import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import InputField from '../../Inputs/InputField';
import { useSelector } from 'react-redux';
import { useTheme, useMediaQuery } from '@mui/material';

export default function ManagerDeleteModal({ handleClose, handleDelete, ManagerEmail }) {
  const { ManagerDeleteModalOpen } = useSelector((state) => state.Manager);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // small screens

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: isMobile ? '90%' : 400, // responsive width
    maxWidth: 400,
    bgcolor: 'background.paper',
    borderRadius: '8px',
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal
      open={ManagerDeleteModalOpen}
      onClose={handleClose}
      aria-labelledby="delete-org-title"
      aria-describedby="delete-org-description"
    >
      <Box sx={modalStyle}>
        <Typography id="delete-org-title" variant="h6" fontWeight="bold" mb={2}>
          Are you sure you want to delete this manager?
        </Typography>

        <InputField
          label="Manager Email"
          id="email"
          name="email"
          type="email"
          value={ManagerEmail}
          disabled={true} // make it readonly
          placeholder="Manager Email"
          icon={<Box size={18} className="text-gray-400" />}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
          <Button onClick={handleClose} variant="outlined" fullWidth={isMobile}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" fullWidth={isMobile}>
            Delete
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
