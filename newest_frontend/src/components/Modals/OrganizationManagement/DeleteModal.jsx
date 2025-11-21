import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import InputField from '../../Inputs/InputField';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: '8px',
  boxShadow: 24,
  p: 4,
};

export default function OrganizationDeleteModal({ open, handleClose, handleDelete, organizationName,organizationId }) {
 
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="delete-org-title"
      aria-describedby="delete-org-description"
    >
      <Box sx={style}>
        <Typography id="delete-org-title" variant="h6" fontWeight="bold" mb={2}>
          Confirm Delete
        </Typography>

       <InputField
          label="Organization Name"
          id="organization_name"
          name="organization_name"
          type="text"
          value={organizationName}
        
          placeholder="Organization Name"
          icon={<Box size={18} className="text-gray-400" />}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={()=>handleDelete(organizationId)} variant="contained" color="error">
            Delete
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
