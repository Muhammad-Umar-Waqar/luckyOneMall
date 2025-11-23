// // src/pages/Dashboard.jsx
// "use client"
// import React, { useState, useEffect, useMemo } from "react"
// import FreezerDeviceCard from "./FreezerDeviceCard"
// import VenueDetailsPanel from "./VenueDetailsPanel"
// import OrganizationSelect from "./OrganizationSelect"
// import VenueSelect from "./VenueSelect"
// import AlertsPanel from "./AlertsPanel"
// import "../../styles/pages/Dashboard/dashboard-styles.css"
// import "../../styles/pages/Dashboard/freezer-cards-responsive.css"
// import { useStore } from "../../contexts/storecontexts"
// import { useLocation, useNavigate } from "react-router-dom"
// import DashboardRightPanel from "../../components/DashboardRightPanel"
// import { Drawer, useMediaQuery } from "@mui/material";

// const mockFreezerDevices = [
//   /* keep if you want placeholder cards when empty; otherwise devices come from API */
// ]

// const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050"

// export default function Dashboard() {
//   // -------------------------
//   // top-level hooks (always called, stable order)
//   // -------------------------
//   const { user } = useStore()
//   const location = useLocation()
//   const navigate = useNavigate()

//   // -------------------------
//   // minimal state for UI
//   // -------------------------
//   const [organizations, setOrganizations] = useState([])
//   const [freezerDevices, setFreezerDevices] = useState(mockFreezerDevices)
//   const [selectedFreezerDeviceId, setSelectedFreezerDeviceId] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   const [selectedOrgId, setSelectedOrgId] = useState("")
//   const [selectedVenueId, setSelectedVenueId] = useState("")
//   const [showDetailPage, setShowDetailPage] = useState(false)
//   const [selectedDevice, setSelectedDevice] = useState(null)
//   const [open, setOpen] = React.useState(false);
//   const isDesktop = useMediaQuery("(min-width:768px)");

//   // -------------------------
//   // helpers (pure utility, no hooks inside)
//   // -------------------------
//   const getAllDevicesInOrganization = (org) => {
//     let devices = [...(org.devices || [])]
//     if (org.subOrganizations) {
//       org.subOrganizations.forEach((subOrg) => {
//         devices = devices.concat(getAllDevicesInOrganization(subOrg))
//       })
//     }
//     return devices
//   }
  

//   const findOrganizationById = (orgs, id) => {
//     for (const org of orgs) {
//       if (String(org.id) === String(id) || String(org._id) === String(id)) return org
//       if (org.subOrganizations) {
//         const found = findOrganizationById(org.subOrganizations, id)
//         if (found) return found
//       }
//     }
//     return null
//   }

//   // -------------------------
//   // derived data (no useEffect)
//   // -------------------------
//   const selectedOrganizationData = useMemo(() => {
//     if (!selectedOrgId || organizations.length === 0) return null
//     const org = findOrganizationById(organizations, selectedOrgId)
//     if (!org) return null
//     const allDevices = getAllDevicesInOrganization(org)
//     return {
//       organizationName: org.name || org.organization_name || selectedOrgId,
//       deviceCount: allDevices.length,
//     }
//   }, [selectedOrgId, organizations])

//   // -------------------------
//   // EFFECT #1: fetchOrganizations on mount (keeps your placeholder behavior)
//   // -------------------------
//   useEffect(() => {
//     const fetchOrganizations = async () => {
//       try {
//         setLoading(true)
//         setError(null)
//         // placeholder empty list for now (same behavior you had)
//         // Replace with API call when backend ready:
//         // const token = localStorage.getItem("token")
//         // const res = await fetch(`${BASE}/organization/fetch/hierarchical`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
//         // const data = await res.json()
//         const mockOrgs = []
//         setOrganizations(mockOrgs)
//       } catch (err) {
//         setError(err.message || "Failed to load organizations")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchOrganizations()
//   }, [])

//   // -------------------------
//   // EFFECT #2: keep selectedVenueId synced with URL ?venue=
//   // -------------------------
//   useEffect(() => {
//     const sp = new URLSearchParams(location.search)
//     const venueFromUrl = sp.get("venue") || ""
//     if (venueFromUrl !== selectedVenueId) {
//       setSelectedVenueId(venueFromUrl)
//     }
//     // no dependencies other than location.search so this always runs when URL changes
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [location.search])

//   // -------------------------
//   // EFFECT #3: fetch devices when selectedVenueId changes
//   // -------------------------
//   useEffect(() => {
//     if (!selectedVenueId) {
//       setFreezerDevices([]) // clear when no venue
//       return
//     }


//     let mounted = true
//     let intervalId = null
//     const POLL_MS = 10 * 60 * 1000 // 10 minutes
//     const fetchDevices = async () => {
//       try {
//         const token = localStorage.getItem("token")
//         const res = await fetch(`${BASE}/device/device-by-venue/${selectedVenueId}`, {
//           method: "GET",
//           credentials: "include",
//           headers: {
//             "Content-Type": "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           },
//         })
//         const data = await res.json()
//         if (!mounted) return
//         if (res.ok) {
//           setFreezerDevices(data.devices || [])
//         } else {
//           setFreezerDevices([])
//           console.error("Device fetch error:", data?.message)
//         }
//       } catch (err) {
//         if (!mounted) return
//         console.error("Device fetch error:", err)
//         setFreezerDevices([])
//       }
//     }

//     fetchDevices()

//       // start polling (only if venue present)
//   intervalId = setInterval(() => {
//     fetchDevices()
//   }, POLL_MS)

//     return () => {
//       mounted = false
//     }
//   }, [selectedVenueId])

//   // -------------------------
//   // simple handlers (kept minimal)
//   // -------------------------

//    const toggleDrawer = (newOpen) => () => {
//     setOpen(newOpen);
//   };


//   const handleFreezerDeviceSelect = (deviceId) => {
//     console.log("Card Selected")
//     setSelectedFreezerDeviceId(deviceId)
//   if (!isDesktop) setOpen(true) 
//   }

//   const handleBackToDashboard = () => {
//     setShowDetailPage(false)
//     setSelectedDevice(null)
//   }

