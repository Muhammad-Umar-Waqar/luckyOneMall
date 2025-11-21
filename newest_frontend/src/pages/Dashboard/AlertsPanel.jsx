
//AlertsPanel.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import MaintenanceList from "../Dashboard/MaintenanceList";
import BatteryAlert from "../Dashboard/BatteryAlert";
import { useStore } from "../../contexts/storecontexts";
import { fetchAlertsByOrg } from "../../slices/alertsSlice";

export default function AlertsPanel({ organizationId = null, pollInterval = null }) {
  const dispatch = useDispatch();
  const { user } = useStore();
  const orgId = organizationId || user?.organization || null;
  const role = user?.role ?? null;

  // select alerts for org (stable fallback)
  const orgAlerts = useSelector((s) =>
    orgId ? s.alerts?.byOrg?.[orgId] ?? { venues: [], loading: false, error: null } : { venues: [], loading: false, error: null }
  );

  // initial fetch + when orgId changes
  useEffect(() => {
    if (!orgId) return;
    dispatch(fetchAlertsByOrg(orgId));
  }, [orgId, dispatch]);

  // optional polling (pass pollInterval in ms to enable)
  useEffect(() => {
    if (!orgId || !pollInterval) return;
    const id = setInterval(() => {
      dispatch(fetchAlertsByOrg(orgId));
    }, pollInterval);
    return () => clearInterval(id);
  }, [orgId, pollInterval, dispatch]);

  const venues = orgAlerts?.venues || [];

  const maintenanceItems = venues.map((v) => ({
    id: v.venueId,
    name: v.venueName,
    devices: v.refrigeratorAlertCount || 0,
    nestedItems: (v.refrigeratorAlertDevices || []).map((d) => ({ id: d.id, name: d.name, date: d.date })),
  }));
  const batteryItems = venues.map((v) => ({
    id: v.venueId,
    name: v.venueName,
    devices: v.batteryAlertCount || 0,
    nestedItems: (v.batteryAlertDevices || []).map((d) => ({ id: d.id, name: d.name, date: d.date })),
  }));

  return (
    <div className="flex-shrink-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4" style={{ backgroundColor: "#07518D12", borderRadius: "20px" }}>
          <MaintenanceList items={maintenanceItems} />
        </div>
        <div className="p-4" style={{ backgroundColor: "#07518D12", borderRadius: "20px" }}>
          <BatteryAlert items={batteryItems} />
        </div>
      </div>
    </div>
  );
}



