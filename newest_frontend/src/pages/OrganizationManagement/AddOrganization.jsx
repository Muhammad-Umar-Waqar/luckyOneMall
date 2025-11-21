// src/pages/Organization/AddOrganization.jsx
import { Tag, Box } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import InputField from "../../components/Inputs/InputField";
import Swal from "sweetalert2";
import { createOrganization, fetchAllOrganizations } from "../../slices/OrganizationSlice";
import "../../styles/pages/management-pages.css";
import { useStore } from "../../contexts/storecontexts";

const AddOrganization = () => {
  const {user}  = useStore()
  const [formData, setFormData] = useState({
    organization_name: ""
  });
  const dispatch = useDispatch();
  const { isLoading } = useSelector((s) => s.Organization || { isLoading: false });



  const onchange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = (formData.organization_name || "").trim();
    if (!name) {
      Swal.fire({ icon: "warning", title: "Missing field", text: "Organization name is required." });
      return;
    }

    try {
      // create organization via thunk (thunk reads token from localStorage)
      const created = await dispatch(createOrganization(name)).unwrap();

      Swal.fire({
        icon: "success",
        title: "Organization created",
        text: `Organization "${created?.name || name}" added successfully.`,
      });

      // Clear form
      setFormData({ organization_name: ""});

      // Optional: refresh full list to ensure consistent state
      dispatch(fetchAllOrganizations());
      
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Create failed",
        text: err || "Unable to create organization.",
      });
      console.error("create organization error:", err);
    }
  };

  return (
    <div className="AddingPage organization-add-container rounded-xl shadow-sm w-full flex flex-col justify-center bg-[#EEF3F9] border border-[#E5E7EB]">
      <h2 className="organization-add-title font-semibold mb-1 text-center">Add Organization</h2>
      <p className="organization-add-subtitle text-gray-500 mb-6 text-center">
        Welcome back! Select method to add organization
      </p>

      <div className="organization-add-form space-y-4 max-w-sm mx-auto w-full">
        <InputField
          id="organization_name"
          name="organization_name"
          label="Organization Name"
          type="text"
          value={formData.organization_name}
          onchange={onchange}
          placeholder="Organization Name"
          icon={<Box size={20} />}
        />

        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading}
          className={`w-full bg-[#1E64D9] hover:bg-[#1557C7] text-white font-semibold py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default AddOrganization;