//   // Admin: when org changes, reset venue selection (keeps URL clean)
//   const onOrganizationChange = (id) => {

//      const orgId = id || user?.organization;

//   // If org hasn't changed, don't clear the venue or modify URL
//   if (orgId && String(orgId) === String(selectedOrgId)) {
//     return;
//   }

  
//     setSelectedOrgId(id || user?.organization)
//     setSelectedVenueId("")
//     // remove ?venue from URL
//     const sp = new URLSearchParams(location.search)
//     if (sp.get("venue")) {
//       sp.delete("venue")
//       navigate(location.pathname + (sp.toString() ? `?${sp.toString()}` : ""), { replace: true })
//     }
//   }

//   // Update URL when VenueSelect is used (or you can dispatch to redux)
//   const onVenueChange = (id) => {
//     setSelectedVenueId(id)
//     const basePath = location.pathname.split("?")[0]
//     if (id) navigate(`${basePath}?venue=${id}`, { replace: false })
//     else navigate(basePath, { replace: false })
//   }

  

//   // -------------------------
//   // render states for loading / error
//   // -------------------------
//   if (loading) {
//     return (
//       <div className="flex w-full flex-row h-full bg-gray-100 font-inter rounded-md overflow-hidden">
//         <div className="flex justify-center items-center w-full h-64">
//           {/* <div className="text-lg text-gray-600">Loading organizations...</div> */}
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="flex w-full flex-col lg:flex-row h-full bg-gray-100  font-inter rounded-md overflow-hidden">
//         <div className="flex flex-col justify-center items-center w-full h-64 space-y-4">
//           {/* <div className="text-lg text-red-600">Error: {error}</div> */}
//         </div>
//       </div>
//     )
//   }

//   // -------------------------
//   // main JSX (kept same layout)
//   // -------------------------
//   return (
//     <div className="flex w-full flex-row h-full font-inter rounded-md bg-[#F5F6FA]">
//       {/* Main Content Area */}
//       <div className="flex-1 min-w-0 space-y-6 overflow-y-auto custom-scrollbar dashboard-main-content bg-white shadow-sm border border-[#E5E7EB]/30 p-4 lg:p-6">
//         {!showDetailPage && (
//           <>
//             {/* Header */}
//             <div className="flex justify-between items-center mb-6">
//               <div>
//                 {/* <p className="text-sm text-[#64748B] min-w-[250px] font-medium">Organization</p> */}
//                 {user?.role === "admin" && (
//                   <OrganizationSelect
//                     value={selectedOrgId}
//                     onChange={onOrganizationChange}
//                     className="mt-1"
//                   />
//                 )}
//               </div>

//               <div className="flex items-center">
//                 <VenueSelect
//                   organizationId={selectedOrgId || user?.organization}
//                   value={selectedVenueId}
//                   onChange={onVenueChange}
//                   className="mt-1"
//                   excludeFirstN={user?.role === "user" ? 4 : 0}
//                 />
//               </div>
//             </div>

//             {/* Freezer Device Cards Grid */}
//             <div className="flex-1 min-h-0">
//               <div className="freezer-cards-container custom-scrollbar">
//                 {freezerDevices.length === 0 ? (
//                   <div className="flex flex-col items-center justify-center h-full text-[#64748B]">
//                     <svg className="w-16 h-16 mb-4 text-[#E2E8F0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                     </svg>
//                     <p className="text-lg font-medium">No Freezer Devices Found</p>
//                     <p className="text-sm">Add some freezer devices to get started</p>
//                   </div>
//                 ) : (
//                   <div className="freezer-cards-grid freezer-cards-container">
//                     {freezerDevices.map((device) => (
//                       <FreezerDeviceCard
//                         key={device._id ?? device.id}
//                         deviceId={device.deviceId}
//                         ambientTemperature={device?.AmbientData?.temperature ?? device.ambientTemperature}
//                         freezerTemperature={device?.FreezerData?.temperature ?? device.freezerTemperature}
//                         batteryLow={device?.batteryAlert ?? device?.batteryLow ?? false}
//                         refrigeratorAlert={device?.refrigeratorAlert ?? false}
//                         onCardSelect={() => handleFreezerDeviceSelect(device._id ?? device.id)}
//                         isSelected={(device._id ?? device.id) === selectedFreezerDeviceId}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <AlertsPanel organizationId={selectedOrgId} pollInterval={10 * 60 * 1000} />
//           </>
//         )}

//         {showDetailPage && (
//           <div className="flex-grow overflow-y-auto">
//             {/* simplified detail area: you can re-add OrganizationDetailContent when ready */}
//             <div>Detail page</div>
//             <button onClick={handleBackToDashboard}>Back</button>
//           </div>
//         )}
//       </div>

//       {/* Right Sidebar - Venue Details Panel */}
//       {/* <div className="dashboard-right-panel shadow-sm flex flex-col h-full overflow-y-auto custom-scrollbar p-4 lg:p-6 border-l border-[#E5E7EB]/40 bg-white flex-shrink-0">
//         {selectedFreezerDeviceId ? (
//           (() => {
//             const selected = freezerDevices.find((d) => (d._id ?? d.id) === selectedFreezerDeviceId)
//             return (
//               <VenueDetailsPanel
//                 venueName={ "Venue"}
//                 freezerTemperature={selected?.AmbientData?.temperature ?? 0}
//                 ambientTemperature={selected?.FreezerData?.temperature ?? 0}
//                 batteryLow={selected?.batteryLow ?? selected?.batteryAlert ?? false}
//                 needMaintenance={selected?.batteryLow ?? false}
//                 apiKey={selected?.apiKey}
//                 chartData={[]}
//                 organizationId={selectedOrgId}
//               />
//             )
//           })()
//         ) : (
//           <VenueDetailsPanel
//             venueName={"Venue"}
//             freezerTemperature={0}
//             ambientTemperature={0}
//             batteryLow={true}
//             needMaintenance={true}
//             apiKey="8dbf5d2a37c4178b4b03e6c49ae3f9e7"
//             chartData={[]}
//             organizationId={selectedOrgId}
//           />
//         )}
//       </div> */}

// {isDesktop ? (
//         <DashboardRightPanel
//       freezerDevices={freezerDevices}
//       selectedFreezerDeviceId={selectedFreezerDeviceId}
//       selectedOrgId={selectedOrgId}
      
