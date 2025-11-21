import * as React from 'react';
import {
  Box,
  Button,
  Typography,
  Modal,
  Stack,
} from '@mui/material';
import { Lock, Mail } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import InputField from '../../Inputs/InputField';
import PasswordField from '../../Inputs/PasswordField';
import Swal from 'sweetalert2';
import { fetchAllManagers, setManagerEditModalOpen } from '../../../slices/ManagerSlice';
import { useStore } from '../../../contexts/storecontexts';
import { useNavigate } from 'react-router';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  borderRadius: '8px',
  boxShadow: 24,
  p: 4,
};

export default function ManagerEditModal({ handleClose,id }) {
  const dispatch = useDispatch();
 const [FormData, setFormData] = React.useState({id:null,current_email:"",updated_email:"",updated_password:""})
 const {User}=useStore()
 const navigate=useNavigate()
 const token=localStorage.getItem('token')

 
const {ManagerEditModalOpen}=useSelector((state)=>state.Manager)

//   Fetch specific organization when modal opens

  const fetchSpecificManager = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API}/user/fetch/specific/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
          'Authorization':`Bearer ${token}`
         },
       
      });
     const data=await res.json()
     setFormData({...FormData,id:data.manager.id,current_email:data.manager.email})
     
    } catch (err) {
      console.error('Failed to fetch specific manager', err);
    }
  };

React.useEffect(()=>{
    if(ManagerEditModalOpen){
    fetchSpecificManager()
    }
},[ManagerEditModalOpen])

const handleChange=(e)=>{
    const {name,value}=e.target;
    setFormData({...FormData,[name]:value})
}

const handleEdit=async()=>{
    try {
         const response=await fetch(`${import.meta.env.VITE_BACKEND_API}/user/update/`,{
        method:'POST',
        body:JSON.stringify(FormData),
        headers:{
            'Content-Type':'application/json',
             'Authorization':`Bearer ${token}`
        }
    })
    const data=await response.json()
 if(data.status==200){
     dispatch(setManagerEditModalOpen(false))
    Swal.fire(data.message,'success')
    if(FormData.current_email==User.email){
      navigate('/logout')
    }

   
    dispatch(fetchAllManagers())
 }
 else{
   Swal.fire({
  title: 'Error',
  text: data.message,
  icon: 'error',
  customClass: {
    popup: 'zindex-fix'
  }
});
 }
    
    } catch (error) {
        Swal.fire({
  title: 'Error',
  text: 'Internal Server Error',
  icon: 'error',
  customClass: {
    popup: 'zindex-fix'
  }
});
        
        
    }
   
    
}
 

 
  return (
    <Modal open={ManagerEditModalOpen} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Edit Manager
        </Typography>

        <InputField
          label="Current Email"
          id="Current_Email"
          name="current_email"
          type="email"
          value={FormData.current_email}
         disabled={true}
          placeholder="Organization Name"
          icon={<Mail size={18} className="text-gray-400" />}
        />
         <InputField
          label="Updated Email"
          id="Updated_Email"
          name="updated_email"
          type="email"
           value={FormData.updated_email}
         onchange={handleChange}
          placeholder="Enter updated_email"
          icon={<Mail size={18} className="text-gray-400" />}
        />
         <PasswordField
  label="password"
  id="password"
  name="updated_password"
   value={FormData.updated_password}
   onchange={handleChange}
  placeholder=" password"
  icon={<Lock/>}
/>

       
      

        {/* Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
        <Button
   onClick={handleEdit}
  variant="contained"
  color="primary"
>
  Update
</Button>

        </Stack>
      </Box>
    </Modal>
  );
}
