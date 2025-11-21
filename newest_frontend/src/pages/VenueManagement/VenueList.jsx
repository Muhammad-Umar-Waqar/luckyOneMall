// src/pages/management/VenueList.jsx
import React, { useEffect } from "react";
import { Pencil, Trash } from "lucide-react";
import Swal from "sweetalert2";
import { fetchAllVenues, updateVenue, deleteVenue } from "../../slices/VenueSlice";
import { useDispatch, useSelector } from "react-redux";
import "../../styles/pages/management-pages.css";
import TableSkeleton from "../../components/skeletons/TableSkeleton";


const VenueList = ({ onVenueSelect, selectedVenue }) => {
  const dispatch = useDispatch();
  const { Venues, loading, error } = useSelector((state) => state.Venue || { Venues: [], loading: false, error: null });

  useEffect(() => {
    dispatch(fetchAllVenues());
  }, [dispatch]);

  const handleDelete = async (id, venueName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete ${venueName}? This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(deleteVenue(id)).unwrap();
      Swal.fire({ title: "Deleted!", text: `${venueName} has been deleted.`, icon: "success", timer: 1400, showConfirmButton: false });
    } catch (err) {
      console.error("Error deleting venue:", err);
      Swal.fire({ title: "Error!", text: err || "Failed to delete venue", icon: "error" });
    }
  };

  const handleEdit = async (id, currentName) => {
    const { value: newName } = await Swal.fire({
      title: "Update Venue",
      input: "text",
      inputLabel: "New Venue Name",
      inputValue: currentName,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return "You need to enter a venue name!";
      },
    });

    if (!newName) return;

    try {
      await dispatch(updateVenue({ id, name: newName })).unwrap();
      Swal.fire({ title: "Updated!", text: `Venue updated to ${newName}.`, icon: "success", timer: 1400, showConfirmButton: false });
    } catch (err) {
      console.error("Error updating venue:", err);
      Swal.fire({ title: "Error!", text: err || "Failed to update venue", icon: "error" });
    }
  };

  const handleRowClick = (venue, e) => {
    e.stopPropagation();
    onVenueSelect?.(venue);
  };

  return (
    <div className="ListPage venue-list-container bg-white rounded-xl shadow-sm w-full h-full border border-[#E5E7EB]">
      <h1 className="venue-list-title font-semibold text-gray-800 mb-4">Venue Management</h1>
      <div className="mb-4">
        <h2 className="venue-list-header text-center font-semibold text-gray-800">Venue List</h2>
        <div className="mx-auto mt-2 h-px w-4/5 bg-[#2563EB]/40"></div>
      </div>

      <div className="overflow-x-auto ">
        <table className="w-full table-auto text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="venue-table-header py-2 px-4 font-bold text-gray-800">Venue Name</th>
              <th className="venue-table-header py-2 px-4 text-center">Actions</th>
            </tr>
          </thead>
        </table>

        <div className="venue-table-scroll overflow-y-auto pr-1 h-[58vh]">
          {loading ? (
            <table className="w-full table-auto text-left">
      <tbody aria-busy={loading} role="status">
        <TableSkeleton rows={6} showNumber={true} showActions={true} />
      </tbody>
    </table>

            // <div className="text-center py-4">Loading venues...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : Venues.length === 0 ? (
            <div className="text-center py-4">No venues found. Add one to get started.</div>
          ) : (
            <table className="w-full table-auto text-left">
              <tbody>
                {Venues.map((venue, index) => {
                  const id = venue._id ?? venue.id ?? index;
                  const displayName = venue.name ?? `Venue ${index + 1}`;
                  return (
                    <tr
                      key={id}
                      className={`border-b border-gray-200 cursor-pointer transition-colors hover:bg-blue-50/60 ${selectedVenue?._id === id ? "bg-blue-50 border-blue-300" : ""}`}
                      onClick={(e) => handleRowClick(venue, e)}
                    >
                      <td className="venue-table-cell py-2 sm:py-3 px-2 sm:px-4">
                        {index + 1}. {displayName}
                      </td>
                      <td className="venue-table-cell py-2 sm:py-3 px-2 sm:px-4">
                        <div className="flex justify-center gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleEdit(id, displayName)} className=" cursor-pointer venue-action-btn rounded-full border border-green-500/50 bg-white flex items-center justify-center hover:bg-green-50">
                            <Pencil className="text-green-600 venue-action-icon " />
                          </button>
                          <button onClick={() => handleDelete(id, displayName)} className=" cursor-pointer venue-action-btn rounded-full border border-red-500/50 bg-white flex items-center justify-center hover:bg-red-50">
                            <Trash className="text-red-600 venue-action-icon " />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueList;