//     />  
//     ) : (
//       <Drawer open={open} onClose={toggleDrawer(false)} anchor="right">
//         <DashboardRightPanel
//       freezerDevices={freezerDevices}
//       selectedFreezerDeviceId={selectedFreezerDeviceId}
//       selectedOrgId={selectedOrgId}
//       closeIcon={true}
//        onClose={toggleDrawer(false)}
//     />
//       </Drawer>
//     )}

    

//     </div>
//   )
// }























// src/pages/Dashboard.jsx
// "use client"
// import React, { useState, useEffect, useMemo } from "react"
// import FreezerDeviceCard from "./FreezerDeviceCard"
// import VenueDetailsPanel from "./VenueDetailsPanel"
// import OrganizationSelect from "./OrganizationSelect"
// import VenueSelect from "./VenueSelect"
// import AlertsPanel from "./AlertsPanel"
// import "../../styles/pages/Dashboard/dashboard-styles.css"
// import "../../styles/pages/Dashboard/freezer-cards-responsive.css"
// import { useStore } from "../../contexts/storecontexts"
// import { useLocation, useNavigate } from "react-router-dom"
// import { IconButton, Drawer, SwipeableDrawer, useMediaQuery } from "@mui/material";

// const mockFreezerDevices = [
//   /* keep if you want placeholder cards when empty; otherwise devices come from API */
// ]

// const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050"



// export default function Dashboard() {
//   // -------------------------
//   // top-level hooks (always called, stable order)
//   // -------------------------
//   const { user } = useStore()
//   const location = useLocation()
//   const navigate = useNavigate()

//   // -------------------------
//   // minimal state for UI
//   // -------------------------
//   const [organizations, setOrganizations] = useState([])
//   const [freezerDevices, setFreezerDevices] = useState(mockFreezerDevices)
//   const [selectedFreezerDeviceId, setSelectedFreezerDeviceId] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [open, setOpen] = React.useState(false);



//   const [selectedOrgId, setSelectedOrgId] = useState("")
//   const [selectedVenueId, setSelectedVenueId] = useState("")
//   const [showDetailPage, setShowDetailPage] = useState(false)
//   const [selectedDevice, setSelectedDevice] = useState(null)
//   const isDesktop = useMediaQuery("(min-width:760px)");
  

//   // -------------------------
//   // helpers (pure utility, no hooks inside)
//   // -------------------------
//   const getAllDevicesInOrganization = (org) => {
//     let devices = [...(org.devices || [])]
//     if (org.subOrganizations) {
//       org.subOrganizations.forEach((subOrg) => {
//         devices = devices.concat(getAllDevicesInOrganization(subOrg))
//       })
//     }
//     return devices
//   }

//     const toggleDrawer = (newOpen) => () => {
//     setOpen(newOpen);
//   };

//   const findOrganizationById = (orgs, id) => {
//     for (const org of orgs) {
//       if (String(org.id) === String(id) || String(org._id) === String(id)) return org
//       if (org.subOrganizations) {
//         const found = findOrganizationById(org.subOrganizations, id)
//         if (found) return found
//       }
//     }
//     return null
//   }

//   // -------------------------
//   // derived data (no useEffect)
//   // -------------------------
//   const selectedOrganizationData = useMemo(() => {
//     if (!selectedOrgId || organizations.length === 0) return null
//     const org = findOrganizationById(organizations, selectedOrgId)
//     if (!org) return null
//     const allDevices = getAllDevicesInOrganization(org)
//     return {
//       organizationName: org.name || org.organization_name || selectedOrgId,
//       deviceCount: allDevices.length,
//     }
//   }, [selectedOrgId, organizations])

//   // -------------------------
//   // EFFECT #1: fetchOrganizations on mount (keeps your placeholder behavior)
//   // -------------------------
//   useEffect(() => {
//     const fetchOrganizations = async () => {
//       try {
//         setLoading(true)
//         setError(null)
//         // placeholder empty list for now (same behavior you had)
//         // Replace with API call when backend ready:
//         // const token = localStorage.getItem("token")
//         // const res = await fetch(`${BASE}/organization/fetch/hierarchical`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
//         // const data = await res.json()
//         const mockOrgs = []
//         setOrganizations(mockOrgs)
//       } catch (err) {
//         setError(err.message || "Failed to load organizations")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchOrganizations()
//   }, [])

//   // -------------------------
//   // EFFECT #2: keep selectedVenueId synced with URL ?venue=
//   // -------------------------
//   useEffect(() => {
//     const sp = new URLSearchParams(location.search)
//     const venueFromUrl = sp.get("venue") || ""
//     if (venueFromUrl !== selectedVenueId) {
//       setSelectedVenueId(venueFromUrl)
//     }
//     // no dependencies other than location.search so this always runs when URL changes
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [location.search])

//   // -------------------------
//   // EFFECT #3: fetch devices when selectedVenueId changes
//   // -------------------------
//   useEffect(() => {
//     if (!selectedVenueId) {
//       setFreezerDevices([]) // clear when no venue
//       return
//     }


//     let mounted = true
//     let intervalId = null
//     const POLL_MS = 10 * 60 * 1000 // 10 minutes
//     const fetchDevices = async () => {
//       try {
//         const token = localStorage.getItem("token")
//         const res = await fetch(`${BASE}/device/device-by-venue/${selectedVenueId}`, {
//           method: "GET",
//           credentials: "include",
//           headers: {
//             "Content-Type": "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           },
//         })
//         const data = await res.json()
//         if (!mounted) return
//         if (res.ok) {
//           setFreezerDevices(data.devices || [])
//         } else {
//           setFreezerDevices([])
//           console.error("Device fetch error:", data?.message)
//         }
//       } catch (err) {
//         if (!mounted) return
//         console.error("Device fetch error:", err)
//         setFreezerDevices([])
//       }
//     }

//     fetchDevices()

//       // start polling (only if venue present)
//   intervalId = setInterval(() => {
//     fetchDevices()
//   }, POLL_MS)

//     return () => {
//       mounted = false
//     }
//   }, [selectedVenueId])

