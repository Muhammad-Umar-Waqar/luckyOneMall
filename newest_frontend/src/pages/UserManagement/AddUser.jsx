// src/pages/UserManagement/AddUser.jsx
import { Lock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import InputField from "../../components/Inputs/InputField";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrganizations } from "../../slices/OrganizationSlice";
import { fetchAllManagers } from "../../slices/ManagerSlice";
import "../../styles/pages/management-pages.css";
import { User } from "lucide-react";
import Swal from "sweetalert2";
// import { Building } from "lucide-react"; // add this with your icons
import { FormControl, Select, MenuItem } from "@mui/material";



const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050";

const AddUser = () => {
  const [formData, setFormData] = useState({ name: "", email: "", organization: "" });
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const { Organizations = [] } = useSelector((state) => state.Organization || { Organizations: [] });

  const SELECT_HEIGHT = 48;
const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 4;

const menuProps = {
  PaperProps: {
    sx: {
      maxHeight: ITEM_HEIGHT * VISIBLE_ITEMS,
      mt: 1,
    },
  },
  MenuListProps: {
    disablePadding: true,
  },
};



  useEffect(() => {
    // thunk reads token from localStorage; no need to pass token here
    dispatch(fetchAllOrganizations());
  }, [dispatch]);

  const onchange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const [loading, setLoading] = useState(false);

  const onsubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.organization) {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Email and organization are required",
      });
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE}/auth/register`, {
        method: "POST",
        credentials: "include", // include cookies if backend sets httpOnly cookie
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // if you also use header auth
        },
        body: JSON.stringify({
          email: formData.email,
          role: "user",
          organizationId: formData.organization,
          name: formData.name || formData.email.split("@")[0],
        }),
      });

      // try to parse json, but avoid throw if body empty
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // Expecting 201 Created with message
        Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message || "User created successfully",
        });

        // Clear form
        setFormData({ name: "", email: "", organization: "" });

        // Refresh the users list so UI updates immediately
        dispatch(fetchAllManagers());
      } else {
        // Show server-provided message (helps debugging)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || `Error creating user (status ${res.status})`,
        });
        console.error("Create user failed:", res.status, data);
      }
    } catch (err) {
      console.error("Network / unexpected error:", err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong while creating the user",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="AddingPage user-add-container rounded-xl shadow-sm w-full flex flex-col justify-center bg-[#EEF3F9] border border-[#E5E7EB]">
      <h2 className="user-add-title font-semibold mb-1 text-center">Add User</h2>
      <p className="user-add-subtitle text-gray-500 mb-6 text-center">Welcome back! Select method to add user</p>
      <form onSubmit={onsubmit}>
        <div className="user-add-form space-y-4 max-w-sm mx-auto w-full">
          <InputField
            type="text"
            name="name"
            placeholder="Name"
            onchange={onchange}
            value={formData.name}
            label={"Name"}
            icon={<User />}
          />
          <InputField
            type="email"
            name="email"
            placeholder="Email"
            onchange={onchange}
            value={formData.email}
            label={"Email"}
            icon={<Mail />}
          />

         <label className="block text-sm font-medium mb-1">Select Organization</label>

{/* wrap only the select area so absolute positioning is relative to the select */}
<div className="relative">
  {/* icon centered vertically relative to the select input */}
  <img
    src="/OrganizationChecklist.svg"
    alt="org icon"
    className="absolute left-3 top-1/2 -translate-y-1/2 z-30 h-[25px] w-[25px] pointer-events-none"
  />

  <FormControl fullWidth>
    <Select
      displayEmpty
      value={formData.organization}
      onChange={onchange}
      inputProps={{ name: "organization" }}
      MenuProps={menuProps}
      renderValue={(selected) => {
        if (!selected) return <span className="text-gray-500">Select Organization</span>;
        const org = Organizations.find((o) => (o._id ?? o.id) === selected);
        return org?.name ?? selected;
      }}
      sx={{
        pl: "1.5rem",
        height: SELECT_HEIGHT,
        backgroundColor: "white",
        borderRadius: "0.375rem",
      }}
    >
      {(Organizations || []).length === 0 ? (
        <MenuItem disabled sx={{ height: ITEM_HEIGHT }}>
          No organizations found
        </MenuItem>
      ) : (
        Organizations.map((org) => {
          const id = org._id ?? org.id;
          return (
            <MenuItem
              key={id}
              value={id}
              sx={{
                height: ITEM_HEIGHT,
                display: "flex",
                alignItems: "center",
              }}
            >
              {org.name}
            </MenuItem>
          );
        })
      )}
    </Select>
  </FormControl>
</div>



        </div>

        <div className="max-w-sm mx-auto w-full">
          <button
            type="submit"
            disabled={loading}
            className={`mt-6 bg-blue-600 text-white px-6 py-2 rounded-md w-full cursor-pointer ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Creating..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
