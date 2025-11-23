import React, { useMemo } from "react";
import VenueDetailsPanel from "../pages/Dashboard/VenueDetailsPanel";
import { IconButton } from "@mui/material";


/**
 * DashboardRightPanel
 * - Receives freezerDevices, selectedFreezerDeviceId, selectedOrgId
 * - Renders VenueDetailsPanel for selected device or default empty panel
 */
export default function DashboardRightPanel({
  freezerDevices = [],
  selectedFreezerDeviceId = null,
  selectedOrgId = null,
  className = "",
  onClose = undefined,
  closeIcon = false,
}) {
  // compute selected device once
  const selected = useMemo(() => {
    if (!selectedFreezerDeviceId) return null;
    return freezerDevices.find((d) => (d._id ?? d.id) === selectedFreezerDeviceId) ?? null;
  }, [freezerDevices, selectedFreezerDeviceId]);

  return (
    <div
      className={`dashboard-right-panel shadow-sm flex flex-col h-full overflow-y-auto custom-scrollbar p-4 lg:p-6 border-l border-[#E5E7EB]/40 bg-white flex-shrink-0  ${className}`}
    >
      {selected ? (
        <VenueDetailsPanel
          venueName={selected?.venueName ?? "Venue"}
          freezerTemperature={selected?.FreezerData?.temperature ?? 0}
          ambientTemperature={selected?.AmbientData?.temperature ?? 0}
          batteryLow={selected?.batteryLow ?? selected?.batteryAlert ?? false}
          needMaintenance={selected?.needMaintenance ?? false}
          apiKey={selected?.apiKey}
          chartData={selected?.chartData ?? []}
          organizationId={selectedOrgId}
          closeIcon={closeIcon}   // forward
          onClose={onClose}       // forward
        />
      ) : (
        <VenueDetailsPanel
          venueName={"Venue"}
          freezerTemperature={0}
          ambientTemperature={0}
          batteryLow={true}
          needMaintenance={true}
          apiKey={""}
          chartData={[]}
          organizationId={selectedOrgId}
          closeIcon={closeIcon}   
          onClose={onClose}       
        />
      )}
    </div>
  );
}
