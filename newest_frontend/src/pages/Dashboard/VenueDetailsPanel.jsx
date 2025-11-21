
"use client";
import { Download } from "lucide-react";
import AlertsChart from "./AlertsChart";
import { useDispatch, useSelector } from "react-redux";
import { useStore } from "../../contexts/storecontexts";
import { fetchAlertsByOrg } from "../../slices/alertsSlice";
import { useEffect } from "react";
import QRCode from "./QrCode";
import { useLocation } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from "@mui/material";

export default function VenueDetailsPanel({
  organizationId = null,
  venueName = "Karim Korangi Branch",
  freezerTemperature = -4,
  ambientTemperature = 25,
  batteryLow = true,
  needMaintenance = true,
  apiKey = "",
  closeIcon = false,
  onClose = undefined,
}) {
  const dispatch = useDispatch();
  const { user } = useStore();
  const orgId = organizationId || user?.organization || null;

  
const location = useLocation();
const params = new URLSearchParams(location.search);
const venueId = params.get("venue"); // gives the ID

const venuesFromSlice = useSelector((state) => state.Venue.Venues || []);
const currentVenueSlice = venuesFromSlice.find(v => v._id === venueId) || null;



  console.log("ORGID", orgId)
  // --- Redux selector: get all alerts for this org
  const orgAlerts = useSelector((s) =>
    orgId
      ? s.alerts?.byOrg?.[orgId] ?? { venues: [], loading: false, error: null }
      : { venues: [], loading: false, error: null }
  );

  // --- Fetch alerts on mount
  useEffect(() => {
    if (orgId) dispatch(fetchAlertsByOrg(orgId));
  }, [orgId, dispatch]);

  const venues = orgAlerts?.venues || [];
 
  const handleDownload = () => {
    alert(`Downloading report for ${venueName}`);
  };

  return (
    <div
      className="w-full rounded-lg p-6 shadow-sm space-y-6"
      style={{ backgroundColor: "#07518D12" }}
    >
     {closeIcon && (
        // only render button when `closeIcon` true (mobile drawer)
        <div className="flex justify-end">
          <IconButton
            onClick={() => {
              if (typeof onClose === "function") onClose(); // guard, then call
            }}
            edge="start"
            aria-label="close-details"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </div>
      )}
      
      {/* A. Venue Info Section */}
      <div className="flex justify-start items-center pb-4 border-b border-[#E5E7EB]/40 mb-6">
        <div>
          <p className="text-sm text-[#64748B] font-medium">Venue</p>
          <h2 className="text-sm text-[#1E293B] font-bold">{currentVenueSlice?.name || "Venue"}</h2>
        </div>
        {/* <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-3 py-2 bg-[#2563EB] text-white rounded-full text-xs font-semibold hover:bg-[#1D4ED8] active:scale-[.98] transition shadow-sm"
          aria-label="Download"
        >
          <span className="leading-none">Download</span>
          <Download className="w-3.5 h-3.5" />
        </button> */}
      </div>

      {/* B. Refrigerator Image */}
      <div className="relative w-full overflow-hidden mb-4">
        <img
          src="/ambient_freezer.svg"
          alt="Refrigerator"
          className="w-full h-auto object-cover"
        />
        <div className="flex flex-col items-center justify-center absolute top-[30%] left-[8%] ">
      <h1 className="font-bold text-white text-lg">Freezer</h1>
      <h1 className="font-bold text-white text-lg">{freezerTemperature}<span className="font-thin text-white">°C</span></h1>
        </div>
        <div className="flex flex-col items-center justify-center absolute top-[30%] right-[15%]">
      <h1 className="font-bold text-[#07518D] text-lg">Ambient</h1>
      <h1 className="font-bold text-[#07518D]  text-lg">{ambientTemperature}<span className="text-lg font-thin">°C</span></h1>
        </div>
      </div>

      {/* C. Temperature Section */}
      <div className="relative w-full overflow-hidden mb-6 bg-[#07518D]/[0.05] rounded-xl">
        <div className="flex flex-col-2 justify-start items-center gap-5">
          <div className="flex flex-col-2 items-center justify-center ml-[10px]">
            <img src="/freezer-icon.svg" className="h-[60px] w-[30px]" />
            <div className="flex flex-col justify-end items-end">
              <h1 className="text-sm font-semibold">Freezer</h1>
              <h1 className="text-xl font-bold">
                {freezerTemperature}
                <span className="text-xl font-thin">°C</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-col-2 items-center justify-center ml-[10px]">
            <img src="/ambient-icon.svg" className="h-[60px] w-[30px]" />
            <div className="flex flex-col items-end justify-end">
              <h1 className="text-sm font-semibold">Ambient</h1>
              <h1 className="text-xl font-bold">
                {ambientTemperature}
                <span className="text-xl font-thin">°C</span>
              </h1>
            </div>
          </div>
        </div>

        {/* <img
          src="red-alert-icon"
          alt="Freezer and Ambient Combo"
          className="w-full h-auto object-cover"
        /> */}
      </div>

      {/* D. Alerts Chart */}
      <div className="mb-6">
        {venues.length > 0 ? (
          <AlertsChart venues={venues} defaultMode="battery" />
        ) : (
          <p className="text-sm text-gray-500 text-center">
            No alert data available
          </p>
        )}
      </div>
      <div>
    {apiKey && (
      <div className="mt-3  p-2 rounded-md bg-white border border-gray-200 text-sm text-gray-700 break-words px-2">
        <div className="flex items-center justify-between ">
          <div>
        <strong>API Key:</strong>
            <div className="mt-2 text-sm " title={apiKey}>
              {apiKey ? `${apiKey.slice(0, 15)}...` : ""}
            </div>
          </div>

          <QRCode apiKey={apiKey} baseUrl={import.meta.env.VITE_REACT_URI || 'http://localhost:5173'} />
        </div>
      </div>
    )}
      </div>
    </div>
  );
}