//   // -------------------------
//   // simple handlers (kept minimal)
//   // -------------------------
//   const handleFreezerDeviceSelect = (deviceId) => {
//     isDesktop && toggleDrawer(true);
//     setSelectedFreezerDeviceId(deviceId)
//   }

//   const handleBackToDashboard = () => {
//     setShowDetailPage(false)
//     setSelectedDevice(null)
//   }

//   // Admin: when org changes, reset venue selection (keeps URL clean)
//   const onOrganizationChange = (id) => {

//      const orgId = id || user?.organization;

//   // If org hasn't changed, don't clear the venue or modify URL
//   if (orgId && String(orgId) === String(selectedOrgId)) {
//     return;
//   }

  
//     setSelectedOrgId(id || user?.organization)
//     setSelectedVenueId("")
//     // remove ?venue from URL
//     const sp = new URLSearchParams(location.search)
//     if (sp.get("venue")) {
//       sp.delete("venue")
//       navigate(location.pathname + (sp.toString() ? `?${sp.toString()}` : ""), { replace: true })
//     }
//   }

//   // Update URL when VenueSelect is used (or you can dispatch to redux)
//   const onVenueChange = (id) => {
//     setSelectedVenueId(id)
//     const basePath = location.pathname.split("?")[0]
//     if (id) navigate(`${basePath}?venue=${id}`, { replace: false })
//     else navigate(basePath, { replace: false })
//   }

//   // -------------------------
//   // render states for loading / error
//   // -------------------------
//   if (loading) {
//     return (
//       <div className="flex w-full flex-row h-full bg-gray-100 font-inter rounded-md overflow-hidden">
//         <div className="flex justify-center items-center w-full h-64">
//           {/* <div className="text-lg text-gray-600">Loading organizations...</div> */}
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="flex w-full flex-col lg:flex-row h-full bg-gray-100  font-inter rounded-md overflow-hidden">
//         <div className="flex flex-col justify-center items-center w-full h-64 space-y-4">
//           {/* <div className="text-lg text-red-600">Error: {error}</div> */}
//         </div>
//       </div>
//     )
//   }


//   // Drawer Component:

//     // 🔥 Shared content for both Desktop and Mobile
// const RightPanelContent = () => {
//   const selected = selectedFreezerDeviceId
//     ? freezerDevices.find((d) => (d._id ?? d.id) === selectedFreezerDeviceId)
//     : null;

//   return (
//      <div className="dashboard-right-panel shadow-sm flex flex-col h-full overflow-y-auto custom-scrollbar p-4 lg:p-6 border-l border-[#E5E7EB]/40 bg-white flex-shrink-0">
//               {selectedFreezerDeviceId ? (
//                 (() => {
//                   const selected = freezerDevices.find((d) => (d._id ?? d.id) === selectedFreezerDeviceId)
//                   return (
//                     <VenueDetailsPanel
//                       venueName={ "Venue"}
//                       freezerTemperature={selected?.AmbientData?.temperature ?? 0}
//                       ambientTemperature={selected?.FreezerData?.temperature ?? 0}
//                       batteryLow={selected?.batteryLow ?? selected?.batteryAlert ?? false}
//                       needMaintenance={selected?.batteryLow ?? false}
//                       apiKey={selected?.apiKey}
//                       chartData={[]}
//                       organizationId={selectedOrgId}
//                     />
//                   )
//                 })()
//               ) : (
//                 <VenueDetailsPanel
//                   venueName={"Venue"}
//                   freezerTemperature={0}
//                   ambientTemperature={0}
//                   batteryLow={true}
//                   needMaintenance={true}
//                   apiKey="8dbf5d2a37c4178b4b03e6c49ae3f9e7"
//                   chartData={[]}
//                   organizationId={selectedOrgId}
//                 />
//               )}
//       </div>
//   );
// };

//   // -------------------------
//   // main JSX (kept same layout)
//   // -------------------------
//   return (
//     <div className="flex w-full flex-row h-full font-inter rounded-md bg-[#F5F6FA]">
//       {/* Main Content Area */}
//       <div className="flex-1 min-w-0 space-y-6 overflow-y-auto custom-scrollbar dashboard-main-content bg-white shadow-sm border border-[#E5E7EB]/30 p-4 lg:p-6">
//         {!showDetailPage && (
//           <>
//             {/* Header */}
//             <div className="flex justify-between items-center mb-6">
//               <div>
//                 <p className="text-sm text-[#64748B] min-w-[250px] font-medium">Organization</p>
//                 {user?.role === "admin" && (
//                   <OrganizationSelect
//                     value={selectedOrgId}
//                     onChange={onOrganizationChange}
//                     className="mt-1"
//                   />
//                 )}
//               </div>

//               <div className="flex items-center">
//                 <VenueSelect
//                   organizationId={selectedOrgId || user?.organization}
//                   value={selectedVenueId}
//                   onChange={onVenueChange}
//                   className="mt-1"
//                   excludeFirstN={user?.role === "user" ? 4 : 0}
//                 />
//               </div>
//             </div>

//             {/* Freezer Device Cards Grid */}
//             <div className="flex-1 min-h-0">
//               <div className="freezer-cards-container custom-scrollbar">
//                 {freezerDevices.length === 0 ? (
//                   <div className="flex flex-col items-center justify-center h-full text-[#64748B]">
//                     <svg className="w-16 h-16 mb-4 text-[#E2E8F0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                     </svg>
//                     <p className="text-lg font-medium">No Freezer Devices Found</p>
//                     <p className="text-sm">Add some freezer devices to get started</p>
//                   </div>
//                 ) : (
//                   <div className="freezer-cards-grid freezer-cards-container">
//                     {freezerDevices.map((device) => (
//                       <FreezerDeviceCard
//                         key={device._id ?? device.id}
//                         deviceId={device.deviceId}
//                         ambientTemperature={device?.AmbientData?.temperature ?? device.ambientTemperature}
//                         freezerTemperature={device?.FreezerData?.temperature ?? device.freezerTemperature}
//                         batteryLow={device?.batteryAlert ?? device?.batteryLow ?? false}
//                         refrigeratorAlert={device?.refrigeratorAlert ?? false}
//                         onCardSelect={() => handleFreezerDeviceSelect(device._id ?? device.id)}
//                         isSelected={(device._id ?? device.id) === selectedFreezerDeviceId}
//                       />
                      
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <AlertsPanel organizationId={selectedOrgId} pollInterval={10 * 60 * 1000} />
//           </>
//         )}

