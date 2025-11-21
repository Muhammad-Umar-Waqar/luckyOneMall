import React, { useEffect, useState, useRef } from "react";
import { useStore } from "../../contexts/storecontexts";

const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050";
const getToken = () => localStorage.getItem("token");

/**
 * Props:
 * - organizationId (required)
 * - value : selected venue id
 * - onChange : fn(id)
 * - className
 * - excludeFirstN : number of first venues to exclude from the select (default 0)
 */
export default function VenueSelect({ organizationId, value, onChange, className = "", excludeFirstN = 0 }) {
  const { user } = useStore();

  const [venues, setVenues] = useState([]);
  const [visibleVenues, setVisibleVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(value ?? "");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setSelected(value ?? "");
  }, [value]);

  useEffect(() => {
    if (!organizationId) {
      setVenues([]);
      setVisibleVenues([]);
      setSelected("");
      setError(null);
      return;
    }

    const abortCtrl = new AbortController();
    const fetchVenues = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getToken();
        const res = await fetch(`${BASE}/venue/venue-by-org/${organizationId}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: abortCtrl.signal,
        });

        const data = await res.json();
        if (!res.ok) {
          const message = data?.message || "Failed to fetch venues";
          setVenues([]);
          setVisibleVenues([]);
          setSelected("");
          setError(message);
          setLoading(false);
          return;
        }

        const arr = Array.isArray(data) ? data : Array.isArray(data?.venues) ? data.venues : [];
        setVenues(arr);

        const filtered = excludeFirstN > 0 ? arr.slice(excludeFirstN) : arr;
        setVisibleVenues(filtered);

        if ((!value || value === "") && filtered.length > 0) {
          const firstId = String(filtered[0]._id ?? filtered[0].id ?? filtered[0]);
          setSelected(firstId);
          if (typeof onChange === "function") onChange(firstId);
        } else if (value) {
          setSelected(value);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Venue fetch error:", err);
        setError(err.message || "Network error");
        setVenues([]);
        setVisibleVenues([]);
        setSelected("");
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
    return () => abortCtrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, excludeFirstN]);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSelect = (id) => {
    setSelected(String(id));
    if (typeof onChange === "function") onChange(String(id));
    setDropdownOpen(false);
  };

  const handleKeyboard = (e) => {
    if (e.key === "Enter") setDropdownOpen((s) => !s);
    if (e.key === "Escape") setDropdownOpen(false);
  };

  // keep hiding behavior: if user and total venues <= 4 => don't show control
  if (user?.role === "user" && venues?.length <= 4) return null;

  const selectedVenue = visibleVenues.find((v) => String(v._id ?? v.id ?? v) === String(selected));
  const label = loading ? "Loading venues..." : selectedVenue ? selectedVenue.name ?? selectedVenue.venue_name ?? String(selected) : "Venue";

  return (
    <div className={className} ref={ref}>
      <div className="grid grid-cols-2 items-center gap-4 w-full ">
        {/* <label className="text-left font-medium text-gray-700">Venue</label> */}

        <div className="relative col-span-2 ">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyboard}
            onClick={() => !loading && organizationId && setDropdownOpen((s) => !s)}
            className={`sm:rounded-full flex items-center justify-between pr-2 pl-3 py-2 border cursor-pointer bg-[#0D5CA4] text-white select-none  ${selectedVenue ? "rounded-full" : "rounded-xl"}`}
          >
            <span className="text-white truncate max-w-[70%]">{label}</span>
          <svg
          className={`w-6 h-6 ml-2 bg-white rounded-full p-[2px] transform ${
            dropdownOpen ? "rotate-180" : "rotate-0"
          }`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 10c-.7 0-1 .8-.5 1.3l4.3 4.3c.7.7 1.9.7 2.6 0l4.3-4.3c.5-.5.2-1.3-.5-1.3H7z"
            fill="#0D5CA4"
            stroke="#0D5CA4"
            strokeWidth="1.3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>


          </div>

          {/* Dropdown menu */}
          {dropdownOpen && (
            
            <div className=" absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-3 text-sm text-gray-500">venue</div>
              ) : visibleVenues && visibleVenues.length > 0 ? (
                visibleVenues.map((v) => {
                  const id = String(v._id ?? v.id ?? v);
                  const name = v.name ?? v.venue_name ?? id;
                  return (
                    <div
                      key={id}
                      onClick={() => handleSelect(id)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm flex items-center justify-between ${String(selected) === id ? "bg-gray-50" : ""}`}
                    >
                      <div className="truncate">{name}</div>
                      {String(selected) === id && (
                        <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">No venues found</div>
              )}
              
            </div>
            
          )}
        </div>
      </div>
    </div>
  );
}
