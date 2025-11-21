// src/components/ota/OTADeviceList.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import { useStore } from "../../contexts/storecontexts";
import "../../styles/pages/management-pages.css";
import VersionsDropdown from "./VersionDropDown";

const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050";
const WS_BASE = (import.meta.env.VITE_BACKEND_WS || "ws://localhost:5050") + "/ws/ota";

const toast = (title, icon = "success", timer = 2500) =>
  Swal.fire({ toast: true, position: "top-end", showConfirmButton: false, timer, title, icon });

const OTADeviceList = ({ selectedVersion, onVersionSelect }) => {
  const { token: ctxToken } = useStore?.() || {};
  const token = ctxToken || localStorage.getItem("token") || "";

  const [devices, setDevices] = useState([]); // { deviceId, ip, status, connectedAt, otaStatus, progress }
  const [loading, setLoading] = useState(true);
  const [selectedDevices, setSelectedDevices] = useState(new Set());
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(selectedVersion || "");
  const [loadingVersions, setLoadingVersions] = useState(false);
  const otaTargetsRef = useRef(new Set());
  const [passCount, setPassCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [otaInProgress, setOtaInProgress] = useState(false);

  const wsRef = useRef(null);
  const reconnectTimeout = useRef(null);
  const retryCount = useRef(0);
  const gotInitialList = useRef(false);
  const unmountedRef = useRef(false);
  const navigate = useNavigate();
  
  // keep progress map (not required but useful)
  const deviceProgressRef = useRef(new Map());
  // near top of component (add this ref)
  const heartbeatIntervalRef = useRef(null);

  // devicesRef lets event handlers read latest devices without recreating ws
  const devicesRef = useRef([]);
  useEffect(() => {
    devicesRef.current = devices;
  }, [devices]);

  // track deviceIds we've already finalized (counted + maybe removed)
  const finalizedRef = useRef(new Set());

  // helper: finalize (count + mark final) and remove device from list + selection
 const finalizeDevice = useCallback((deviceId, status) => {
  if (!deviceId || finalizedRef.current.has(deviceId)) return;
  finalizedRef.current.add(deviceId);

  if (status === "pass") setPassCount((s) => s + 1);
  else if (status === "fail") setFailCount((s) => s + 1);

  setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
  setSelectedDevices((prev) => {
    const copy = new Set(prev);
    copy.delete(deviceId);
    return copy;
  });
  deviceProgressRef.current.delete(deviceId);
}, []);


  // helper: remove device from UI without counting it as pass/fail
const removeDeviceOnly = useCallback((deviceId) => {
  if (!deviceId) return;
  if (!finalizedRef.current.has(deviceId)) finalizedRef.current.add(deviceId);

  setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
  setSelectedDevices((prev) => {
    const copy = new Set(prev);
    copy.delete(deviceId);
    return copy;
  });
  deviceProgressRef.current.delete(deviceId);
}, []);


  /**
   * connectWs:
   * - stable identity (depends only on token)
   * - avoids closing a CONNECTING socket (to prevent "closed before established" errors)
   */
  const connectWs = useCallback(() => {
    const url = `${WS_BASE}?admin=true${token ? `&token=${encodeURIComponent(token)}` : ""}`;

    // Clean up previous socket safely:
    if (wsRef.current) {
      try {
        const prevState = wsRef.current.readyState;
        if (prevState === WebSocket.OPEN) {
          // close existing open socket (graceful)
          wsRef.current.close();
        } else if (prevState === WebSocket.CONNECTING) {
          try {
            wsRef.current.onopen = wsRef.current.onmessage = wsRef.current.onerror = wsRef.current.onclose = null;
          } catch (err) {}
          const shortRetry = setTimeout(() => {
            if (!unmountedRef.current && (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)) {
              connectWs();
            }
            clearTimeout(shortRetry);
          }, 800);
          return;
        }
      } catch (err) {
        console.warn("Error while cleaning previous ws:", err);
      }
    }

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      retryCount.current = 0;

      // start sending application-level heartbeats every 10s so server can mark us alive
      try {
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = setInterval(() => {
          try {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "heartbeat" }));
            }
          } catch (err) {
            console.warn("Failed to send heartbeat:", err);
          }
        }, 10000);
      } catch (err) {
        console.warn("heartbeat setup error:", err);
      }

      // fallback to clear "Loading..." if no server initial message arrives fast
      const fallback = setTimeout(() => {
        if (!gotInitialList.current) {
          gotInitialList.current = true;
          setLoading(false);
          console.warn("Cleared loading (fallback) because no server initial message arrived yet.");
        }
        clearTimeout(fallback);
      }, 2000);
    };

    ws.onmessage = (evt) => {
      try {
        const raw = typeof evt.data === "string" ? evt.data : evt.data.toString?.() || evt.data;
        const msg = JSON.parse(raw);

        // handle application-level ping/pong if present
        if (msg && msg.type === "ping") {
          try {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "pong" }));
            }
          } catch (err) {
            console.warn("Failed to send pong:", err);
          }
          if (!gotInitialList.current) { gotInitialList.current = true; setLoading(false); }
          return;
        }

        // treat first useful message as handshake
        const usefulTypes = new Set(["device_list","device_connected","device_disconnected","ota_progress","ota_result","ota_batch_start","server_hello"]);
        if (usefulTypes.has(msg.type)) {
          if (!gotInitialList.current) {
            gotInitialList.current = true;
            setLoading(false);
          }
        }

        switch (msg.type) {
          case "server_hello": {
            gotInitialList.current = true;
            setLoading(false);
            break;
          }

          case "device_list": {
            const incoming = msg.devices || [];
            setDevices((prev) => {
              const map = new Map(prev.map((d) => [d.deviceId, { ...d }]));

              for (const d of incoming) {
                const existing = map.get(d.deviceId);
                if (existing) {
                  map.set(d.deviceId, {
                    ...existing,
                    ip: d.ip ?? existing.ip,
                    status: d.status ?? existing.status ?? "connected",
                    connectedAt: d.connectedAt ? new Date(d.connectedAt) : existing.connectedAt,
                  });
                } else {
                  map.set(d.deviceId, {
                    deviceId: d.deviceId,
                    ip: d.ip,
                    status: d.status ?? "connected",
                    connectedAt: d.connectedAt ? new Date(d.connectedAt) : null,
                    otaStatus: "idle",
                    progress: 0,
                  });
                }
              }

              return Array.from(map.values());
            });

            gotInitialList.current = true;
            setLoading(false);
            break;
          }

          case "device_connected": {
            const { deviceId, ip } = msg;
            setDevices((prev) => {
              const copy = [...prev];
              const idx = copy.findIndex((x) => x.deviceId === deviceId);
              const newEntry = {
                deviceId,
                ip,
                status: "connected",
                connectedAt: msg.time ? new Date(msg.time) : new Date(),
                otaStatus: "idle",
                progress: 0,
              };
              if (idx >= 0) copy[idx] = { ...copy[idx], ...newEntry };
              else copy.unshift(newEntry);
              return copy;
            });
            break;
          }

          case "device_disconnected": {
            removeDeviceOnly(msg.deviceId);
            break;
          }

          case "ota_batch_start": {
            // server tells which targets started/are offline
            const targets = msg.targets || [];

            // For 'offline' entries (device was offline at start) remove from list.
            // For 'started' mark as started.
            setDevices((prev) => {
              const byId = new Map(prev.map((d) => [d.deviceId, { ...d }]));
              for (const t of targets) {
                const entry = byId.get(t.deviceId);
                if (!entry) continue;
                if (t.status === "started") {
                  entry.otaStatus = "started";
                  entry.progress = 0;
                  byId.set(t.deviceId, entry);
                } else if (t.status === "offline") {
                  // removed from list (offline before OTA)
                  byId.delete(t.deviceId);
                }
              }
              // clear selections for any removed devices
              setSelectedDevices((prevSel) => {
                const copy = new Set(prevSel);
                for (const t of targets) {
                  if (t.status === "offline") copy.delete(t.deviceId);
                }
                return copy;
              });
              return Array.from(byId.values());
            });

            break;
          }

          case "ota_progress": {
            // { type: "ota_progress", deviceId, progress }
            const { deviceId, progress } = msg;
            if (!deviceId) break;
            const pct = Number(progress || 0);
            deviceProgressRef.current.set(deviceId, pct);

            setDevices((prev) =>
              prev.map((d) => {
                if (d.deviceId !== deviceId) return d;
                const prevStatus = d.otaStatus;
                const newStatus = pct >= 100 ? "pass" : prevStatus === "offline" || prevStatus === "fail" ? prevStatus : "started";
                return { ...d, progress: pct, otaStatus: newStatus };
              })
            );

            // notify when device reaches 100% (only once)
            if (pct >= 100) {
              const key = `__notified_${deviceId}`;
              if (!deviceProgressRef.current.get(key)) {
                deviceProgressRef.current.set(key, true);
                toast(`Device ${deviceId} OTA completed (100%)`, "success", 2500);
              }
            }

            break;
          }

      case "ota_result": {
  const { deviceId, status, message, reason } = msg;
  if (!deviceId || !status) break;

  // if server says offline at start -> removed earlier, ignore counting
  if (status === "fail" && reason === "offline") {
    toast(`Device ${deviceId} was offline — removed`, "info", 1800);
    removeDeviceOnly(deviceId);
    break;
  }

  // Only treat results for the devices that are part of the current OTA run
  if (!otaTargetsRef.current.has(deviceId)) {
    // Not part of current run — ignore (or log)
    console.debug("Result for device not in current OTA targets:", deviceId, status);
    break;
  }

  // Only finalize once (guarded by finalizedRef)
  if (!finalizedRef.current.has(deviceId)) {
    if (status === "pass") toast(`Device ${deviceId} OTA success`, "success");
    else toast(`Device ${deviceId} OTA failed: ${message || "error"}`, "error", 4000);

    // increment counts and remove from UI
    finalizeDevice(deviceId, status === "pass" ? "pass" : "fail");
    deviceProgressRef.current.delete(deviceId);
  } else {
    console.debug("Duplicate final event ignored for", deviceId, status);
  }

  // Check if ALL targets of this OTA run are finalized
  let allDone = true;
  otaTargetsRef.current.forEach((id) => {
    if (!finalizedRef.current.has(id)) allDone = false;
  });

  if (allDone) {
    setOtaInProgress(false);
    toast("All OTA results received. Page will reload in 10s", "info", 2500);
    // optional: clear otaTargetsRef now or after reload
    // otaTargetsRef.current = new Set();

    setTimeout(() => {
      // reload the page — prefer a full reload when you're showing refreshed device list
      // navigate(0) sometimes is non-standard — you can use:
      // window.location.reload();
      // or if you prefer react-router:
      navigate(0);
    }, 10000);
  }

  break;
}



          case "error":
            console.warn("Server error frame:", msg);
            break;

          default:
            console.log("Unknown WS message type:", msg.type);
            break;
        }
      } catch (err) {
        console.warn("Invalid WS message", err);
      }
    };

    ws.onerror = (errEvent) => {
      console.error("OTA WebSocket error event:", errEvent, "readyState:", ws.readyState, "url:", url);
    };

    ws.onclose = (e) => {
      console.log("OTA WebSocket closed — code:", e?.code, "reason:", e?.reason, "wasClean:", e?.wasClean);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (!gotInitialList.current) setLoading(false);

      // detach handlers
      try {
        ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null;
      } catch {}

      if (unmountedRef.current) return;

      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      const backoff = Math.min(30000, 1000 * Math.pow(1.5, retryCount.current || 0));
      reconnectTimeout.current = setTimeout(() => {
        retryCount.current += 1;
        connectWs();
      }, backoff);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, finalizeDevice, removeDeviceOnly]); // include helpers so closure updates

  // start WS (mount) and cleanup
  useEffect(() => {
    unmountedRef.current = false;
    connectWs();
    return () => {
      unmountedRef.current = true;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (wsRef.current) {
        try {
          wsRef.current.onclose = null;
          wsRef.current.close();
        } catch (err) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectWs]);

  // Fetch versions (unchanged)
  useEffect(() => {
    const fetchVersions = async () => {
      setLoadingVersions(true);
      try {
        const res = await fetch(`${BASE}/ota/all`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.status === 404) {
          setVersions([]);
          setCurrentVersion("");
          if (onVersionSelect) onVersionSelect("");
          setLoadingVersions(false);
          return;
        }

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.warn("Failed to fetch OTA versions:", res.status, text);
          setVersions([]);
          setCurrentVersion("");
          if (onVersionSelect) onVersionSelect("");
          setLoadingVersions(false);
          return;
        }

        const data = await res.json();
        const verList = Array.isArray(data) ? data.map((f) => f.versionId).filter(Boolean) : [];
        setVersions(verList);

        if (selectedVersion) {
          setCurrentVersion(selectedVersion);
        } else if (verList.length > 0) {
          setCurrentVersion(verList[0]);
          onVersionSelect && onVersionSelect(verList[0]);
        } else {
          setCurrentVersion("");
          onVersionSelect && onVersionSelect("");
        }
      } catch (err) {
        console.error("Error fetching OTA versions:", err);
        setVersions([]);
        setCurrentVersion("");
        onVersionSelect && onVersionSelect("");
      } finally {
        setLoadingVersions(false);
      }
    };

    fetchVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount-only

  useEffect(() => {
    if (selectedVersion && selectedVersion !== currentVersion) {
      setCurrentVersion(selectedVersion);
    }
  }, [selectedVersion, currentVersion]);

  // selection helpers use device.deviceId
  const handleDeviceToggle = (deviceId) => {
    setSelectedDevices((prev) => {
      const copy = new Set(prev);
      if (copy.has(deviceId)) copy.delete(deviceId);
      else copy.add(deviceId);
      return copy;
    });
  };

  const handleSelectAll = () => {
    if (selectedDevices.size === devices.length) setSelectedDevices(new Set());
    else setSelectedDevices(new Set(devices.map((d) => d.deviceId)));
  };

  // Start OTA via REST endpoint - backend will broadcast results to WS
  const handleOTA = async () => {
    setFailCount(0);
    setPassCount(0)

     finalizedRef.current = new Set();        // <<< CLEAR previous finalized ids
  deviceProgressRef.current.clear();      // <<< CLEAR progress/notification flags
  otaTargetsRef.current = new Set();      // <<< new empty set for this run
  setOtaInProgress(true);                 // <<< mark OTA in progress


    if (!currentVersion) {
      Swal.fire({ icon: "error", title: "Select version", text: "Please choose an OTA version to start." });
      return;
    }
    if (selectedDevices.size === 0) {
      Swal.fire({ icon: "error", title: "No devices selected", text: "Please select at least 1 device." });
      return;
    }

    // Build deviceIds but filter out devices that are not connected (they will never start)
    const allSelected = Array.from(selectedDevices);
    const connectedSelected = [];
    const disconnectedRemoved = [];
    for (const id of allSelected) {
      const d = devices.find((x) => x.deviceId === id);
      if (d && d.status === "connected") connectedSelected.push(id);
      else disconnectedRemoved.push(id);
    }

    if (disconnectedRemoved.length > 0) {
      // remove them from the UI list and selection so counts and list are correct
      setSelectedDevices((prev) => {
        const copy = new Set(prev);
        disconnectedRemoved.forEach((id) => copy.delete(id));
        return copy;
      });

      // remove them from device list (disconnected before OTA)
      setDevices((prev) => prev.filter((d) => d.status === "connected" || !disconnectedRemoved.includes(d.deviceId)));

      toast(`${disconnectedRemoved.length} device(s) removed (already disconnected).`, "info", 2000);
    }

    if (connectedSelected.length === 0) {
      Swal.fire({ icon: "error", title: "No connected devices", text: "No selected devices are connected." });
      return;
    }

    const deviceIds = connectedSelected;

      deviceIds.forEach((id) => otaTargetsRef.current.add(id));

    try {
      const res = await fetch(`${BASE}/ota/start`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ versionId: currentVersion, devices: deviceIds }),
      });

      const data = await res.json().catch(() => null);
      console.log("OTASTART DATA FROM BACKEND", data);



      if (!res.ok) {
        Swal.fire({ icon: "error", title: "OTA start failed", text: data?.message || res.statusText || "Failed to start OTA" });
        return;
      }

      // Do NOT treat API 200 as final success. API confirms trigger only.
      toast(`OTA triggered for ${deviceIds.length} device(s)`, "info", 1800);

      // The server returns per-device started/offline; update UI accordingly
      if (data?.results && Array.isArray(data.results)) {
      setDevices((prev) =>
        prev
          .map((d) => {
            const t = data.results.find((r) => r.deviceId === d.deviceId);
            if (t) {
              return {
                ...d,
                otaStatus: t.status === "started" ? "started" : t.status === "offline" ? "offline" : d.otaStatus,
                progress: t.status === "started" ? 0 : d.progress ?? 0,
              };
            }
            return d;
          })
          .filter((d) => d.otaStatus !== "offline") // remove offline targets
      );
    }
    } catch (err) {
      console.error("startOTA error", err);
      Swal.fire({ icon: "error", title: "Server error", text: "Unable to start OTA. See console." });
    }
  };

  // compute counts from state
  const passCountMemo = useMemo(() => passCount, [passCount]);
  const failCountMemo = useMemo(() => failCount, [failCount]);

  // small progress bar renderer
  const ProgressBar = ({ value = 0 }) => {
    const pct = Math.max(0, Math.min(100, Number(value || 0)));
    return (
      <div className="w-28 h-2 bg-gray-200 rounded overflow-hidden" style={{ minWidth: 112 }}>
        <div style={{ width: `${pct}%`, transition: "width 300ms linear" }} className={`h-full ${pct >= 100 ? "bg-green-500" : "bg-[#0D5CA4]"}`} />
      </div>
    );
  };

  return (
    <div className="ListPage brand-list-container ota-device-list rounded-xl shadow-sm w-full h-full border border-[#E5E7EB] flex flex-col overflow-hidden" style={{ backgroundColor: "#EEF3F9" }}>
      <div className="flex-shrink-0 px-4 pt-4">
        <h1 className="brand-list-title font-semibold text-gray-800 mb-4">OTA Management</h1>

        <div className="mb-4">
          <VersionsDropdown
            versions={versions}
            currentVersion={currentVersion}
            loadingVersions={loadingVersions}
            onVersionSelect={(v) => {
              setCurrentVersion(v); // keep the component controlled
              onVersionSelect && onVersionSelect(v); // forward prop from OTADeviceList props
            }}
          />
        </div>

        <div className="mb-4">
          <h2 className="brand-list-header text-center font-semibold text-gray-800">Device List</h2>
          <div className="mx-auto mt-2 h-px w-4/5 bg-[#2563EB]/40"></div>
        </div>
      </div>

      <div className="flex-1 min-h-0 px-4 overflow-hidden">
        <div className="brand-table-scroll overflow-y-auto pr-1 h-full">
          {loading ? (
            <div className="text-center py-4">Loading devices...</div>
          ) : devices.length === 0 ? (
            <div className="text-center py-4">No devices connected.</div>
          ) : (
            <div className="space-y-2 pb-2">
              {/* optional header row with selectAll */}
              <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedDevices.size === devices.length && devices.length > 0} onChange={handleSelectAll} />
                  <span>Select All</span>
                </div>
                <div className="text-xs">Status • Progress</div>
              </div>

              {devices.map((device) => (
                <div key={device.deviceId} className="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <input type="checkbox" checked={selectedDevices.has(device.deviceId)} onChange={() => handleDeviceToggle(device.deviceId)} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-800 font-medium truncate">{device.deviceId}</span>
                        <span className="text-gray-600 text-sm ml-2">{device.ip || ""}</span>
                      </div>

                      <div className="flex items-center gap-3 mt-1">
                        <div className="text-xs text-gray-500">
                          {device.status === "connected" ? "Connected" : "Disconnected"}
                          {device.connectedAt ? ` • ${new Date(device.connectedAt).toLocaleString()}` : ""}
                          {device.otaStatus && device.otaStatus !== "idle" ? ` • OTA: ${device.otaStatus}` : ""}
                        </div>

                        {/* progress bar & percent */}
                        <div className="flex items-center gap-2">
                          <ProgressBar value={device.progress ?? 0} />
                          <div className="text-xs text-gray-600 w-10 text-right">{Math.round(device.progress ?? 0)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 grid grid-cols-2 gap-3 px-4 pb-4">
        <div className="bg-gray-200 rounded-lg p-4">
          <p className="text-gray-700 text-sm mb-1">No. of Device :</p>
          <p className="text-gray-800 font-bold text-xl">{devices.length < 10 ? `0${devices.length}` : devices.length}</p>
        </div>

        <div className="bg-green-500 rounded-lg p-4 text-white">
          <p className="font-semibold mb-1">PASS</p>
          <p className="text-2xl font-bold">{passCountMemo < 10 ? `0${passCountMemo}` : passCountMemo}</p>
        </div>

        <div className="bg-orange-400 rounded-lg p-4 text-white">
          <p className="font-semibold mb-1">Fail</p>
          <p className="text-2xl font-bold">{failCountMemo < 10 ? `0${failCountMemo}` : failCountMemo}</p>
        </div>

        <button
        onClick={handleOTA}
        disabled={otaInProgress || devices.length === 0}
        className={`cursor-pointer text-white font-semibold py-3 px-4 rounded-lg transition duration-300 shadow-md 
          ${otaInProgress ? "bg-gray-400 cursor-not-allowed" : "bg-[#0D5CA4] hover:bg-[#0A4A8A]"}`}
      >
        {otaInProgress ? "OTA in Progress..." : "START OTA"}
      </button>

      </div>
    </div>
  );
};

export default OTADeviceList;