//         {showDetailPage && (
//           <div className="flex-grow overflow-y-auto">
//             {/* simplified detail area: you can re-add OrganizationDetailContent when ready */}
//             <div>Detail page</div>
//             <button onClick={handleBackToDashboard}>Back</button>
//           </div>
//         )}
//       </div>

//       {/* Right Sidebar - Venue Details Panel */}

//       {isDesktop ? (
//       <RightPanelContent />  // Desktop: Fixed right sidebar
//     ) : (
//       <Drawer open={open} onClose={toggleDrawer(false)} anchor="right">
//         <RightPanelContent />  // Mobile: Drawer
//       </Drawer>
//     )}
      


     
//     </div>
//   )
// }






// src/pages/Dashboard.jsx
// "use client"
// import React, { useState, useEffect, useMemo } from "react"
// import FreezerDeviceCard from "./FreezerDeviceCard"
// import VenueDetailsPanel from "./VenueDetailsPanel"
// import OrganizationSelect from "./OrganizationSelect"
// import VenueSelect from "./VenueSelect"
// import AlertsPanel from "./AlertsPanel"
// import "../../styles/pages/Dashboard/dashboard-styles.css"
// import "../../styles/pages/Dashboard/freezer-cards-responsive.css"
// import { useStore } from "../../contexts/storecontexts"
// import { useLocation, useNavigate } from "react-router-dom"
// import { IconButton, Drawer, SwipeableDrawer, useMediaQuery } from "@mui/material";

// const mockFreezerDevices = [
//   /* keep if you want placeholder cards when empty; otherwise devices come from API */
// ]

// const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050"



// export default function Dashboard() {
//   // -------------------------
//   // top-level hooks (always called, stable order)
//   // -------------------------
//   const { user } = useStore()
//   const location = useLocation()
//   const navigate = useNavigate()

//   // -------------------------
//   // minimal state for UI
//   // -------------------------
//   const [organizations, setOrganizations] = useState([])
//   const [freezerDevices, setFreezerDevices] = useState(mockFreezerDevices)
//   const [selectedFreezerDeviceId, setSelectedFreezerDeviceId] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [open, setOpen] = React.useState(false);



//   const [selectedOrgId, setSelectedOrgId] = useState("")
//   const [selectedVenueId, setSelectedVenueId] = useState("")
//   const [showDetailPage, setShowDetailPage] = useState(false)
//   const [selectedDevice, setSelectedDevice] = useState(null)
//   const isDesktop = useMediaQuery("(min-width:760px)");
  

//   // -------------------------
//   // helpers (pure utility, no hooks inside)
//   // -------------------------
//   const getAllDevicesInOrganization = (org) => {
//     let devices = [...(org.devices || [])]
//     if (org.subOrganizations) {
//       org.subOrganizations.forEach((subOrg) => {
//         devices = devices.concat(getAllDevicesInOrganization(subOrg))
//       })
//     }
//     return devices
//   }

//     const toggleDrawer = (newOpen) => () => {
//     setOpen(newOpen);
//   };

//   const findOrganizationById = (orgs, id) => {
//     for (const org of orgs) {
//       if (String(org.id) === String(id) || String(org._id) === String(id)) return org
//       if (org.subOrganizations) {
//         const found = findOrganizationById(org.subOrganizations, id)
//         if (found) return found
//       }
//     }
//     return null
//   }

//   // -------------------------
//   // derived data (no useEffect)
//   // -------------------------
//   const selectedOrganizationData = useMemo(() => {
//     if (!selectedOrgId || organizations.length === 0) return null
//     const org = findOrganizationById(organizations, selectedOrgId)
//     if (!org) return null
//     const allDevices = getAllDevicesInOrganization(org)
//     return {
//       organizationName: org.name || org.organization_name || selectedOrgId,
//       deviceCount: allDevices.length,
//     }
//   }, [selectedOrgId, organizations])

//   // -------------------------
//   // EFFECT #1: fetchOrganizations on mount (keeps your placeholder behavior)
//   // -------------------------
//   useEffect(() => {
//     const fetchOrganizations = async () => {
//       try {
//         setLoading(true)
//         setError(null)
//         // placeholder empty list for now (same behavior you had)
//         // Replace with API call when backend ready:
//         // const token = localStorage.getItem("token")
//         // const res = await fetch(`${BASE}/organization/fetch/hierarchical`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
//         // const data = await res.json()
//         const mockOrgs = []
//         setOrganizations(mockOrgs)
//       } catch (err) {
//         setError(err.message || "Failed to load organizations")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchOrganizations()
//   }, [])

//   // -------------------------
//   // EFFECT #2: keep selectedVenueId synced with URL ?venue=
//   // -------------------------
//   useEffect(() => {
//     const sp = new URLSearchParams(location.search)
//     const venueFromUrl = sp.get("venue") || ""
//     if (venueFromUrl !== selectedVenueId) {
//       setSelectedVenueId(venueFromUrl)
//     }
//     // no dependencies other than location.search so this always runs when URL changes
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [location.search])

//   // -------------------------
//   // EFFECT #3: fetch devices when selectedVenueId changes
//   // -------------------------
//   useEffect(() => {
//     if (!selectedVenueId) {
//       setFreezerDevices([]) // clear when no venue
//       return
//     }


//     let mounted = true
//     let intervalId = null
//     const POLL_MS = 10 * 60 * 1000 // 10 minutes
//     const fetchDevices = async () => {
//       try {
//         const token = localStorage.getItem("token")
//         const res = await fetch(`${BASE}/device/device-by-venue/${selectedVenueId}`, {
//           method: "GET",
//           credentials: "include",
//           headers: {
//             "Content-Type": "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           },
//         })
//         const data = await res.json()
//         if (!mounted) return
//         if (res.ok) {
//           setFreezerDevices(data.devices || [])
//         } else {
//           setFreezerDevices([])
//           console.error("Device fetch error:", data?.message)
//         }
//       } catch (err) {
//         if (!mounted) return
//         console.error("Device fetch error:", err)
//         setFreezerDevices([])
//       }
//     }

