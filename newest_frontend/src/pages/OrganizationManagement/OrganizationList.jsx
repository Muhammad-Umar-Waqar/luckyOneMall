// src/pages/management/OrganizationList.jsx
import { Pencil, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  fetchAllOrganizations,
  updateOrganization,
  deleteOrganization,
} from "../../slices/OrganizationSlice";
import OrganizationDeleteModal from "../../components/Modals/OrganizationManagement/DeleteModal";
import OrganizationEditModal from "../../components/Modals/OrganizationManagement/EditModal";

import "../../styles/pages/management-pages.css";
import TableSkeleton from "../../components/skeletons/TableSkeleton";

const OrganizationList = ({ onOrganizationSelect, selectedOrganization }) => {
  const dispatch = useDispatch();
  const { Organizations, isLoading, error } = useSelector((state) => state.Organization || {});

  const [DeleteOpen, setDeleteOpen] = useState(false);
  const [EditOpen, setEditOpen] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [OrganizationId, setOrganizationId] = useState(null);

  useEffect(() => {
    dispatch(fetchAllOrganizations());
  }, [dispatch]);

  useEffect(() => {
    if (error) console.error("Organization error:", error);
  }, [error]);

  const handleDeleteOpen = (name, id) => {
    setDeleteOpen(true);
    setOrganizationName(name);
    setOrganizationId(id);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setOrganizationId(null);
    setOrganizationName("");
  };
  const handleEditOpen = (name, id) => {
    setEditOpen(true);
    setOrganizationId(id);
    setOrganizationName(name);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setOrganizationId(null);
    setOrganizationName("");
  };

  const handleChange = (e) => {
    setOrganizationName(e.target.value);
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteOrganization(id)).unwrap();
      Swal.fire({ icon: "success", title: "Deleted", text: "Organization deleted." });
      handleDeleteClose();
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire({ icon: "error", title: "Delete failed", text: err || "Something went wrong" });
    }
  };

  // Update receives (orgId, newName)
  const handleEdit = async (orgId, newName) => {
    try {
      await dispatch(updateOrganization({ id: orgId, name: newName })).unwrap();
      Swal.fire({ icon: "success", title: "Updated", text: "Organization updated." });
      handleEditClose();
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire({ icon: "error", title: "Update failed", text: err || "Something went wrong" });
    }
  };

  const displayOrganizations = Array.isArray(Organizations) ? Organizations : [];

  const handleRowClick = (organization, e) => {
    e.stopPropagation();
    onOrganizationSelect?.(organization);
  };

  return (
    <>
      <div className="ListPage organization-list-container bg-white rounded-xl shadow-sm w-full h-full border border-[#E5E7EB]">
        <h1 className="organization-list-title font-semibold text-gray-800 mb-4">Organization Management</h1>
        <div className="mb-4">
          <h2 className="organization-list-header text-center font-semibold text-gray-800">Organization List</h2>
          <div className="mx-auto mt-2 h-px w-4/5 bg-[#2563EB]/40"></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="organization-table-header py-2 px-4 font-bold text-gray-800">Organization Name</th>
                <th className="organization-table-header py-2 px-4 text-center">Actions</th>
              </tr>
            </thead>
          </table>

          <div className="organization-table-scroll overflow-y-auto pr-1 h-[58vh]">
            <table className="w-full table-auto text-left">
              <tbody>
                  {isLoading && <TableSkeleton rows={6} />}


            {!isLoading && displayOrganizations.length === 0 && (
              <tr><td className="p-4">No organizations found.</td></tr>
            )}

                {!isLoading && displayOrganizations.map((org, index) => {
                  const id = org._id ?? org.id ?? index;
                  const displayName = org.name ?? org.organization_name ?? `Organization ${index + 1}`;

                  return (
                    <tr
                      key={id}
                      className={`border-b border-gray-200 cursor-pointer transition-colors hover:bg-blue-50/60 ${
                        (selectedOrganization?._id === id || selectedOrganization?.id === id) ? "bg-blue-50 border-blue-300" : ""
                      }`}
                      onClick={(e) => handleRowClick(org, e)}
                    >
                      <td className="organization-table-cell py-2 sm:py-3 px-2 sm:px-4">{index + 1}. {displayName}</td>
                      <td className="organization-table-cell py-2 sm:py-3 px-2 sm:px-4">
                        <div className="flex justify-center gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleEditOpen(displayName, id)} className="organization-action-btn rounded-full border border-green-500/50 bg-white flex items-center justify-center hover:bg-green-50 cursor-pointer">
                            <Pencil className="text-green-600 organization-action-icon" />
                          </button>
                          <button onClick={() => handleDeleteOpen(displayName, id)} className="organization-action-btn rounded-full border border-red-500/50 bg-white flex items-center justify-center hover:bg-red-50 cursor-pointer">
                            <Trash className="text-red-600 organization-action-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!isLoading && displayOrganizations.length === 0 && (
                  <tr><td className="p-4">No organizations found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {DeleteOpen && (
        <OrganizationDeleteModal
          open={DeleteOpen}
          handleClose={handleDeleteClose}
          handleDelete={() => handleDelete(OrganizationId)}
          organizationId={OrganizationId}
          organizationName={organizationName}
        />
      )}

      {EditOpen && (
        <OrganizationEditModal
          open={EditOpen}
          handleClose={handleEditClose}
          handleEdit={handleEdit}                      // <-- pass full handler
          organizationId={OrganizationId}
          organizationName={organizationName}
        />
      )}
    </>
  );
};

export default OrganizationList;

