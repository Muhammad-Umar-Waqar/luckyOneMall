// src/pages/management/AddVenue.jsx
import React, { useState, useEffect } from "react";
import { Box } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import InputField from "../../components/Inputs/InputField";
import { createVenue, fetchAllVenues } from "../../slices/VenueSlice";
import { fetchAllOrganizations } from "../../slices/OrganizationSlice"; // ensure OrganizationSlice exists
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";



import "../../styles/pages/management-pages.css";

const AddVenue = () => {
  const [form, setForm] = useState({ name: "", organization: "" });
  const dispatch = useDispatch();
  const { isLoading } = useSelector((s) => s.Venue || { isLoading: false });
  const { Organizations } = useSelector((s) => s.Organization || { Organizations: [] });


  // constants (put near top of component)
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
    // ensure organizations are loaded for the select dropdown
    if (!Organizations || Organizations.length === 0) {
      dispatch(fetchAllOrganizations());
    }
  }, [dispatch]);

  const onchange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleVenue = async (e) => {
    e.preventDefault();
    const name = (form.name || "").trim();
    const organization = form.organization;

    if (!name || !organization) {
      return Swal.fire({ icon: "warning", title: "Missing field", text: "Name and organization are required." });
    }

    try {
      const created = await dispatch(createVenue({ name, organization })).unwrap();
      Swal.fire({ icon: "success", title: "Created", text: `Venue "${created.name}" created.` });
      setForm({ name: "", organization: "" });
      // refresh list
      dispatch(fetchAllVenues());
    } catch (err) {
      Swal.fire({ icon: "error", title: "Create failed", text: err || "Unable to create venue." });
      console.error("create venue error:", err);
    }
  };

  return (
    <div className="AddingPage venue-add-container rounded-xl shadow-sm w-full flex flex-col justify-center bg-[#EEF3F9] border border-[#E5E7EB]">
      <h2 className="venue-add-title font-semibold mb-1 text-center">Add Venues</h2>
      <p className="venue-add-subtitle text-gray-500 mb-6 text-center">Welcome back! Select method to add venue</p>

      <form className="space-y-4 max-w-sm mx-auto w-full" onSubmit={handleVenue}>
        <div className="relative bg-white">
          <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            name="name"
            placeholder="Enter venue name"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.name}
            onChange={onchange}
          />
        </div>

        <div>
   
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
          value={form.organization}
          onChange={onchange}
          inputProps={{ name: "organization" }}
          MenuProps={menuProps}
          renderValue={(selected) => {
            if (!selected) return <span className="text-gray-500">Select Organization</span>;
            const org = Organizations?.find((o) => (o._id ?? o.id) === selected);
            return org?.name ?? selected;
          }}
          sx={{
            pl: "1.5rem",               // space for the icon
            height: `${SELECT_HEIGHT}px`,
            backgroundColor: "white",
            borderRadius: "0.375rem",
          }}
        >
          {(Organizations || []).length === 0 ? (
            <MenuItem disabled sx={{ height: ITEM_HEIGHT }}>
              No organizations found
            </MenuItem>
          ) : (
            (Organizations || []).map((org) => {
              const id = org._id ?? org.id;
              return (
                <MenuItem key={id} value={id} sx={{ height: ITEM_HEIGHT }}>
                  {org.name}
                </MenuItem>
              );
            })
          )}
        </Select>
      </FormControl>
    </div>
        </div>

        <button
          type="submit"
          className={`w-full bg-[#1E64D9] hover:bg-[#1557C7] text-white font-semibold py-2.5 px-4 rounded-md transition duration-300 shadow-md ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
};

export default AddVenue;