//     fetchDevices()

//       // start polling (only if venue present)
//   intervalId = setInterval(() => {
//     fetchDevices()
//   }, POLL_MS)

//     return () => {
//       mounted = false
//     }
//   }, [selectedVenueId])

//   // -------------------------
//   // simple handlers (kept minimal)
//   // -------------------------
//   const handleFreezerDeviceSelect = (deviceId) => {
//     isDesktop && toggleDrawer(true);
//     setSelectedFreezerDeviceId(deviceId)
//   }

//   const handleBackToDashboard = () => {
//     setShowDetailPage(false)
//     setSelectedDevice(null)
//   }

//   // Admin: when org changes, reset venue selection (keeps URL clean)
//   const onOrganizationChange = (id) => {

//      const orgId = id || user?.organization;

//   // If org hasn't changed, don't clear the venue or modify URL
//   if (orgId && String(orgId) === String(selectedOrgId)) {
//     return;
//   }

  
//     setSelectedOrgId(id || user?.organization)
//     setSelectedVenueId("")
//     // remove ?venue from URL
//     const sp = new URLSearchParams(location.search)
//     if (sp.get("venue")) {
//       sp.delete("venue")
//       navigate(location.pathname + (sp.toString() ? `?${sp.toString()}` : ""), { replace: true })
//     }
//   }

//   // Update URL when VenueSelect is used (or you can dispatch to redux)
//   const onVenueChange = (id) => {
//     setSelectedVenueId(id)
//     const basePath = location.pathname.split("?")[0]
//     if (id) navigate(`${basePath}?venue=${id}`, { replace: false })
//     else navigate(basePath, { replace: false })
//   }

//   // -------------------------
//   // render states for loading / error
//   // -------------------------
//   if (loading) {
//     return (
//       <div className="flex w-full flex-row h-full bg-gray-100 font-inter rounded-md overflow-hidden">
//         <div className="flex justify-center items-center w-full h-64">
//           {/* <div className="text-lg text-gray-600">Loading organizations...</div> */}
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="flex w-full flex-col lg:flex-row h-full bg-gray-100  font-inter rounded-md overflow-hidden">
//         <div className="flex flex-col justify-center items-center w-full h-64 space-y-4">
//           {/* <div className="text-lg text-red-600">Error: {error}</div> */}
//         </div>
//       </div>
//     )
//   }


//   // Drawer Component:

//     // 🔥 Shared content for both Desktop and Mobile
// const RightPanelContent = () => {
//   const selected = selectedFreezerDeviceId
//     ? freezerDevices.find((d) => (d._id ?? d.id) === selectedFreezerDeviceId)
//     : null;

//   return (
//      <div className="dashboard-right-panel shadow-sm flex flex-col h-full overflow-y-auto custom-scrollbar p-4 lg:p-6 border-l border-[#E5E7EB]/40 bg-white flex-shrink-0">
//               {selectedFreezerDeviceId ? (
//                 (() => {
//                   const selected = freezerDevices.find((d) => (d._id ?? d.id) === selectedFreezerDeviceId)
//                   return (
//                     <VenueDetailsPanel
//                       venueName={ "Venue"}
//                       freezerTemperature={selected?.AmbientData?.temperature ?? 0}
//                       ambientTemperature={selected?.FreezerData?.temperature ?? 0}
//                       batteryLow={selected?.batteryLow ?? selected?.batteryAlert ?? false}
//                       needMaintenance={selected?.batteryLow ?? false}
//                       apiKey={selected?.apiKey}
//                       chartData={[]}
//                       organizationId={selectedOrgId}
//                     />
//                   )
//                 })()
//               ) : (
//                 <VenueDetailsPanel
//                   venueName={"Venue"}
//                   freezerTemperature={0}
//                   ambientTemperature={0}
//                   batteryLow={true}
//                   needMaintenance={true}
//                   apiKey="8dbf5d2a37c4178b4b03e6c49ae3f9e7"
//                   chartData={[]}
//                   organizationId={selectedOrgId}
//                 />
//               )}
//       </div>
//   );
// };

//   // -------------------------
//   // main JSX (kept same layout)
//   // -------------------------
//   return (
//     <div className="flex w-full flex-row h-full font-inter rounded-md bg-[#F5F6FA]">
//       {/* Main Content Area */}
//       <div className="flex-1 min-w-0 space-y-6 overflow-y-auto custom-scrollbar dashboard-main-content bg-white shadow-sm border border-[#E5E7EB]/30 p-4 lg:p-6">
//         {!showDetailPage && (
//           <>
//             {/* Header */}
//             <div className="flex justify-between items-center mb-6">
//               <div>
//                 <p className="text-sm text-[#64748B] min-w-[250px] font-medium">Organization</p>
//                 {user?.role === "admin" && (
//                   <OrganizationSelect
//                     value={selectedOrgId}
//                     onChange={onOrganizationChange}
//                     className="mt-1"
//                   />
//                 )}
//               </div>

//               <div className="flex items-center">
//                 <VenueSelect
//                   organizationId={selectedOrgId || user?.organization}
//                   value={selectedVenueId}
//                   onChange={onVenueChange}
//                   className="mt-1"
//                   excludeFirstN={user?.role === "user" ? 4 : 0}
//                 />
//               </div>
//             </div>

//             {/* Freezer Device Cards Grid */}
//             <div className="flex-1 min-h-0">
//               <div className="freezer-cards-container custom-scrollbar">
//                 {freezerDevices.length === 0 ? (
//                   <div className="flex flex-col items-center justify-center h-full text-[#64748B]">
//                     <svg className="w-16 h-16 mb-4 text-[#E2E8F0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                     </svg>
//                     <p className="text-lg font-medium">No Freezer Devices Found</p>
//                     <p className="text-sm">Add some freezer devices to get started</p>
//                   </div>
//                 ) : (
//                   <div className="freezer-cards-grid freezer-cards-container">
//                     {freezerDevices.map((device) => (
//                       <FreezerDeviceCard
//                         key={device._id ?? device.id}
//                         deviceId={device.deviceId}
//                         ambientTemperature={device?.AmbientData?.temperature ?? device.ambientTemperature}
//                         freezerTemperature={device?.FreezerData?.temperature ?? device.freezerTemperature}
//                         batteryLow={device?.batteryAlert ?? device?.batteryLow ?? false}
//                         refrigeratorAlert={device?.refrigeratorAlert ?? false}
//                         onCardSelect={() => handleFreezerDeviceSelect(device._id ?? device.id)}
//                         isSelected={(device._id ?? device.id) === selectedFreezerDeviceId}
//                       />
                      
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <AlertsPanel organizationId={selectedOrgId} pollInterval={10 * 60 * 1000} />
//           </>
//         )}

//         {showDetailPage && (
//           <div className="flex-grow overflow-y-auto">
//             {/* simplified detail area: you can re-add OrganizationDetailContent when ready */}
//             <div>Detail page</div>
//             <button onClick={handleBackToDashboard}>Back</button>
//           </div>
//         )}
//       </div>

//       {/* Right Sidebar - Venue Details Panel */}

//       {isDesktop ? (
//       <RightPanelContent />  // Desktop: Fixed right sidebar
//     ) : (
//       <Drawer open={open} onClose={toggleDrawer(false)} anchor="right">
//         <RightPanelContent />  // Mobile: Drawer
//       </Drawer>
//     )}
      


     
//     </div>
//   )
// }
























// src/pages/Dashboard.jsx
"use client"
import React, { useState, useEffect, useMemo } from "react"
import FreezerDeviceCard from "./FreezerDeviceCard"
import VenueDetailsPanel from "./VenueDetailsPanel"
import OrganizationSelect from "./OrganizationSelect"
import VenueSelect from "./VenueSelect"
import AlertsPanel from "./AlertsPanel"
import "../../styles/pages/Dashboard/dashboard-styles.css"
import "../../styles/pages/Dashboard/freezer-cards-responsive.css"
import { useStore } from "../../contexts/storecontexts"
import { useLocation, useNavigate } from "react-router-dom"
import DashboardRightPanel from "../../components/DashboardRightPanel"
import { Drawer, useMediaQuery } from "@mui/material";

const mockFreezerDevices = [
  /* keep if you want placeholder cards when empty; otherwise devices come from API */
]

const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050"

export default function Dashboard() {
  // -------------------------
  // top-level hooks (always called, stable order)
  // -------------------------
  const { user } = useStore()
  const location = useLocation()
  const navigate = useNavigate()

  // -------------------------
  // minimal state for UI
  // -------------------------
  const [organizations, setOrganizations] = useState([])
  const [freezerDevices, setFreezerDevices] = useState(mockFreezerDevices)
  const [selectedFreezerDeviceId, setSelectedFreezerDeviceId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrgId, setSelectedOrgId] = useState("")
  const [selectedVenueId, setSelectedVenueId] = useState("")
  // const [showDetailPage, setShowDetailPage] = useState(false)
  // const [selectedDevice, setSelectedDevice] = useState(null)
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width:768px)");

  // -------------------------
  // helpers (pure utility, no hooks inside)
  // -------------------------
  const getAllDevicesInOrganization = (org) => {
    let devices = [...(org.devices || [])]
    if (org.subOrganizations) {
      org.subOrganizations.forEach((subOrg) => {
        devices = devices.concat(getAllDevicesInOrganization(subOrg))
      })
    }
    return devices
  }
  

  const findOrganizationById = (orgs, id) => {
    for (const org of orgs) {
      if (String(org.id) === String(id) || String(org._id) === String(id)) return org
      if (org.subOrganizations) {
        const found = findOrganizationById(org.subOrganizations, id)
        if (found) return found
      }
    }
    return null
  }

  // -------------------------
  // derived data (no useEffect)
  // -------------------------
  const selectedOrganizationData = useMemo(() => {
    if (!selectedOrgId || organizations.length === 0) return null
    const org = findOrganizationById(organizations, selectedOrgId)
    if (!org) return null
    const allDevices = getAllDevicesInOrganization(org)
    return {
      organizationName: org.name || org.organization_name || selectedOrgId,
      deviceCount: allDevices.length,
    }
  }, [selectedOrgId, organizations])

  // -------------------------
  // EFFECT #1: fetchOrganizations on mount (keeps your placeholder behavior)
  // -------------------------
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true)
        setError(null)
        // placeholder empty list for now (same behavior you had)
        // Replace with API call when backend ready:
        // const token = localStorage.getItem("token")
        // const res = await fetch(`${BASE}/organization/fetch/hierarchical`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
        // const data = await res.json()
        const mockOrgs = []
        setOrganizations(mockOrgs)
      } catch (err) {
        setError(err.message || "Failed to load organizations")
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizations()
  }, [])

  // -------------------------
  // EFFECT #2: keep selectedVenueId synced with URL ?venue=
  // -------------------------
  useEffect(() => {
    const sp = new URLSearchParams(location.search)
    const venueFromUrl = sp.get("venue") || ""
    if (venueFromUrl !== selectedVenueId) {
      setSelectedVenueId(venueFromUrl)
    }
    // no dependencies other than location.search so this always runs when URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  // -------------------------
  // EFFECT #3: fetch devices when selectedVenueId changes
  // -------------------------
  useEffect(() => {
    if (!selectedVenueId) {
      setFreezerDevices([]) // clear when no venue
      return
    }


    let mounted = true
    let intervalId = null
    const POLL_MS = 10 * 60 * 1000 // 10 minutes
    const fetchDevices = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${BASE}/device/device-by-venue/${selectedVenueId}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        const data = await res.json()
        console.log(data.devices);
        
        if (!mounted) return
        if (res.ok) {
          setFreezerDevices(data.devices || [])
        } else {
          setFreezerDevices([])
          console.error("Device fetch error:", data?.message)
        }
      } catch (err) {
        if (!mounted) return
        console.error("Device fetch error:", err)
        setFreezerDevices([])
      }
    }

    fetchDevices()

      // start polling (only if venue present)
  intervalId = setInterval(() => {
    fetchDevices()
  }, POLL_MS)

    return () => {
      mounted = false
    }
  }, [selectedVenueId])

  // -------------------------
  // simple handlers (kept minimal)
  // -------------------------

   const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };


  const handleFreezerDeviceSelect = (deviceId) => {
    console.log("Card Selected")
    setSelectedFreezerDeviceId(deviceId)
  if (!isDesktop) setOpen(true) 
  }

  // const handleBackToDashboard = () => {
  //   // setShowDetailPage(false)
  //   setSelectedDevice(null)
  // }

  // Admin: when org changes, reset venue selection (keeps URL clean)
  const onOrganizationChange = (id) => {

     const orgId = id || user?.organization;

  // If org hasn't changed, don't clear the venue or modify URL
  if (orgId && String(orgId) === String(selectedOrgId)) {
    return;
  }

  
    setSelectedOrgId(id || user?.organization)
    setSelectedVenueId("")
    // remove ?venue from URL
    const sp = new URLSearchParams(location.search)
    if (sp.get("venue")) {
      sp.delete("venue")
      navigate(location.pathname + (sp.toString() ? `?${sp.toString()}` : ""), { replace: true })
    }
  }

  // Update URL when VenueSelect is used (or you can dispatch to redux)
  const onVenueChange = (id) => {
    setSelectedVenueId(id)
    const basePath = location.pathname.split("?")[0]
    if (id) navigate(`${basePath}?venue=${id}`, { replace: false })
    else navigate(basePath, { replace: false })
  }

  

  // -------------------------
  // render states for loading / error
  // -------------------------
  if (loading) {
    return (
      <div className="flex w-full flex-row h-full bg-gray-100 font-inter rounded-md overflow-hidden">
        <div className="flex justify-center items-center w-full h-64">
          {/* <div className="text-lg text-gray-600">Loading organizations...</div> */}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex w-full flex-col lg:flex-row h-full bg-gray-100  font-inter rounded-md overflow-hidden">
        <div className="flex flex-col justify-center items-center w-full h-64 space-y-4">
          {/* <div className="text-lg text-red-600">Error: {error}</div> */}
        </div>
      </div>
    )
  }

  // -------------------------
  // main JSX (kept same layout)
  // -------------------------
  return (
    <div className="flex w-full flex-row h-full font-inter rounded-md bg-[#F5F6FA]">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 space-y-6 overflow-y-auto custom-scrollbar dashboard-main-content bg-white shadow-sm border border-[#E5E7EB]/30 p-4 lg:p-6">
        
          <>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                {/* <p className="text-sm text-[#64748B] min-w-[250px] font-medium">Organization</p> */}
                {user?.role === "admin" && (
                  <OrganizationSelect
                    value={selectedOrgId}
                    onChange={onOrganizationChange}
                    className="mt-1"
                  />
                )}
              </div>

              <div className="flex items-center">
                <VenueSelect
                  organizationId={selectedOrgId || user?.organization}
                  value={selectedVenueId}
                  onChange={onVenueChange}
                  className="mt-1"
                  excludeFirstN={user?.role === "user" ? 4 : 0}
                />
              </div>
            </div>

            {/* Freezer Device Cards Grid */}
            <div className="flex-1 min-h-0">
              <div className="freezer-cards-container custom-scrollbar">
                {freezerDevices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#64748B]">
                    <svg className="w-16 h-16 mb-4 text-[#E2E8F0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-lg font-medium">No Freezer Devices Found</p>
                    <p className="text-sm">Add some freezer devices to get started</p>
                  </div>
                ) : (
                  <div className="freezer-cards-grid freezer-cards-container">
                    {freezerDevices.map((device) => (
                      <FreezerDeviceCard
                        key={device._id ?? device.id}
                        deviceId={device.deviceId}
                        ambientTemperature={device?.AmbientData?.temperature ?? device.ambientTemperature}
                        freezerTemperature={device?.FreezerData?.temperature ?? device.freezerTemperature}
                        batteryLow={device?.batteryAlert ?? device?.batteryLow ?? false}
                        refrigeratorAlert={device?.refrigeratorAlert ?? false}
                        onCardSelect={() => handleFreezerDeviceSelect(device._id ?? device.id)}
                        isSelected={(device._id ?? device.id) === selectedFreezerDeviceId}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <AlertsPanel organizationId={selectedOrgId} pollInterval={10 * 60 * 1000} />
          </>
        {/* )} */}

      </div>

      {/* Right Sidebar - Venue Details Panel */}
      {/* <div className="dashboard-right-panel shadow-sm flex flex-col h-full overflow-y-auto custom-scrollbar p-4 lg:p-6 border-l border-[#E5E7EB]/40 bg-white flex-shrink-0">
        {selectedFreezerDeviceId ? (
          (() => {
            const selected = freezerDevices.find((d) => (d._id ?? d.id) === selectedFreezerDeviceId)
            return (
              <VenueDetailsPanel
                venueName={ "Venue"}
                freezerTemperature={selected?.AmbientData?.temperature ?? 0}
                ambientTemperature={selected?.FreezerData?.temperature ?? 0}
                batteryLow={selected?.batteryLow ?? selected?.batteryAlert ?? false}
                needMaintenance={selected?.batteryLow ?? false}
                apiKey={selected?.apiKey}
                chartData={[]}
                organizationId={selectedOrgId}
              />
            )
          })()
        ) : (
          <VenueDetailsPanel
            venueName={"Venue"}
            freezerTemperature={0}
            ambientTemperature={0}
            batteryLow={true}
            needMaintenance={true}
            apiKey="8dbf5d2a37c4178b4b03e6c49ae3f9e7"
            chartData={[]}
            organizationId={selectedOrgId}
          />
        )}
      </div> */}

{isDesktop ? (
        <DashboardRightPanel
      freezerDevices={freezerDevices}
      selectedFreezerDeviceId={selectedFreezerDeviceId}
      selectedOrgId={selectedOrgId}
      
    />  
    ) : (
      <Drawer open={open} onClose={toggleDrawer(false)} anchor="right">
        <DashboardRightPanel
      freezerDevices={freezerDevices}
      selectedFreezerDeviceId={selectedFreezerDeviceId}
      selectedOrgId={selectedOrgId}
      closeIcon={true}
       onClose={toggleDrawer(false)}
    />
      </Drawer>
    )}
    </div>
  )
}





















