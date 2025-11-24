// // src/components/SidebarRebuilt.jsx
// "use client"
// import React, { useEffect, useState } from "react"
// import { NavLink, useLocation, useNavigate } from "react-router-dom"
// import "../styles/components/Sidebar.css"
// import { useStore } from "../contexts/storecontexts" // adjust path if different
// import Tooltip from "@mui/material/Tooltip";
// import LogoutDialog from "./Modals/LogoutDialog"


// const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050"

// const Icon = ({ src, alt, active, blueSrc }) => (
//   <img src={src} alt={alt} width={24} height={24} className="imageClassForActiveandHover" />
// )




// const SidebarRebuilt = () => {
//   const location = useLocation()
//   const navigate = useNavigate()
//   const { user } = useStore()
//   const [venues, setVenues] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const { LogoutTrue } = useStore();
//   const [logoutOpen, setLogoutOpen] = useState(false);
//   const openLogout = () => setLogoutOpen(true);
//   const closeLogout = () => setLogoutOpen(false);


//   const Adminitems = [
//     { key: "home", label: "Home", link: "/admin/management", icon: "/sidebar-images/1.png", blueIcon: "/sidebar-images-blue/1.svg" },
//     { key: "organization-management", label: "Organization Management", link: "/admin/management/organization", icon: "/sidebar-images/2.png", blueIcon: "/sidebar-images-blue/2.png" },
//     { key: "venue-management", label: "Venue Management", link: "/admin/management/venue", icon: "/sidebar-images/4.png", blueIcon: "/sidebar-images-blue/4.png" },
//     { key: "users-management", label: "Users Management", link: "/admin/management/users", icon: "/sidebar-images/7.png", blueIcon: "/sidebar-images-blue/7.png" },
//     { key: "device-management", label: "Device Management", link: "/admin/management/device", icon: "/sidebar-images/3.png", blueIcon: "/sidebar-images-blue/3.png" },
//     { key: "ota-management", label: "OTA Management", link: "/admin/management/brands", icon: "/sidebar-images/5.png", blueIcon: "/sidebar-images-blue/5.png" },
//   ]


//   useEffect(() => {
//     if (!user || !user.organization || user.role === "admin") return
//     let aborted = false
//     const fetchVenues = async () => {
//       try {
//         setLoading(true)
//         setError(null)
//         const token = localStorage.getItem("token")
//         const res = await fetch(`${BASE}/venue/venue-by-org/${user.organization}`, {
//           method: "GET",
//           credentials: "include",
//           headers: {
//             "Content-Type": "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {})
//           }
//         })
//         const data = await res.json()
//         if (!res.ok) {
//           setError(data?.message || "Failed to fetch venues")
//           setVenues([])
//           return
//         }
//         const arr = Array.isArray(data) ? data : Array.isArray(data?.venues) ? data.venues : []
//         if (!aborted) setVenues(arr)
//       } catch (err) {
//         if (!aborted) {
//           setError(err.message || "Network error")
//           setVenues([])
//         }
//       } finally {
//         if (!aborted) setLoading(false)
//       }
//     }
//     fetchVenues()
//     return () => { aborted = true }
//   }, [user])

//   // compute top 4 (or less)
//   const topVenues = (venues || []).slice(0, 4)

//   // helper to read active venue from URL search
//   const activeVenueFromSearch = () => {
//     try {
//       const sp = new URLSearchParams(location.search)
//       return sp.get("venue") || ""
//     } catch { return "" }
//   }
//   const activeVenue = activeVenueFromSearch()

//   // when clicking a venue: stay on same base path and add ?venue=id
//   const handleVenueClick = (id) => {
//     const basePath = location.pathname.split("?")[0]
//     navigate(`${basePath}?venue=${id}`, { replace: false })
//   }


//   // auto-select first venue for non-admin users when no ?venue= is present
//   useEffect(() => {
//     if (!user || user.role === "admin") return; // only for non-admin users
//     if (loading) return; // wait until venues finished loading
//     try {
//       const sp = new URLSearchParams(location.search);
//       if (sp.get("venue")) return; // already set by URL — don't override
//     } catch (e) {
//       // ignore URL parse issues and continue
//     }

//     const firstVenue = (venues || [])[0] ?? null;
//     if (!firstVenue) return;

//     const firstId = String(firstVenue._id ?? firstVenue.id ?? firstVenue);
//     // replace: true avoids polluting history; user can still click others
//     navigate(`${location.pathname}?venue=${firstId}`, { replace: true });
//   }, [user, loading, venues, location.pathname, location.search, navigate]);

//   const handleConfirmLogout = async () => {
//     try {
//       setLoading(true);
//       await LogoutTrue(true); // pass true if you want the backend call
//       // optional small delay to show spinner briefly
//       navigate("/");
//     } finally {
//       setLoading(false);
//       closeLogout();
//     }
//   };

//   return (
//     <>

//       <div className="sidebar">
//         <div className="sidebar-top">
//           <img src="/logo-half.png" alt="logo" width={48} height={48} />
//         </div>



//         {/* Venues block for non-admin users */}
//         {(user?.role !== "admin") ? (<div className="sidebar-venues mt-4 px-2">
//           <div className="sidebar-track">
//             {loading && <div className="text-xs px-2">Loading venues...</div>}
//             {!loading && topVenues.length === 0 && <div></div>}
//             {topVenues.map((v, idx) => {
//               const id = String(v._id ?? v.id ?? v)
//               const name = v.name ?? v.venue_name ?? id
//               const isActive = id === activeVenue
//               return (

//                 <Tooltip title={name} placement="top">
//                   <span style={{ display: "inline-block" }}>
//                     <button
//                       key={id}
//                       onClick={() => handleVenueClick(id)}
//                       className={`sidebar-icon ${isActive ? "active" : ""} venue-shortcut cursor-pointer `}
//                       title={name}
//                       style={{ display: "flex", alignItems: "center", gap: 8 }}
//                     >
//                       <div className="relative">
//                         <img
//                           src="/venue-icon-sidebar.svg"
//                           alt=""
//                           style={{ height: "25px", width: "25px" }}
//                           className="imageClassForActiveandHover"
//                         />
//                         <p className="absolute bottom-[5px] left-[16px] text-xs">
//                           {(idx + 1).toString().padStart(2, "0")}
//                         </p>
//                       </div>
//                     </button>
//                   </span>
//                 </Tooltip>
//               )
//             })}
//           </div>

//           {error && <div className="text-xs text-red-600 mt-2 px-1">{error}</div>}
//         </div>
//         ) : (
//           <nav className="sidebar-nav">
//             <div className="sidebar-track">
//               {Adminitems.map((item) => {
//                 const active = location.pathname === item.link || (item.key === "home" && location.pathname === "/management")
//                 return (

//                   <Tooltip title={item.label} placement="top">
//                     <span style={{ display: "inline-block" }}>
//                       <NavLink key={item.key} to={item.link} end className={`sidebar-icon ${active ? "active" : ""}`} data-tooltip={item.label}>
//                         {/* <Icon src={item.icon} alt={item.label} active={active} blueSrc={item.blueIcon} /> */}
//                         {/* <img  alt="profile" active={location.pathname === "/management/profile"}  /> */}
//                         {/* <span style={{ display: "inline-block" }}> */}
//                         <Icon src={item.blueIcon} alt={item.label} className="imageClassForActiveandHover" />
//                         {/* </span> */}
//                       </NavLink>
//                     </span>
//                   </Tooltip>
//                 )
//               })}
//             </div>
//           </nav>
//         )}

//         <div className="sidebar-bottom">
//           <div className="sidebar-track">
//             <button onClick={openLogout} type="button" aria-label="Logout" className={`sidebar-icon cursor-pointer`} data-tooltip="Logout"  >
//               <Icon src="/sidebar-images/8.png" alt="profile" />
//             </button>
//           </div>
//         </div>
//       </div>
//       <LogoutDialog
//         open={logoutOpen}
//         onClose={closeLogout}
//         onConfirm={handleConfirmLogout}
//         loading={loading}
//         title="Confirm sign out"
//         description="You are about to sign out. Are you sure you want to continue?"
//       />
//     </>
//   )
// }

// export default SidebarRebuilt




// // src/components/SidebarRebuilt.jsx
// "use client"
// import React, { useEffect, useState } from "react"
// import { NavLink, useLocation, useNavigate } from "react-router-dom"
// import "../styles/components/Sidebar.css"
// import { useStore } from "../contexts/storecontexts"
// import Tooltip from "@mui/material/Tooltip";
// import LogoutDialog from "./Modals/LogoutDialog"
// import { useMediaQuery } from "@mui/material"

// const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050"

// const Icon = ({ src, alt, size = 24, className = "", ...props }) => (
//   <img src={src} alt={alt} width={size} height={size} className={`imageClassForActiveandHover ${className}`.trim()} onError={(e)=>{ e.currentTarget.src = "/sidebar-images/placeholder.png" }} {...props} />
// )

// const MobDashMenu = ({ items = [], onItemClick, activePath, openLogout, activeVenue=null }) => {
//   return (
//     <div
//       className="bg-[#E8EDF2]  left-1/2 transform -translate-x-1/2 px-3 flex items-center justify-around rounded-t-[35px] fixed bottom-0 z-30 pt-1"
//       role="navigation"
//       aria-label="Mobile bottom navigation"
//     >
//       {items.map((it) => {
//       //  const isActive = it.venueId
//       //     ? (activeVenue === it.venueId)
//       //     : (activePath === it.link || activePath.startsWith(it.link));

//            const isActive = location.pathname === it.link || (it.key === "home" && location.pathname === "/management");
           
//         return (
//           <Tooltip key={it.key} title={it.label} placement="top">
//              <span style={{ display: "inline-block" }}>
//           <NavLink
//             to={it.link || "#"} 
//             className={`full  h-[45px] w-[45px] flex items-center justify-center sidebar-icon  ${isActive ? "active" : ""}`}
//             aria-label={it.label}
//             >
//             <Icon src={it.icon} alt={it.label} size={28}  className="imageClassForActiveandHover"/>
            
//           </NavLink>
//           </span>
//           </Tooltip>
//       )
//       })}
//       <button onClick={openLogout} aria-label="Logout" className="p-2 rounded-full bg-white/10">
//               <img src="/sidebar-images/8.png" alt="Logout" width={28} height={28} />
//       </button>
//     </div>
//   )
// }

// const SidebarRebuilt = () => {
//   const location = useLocation()
//   const navigate = useNavigate()
//   const { user, LogoutTrue } = useStore()
//   const [venues, setVenues] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const [logoutOpen, setLogoutOpen] = useState(false)
//   const openLogout = () => setLogoutOpen(true)
//   const closeLogout = () => setLogoutOpen(false)
//   const isMobile = useMediaQuery("(max-width:759px)")

//   const Adminitems = [
//     { key: "home", label: "Home", link: "/admin/management", icon: "/sidebar-images/1.png", blueIcon: "/sidebar-images-blue/1.svg" },
//     { key: "organization-management", label: "Organization Management", link: "/admin/management/organization", icon: "/sidebar-images/2.png", blueIcon: "/sidebar-images-blue/2.png" },
//     { key: "venue-management", label: "Venue Management", link: "/admin/management/venue", icon: "/sidebar-images/4.png", blueIcon: "/sidebar-images-blue/4.png" },
//     { key: "users-management", label: "Users Management", link: "/admin/management/users", icon: "/sidebar-images/7.png", blueIcon: "/sidebar-images-blue/7.png" },
//     { key: "device-management", label: "Device Management", link: "/admin/management/device", icon: "/sidebar-images/3.png", blueIcon: "/sidebar-images-blue/3.png" },
//     { key: "ota-management", label: "OTA Management", link: "/admin/management/brands", icon: "/sidebar-images/5.png", blueIcon: "/sidebar-images-blue/5.png" },
//   ]

//   useEffect(() => {
//     if (!user || !user.organization || user.role === "admin") return
//     let aborted = false
//     const fetchVenues = async () => {
//       try {
//         setLoading(true)
//         setError(null)
//         const token = localStorage.getItem("token")
//         const res = await fetch(`${BASE}/venue/venue-by-org/${user.organization}`, {
//           method: "GET",
//           credentials: "include",
//           headers: {
//             "Content-Type": "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {})
//           }
//         })
//         const data = await res.json()
//         if (!res.ok) {
//           setError(data?.message || "Failed to fetch venues")
//           setVenues([])
//           return
//         }
//         const arr = Array.isArray(data) ? data : Array.isArray(data?.venues) ? data.venues : []
//         if (!aborted) setVenues(arr)
//       } catch (err) {
//         if (!aborted) {
//           setError(err.message || "Network error")
//           setVenues([])
//         }
//       } finally {
//         if (!aborted) setLoading(false)
//       }
//     }
//     fetchVenues()
//     return () => { aborted = true }
//   }, [user])

//   const topVenues = (venues || []).slice(0, 4)

//   const activeVenueFromSearch = () => {
//     try {
//       const sp = new URLSearchParams(location.search)
//       return sp.get("venue") || ""
//     } catch { return "" }
//   }
//   const activeVenue = activeVenueFromSearch()

//   const handleVenueClick = (id) => {
//     const basePath = location.pathname.split("?")[0]
//     navigate(`${basePath}?venue=${id}`, { replace: false })
//   }

//   useEffect(() => {
//     if (!user || user.role === "admin") return
//     if (loading) return
//     try {
//       const sp = new URLSearchParams(location.search)
//       if (sp.get("venue")) return
//     } catch {}
//     const firstVenue = (venues || [])[0] ?? null
//     if (!firstVenue) return
//     const firstId = String(firstVenue._id ?? firstVenue.id ?? firstVenue)
//     navigate(`${location.pathname}?venue=${firstId}`, { replace: true })
//   }, [user, loading, venues, location.pathname, location.search, navigate])

//   const handleConfirmLogout = async () => {
//     try {
//       setLoading(true)
//       await LogoutTrue(true)
//       navigate("/")
//     } finally {
//       setLoading(false)
//       closeLogout()
//     }
//   }

//   const mobileItemsForAdmin = Adminitems.map(it => ({ key: it.key, label: it.label, link: it.link, icon: it.blueIcon }))
//   // const mobileItemsForUser = topVenues.map((v, idx) => {
//   //   const id = String(v._id ?? v.id ?? v)
//   //   const label = v.name ?? v.venue_name ?? `Venue ${idx + 1}`
//   //   return {
//   //     key: `venue-${id}`,
//   //     label,
//   //     link: `${location.pathname}?venue=${id}`,
//   //     icon: "/venue-icon-sidebar.svg",
//   //     venueId: id
//   //   }
//   // })

//   const mobileItemsForUser = topVenues.length
//   ? topVenues.map((v, idx) => ({
//       key: `venue-${v._id ?? v.id ?? v}`,
//       label: v.name ?? v.venue_name ?? `Venue ${idx + 1}`,
//       link: `${location.pathname}?venue=${String(v._id ?? v.id ?? v)}`,
//       icon: "/venue-icon-sidebar.svg",
//       venueId: String(v._id ?? v.id ?? v)
//     }))
//   : [{ key: "no-venues", label: "Home", link: "/", icon: "/sidebar-images/1.png" }]


//   const mobileOnItemClick = (item) => {
//     if (item.venueId) {
//       handleVenueClick(item.venueId)
//       return true
//     }
//     return false
//   }

//   const activePath = location.pathname

//   return (
//     <>
//       {/* Desktop sidebar */}
//       {!isMobile && (
//         <div className="sidebar">
//           <div className="sidebar-top">
//             <img src="/logo-half.png" alt="logo" width={48} height={48} />
//           </div>

//           {/* Non-admin: venues */}
//           {(user?.role !== "admin") ? (
//             <div className="sidebar-venues mt-4 px-2">
//               <div className="sidebar-track">
//                 {loading && <div className="text-xs px-2">Loading venues...</div>}
//                 {!loading && topVenues.length === 0 && <div></div>}
//                 {topVenues.map((v, idx) => {
//                   const id = String(v._id ?? v.id ?? v)
//                   const name = v.name ?? v.venue_name ?? id
//                   const isActive = id === activeVenue
//                   return (
//                     <Tooltip key={id} title={name} placement="top">
//                       <span style={{ display: "inline-block" }}>
//                         <button
//                           onClick={() => handleVenueClick(id)}
//                           className={`sidebar-icon ${isActive ? "active" : ""} venue-shortcut cursor-pointer`}
//                           title={name}
//                           style={{ display: "flex", alignItems: "center", gap: 8 }}
//                         >
//                           <div className="relative">
//                             <img
//                               src="/venue-icon-sidebar.svg"
//                               alt=""
//                               style={{ height: "25px", width: "25px" }}
//                               className="imageClassForActiveandHover"
//                             />
//                             <p className="absolute bottom-[5px] left-[16px] text-xs">
//                               {(idx + 1).toString().padStart(2, "0")}
//                             </p>
//                           </div>
//                         </button>
//                       </span>
//                     </Tooltip>
//                   )
//                 })}
//               </div>
//               {/* {error && <div className="text-xs text-red-600 mt-2 px-1">{error}</div>} */}
//             </div>
//           ) : (
//             <nav className="sidebar-nav">
//               <div className="sidebar-track">
//                 {Adminitems.map((item) => {
//                   const active = location.pathname === item.link || (item.key === "home" && location.pathname === "/management")
//                   return (
//                     // <Tooltip key={item.key} title={item.label} placement="top">
//                     //   <span style={{ display: "inline-block" }}>
//                     //     <NavLink key={item.key} to={item.link} end className={`sidebar-icon ${active ? "active" : ""}`} data-tooltip={item.label}>
//                     //       <Icon src={active ? item.blueIcon || item.icon : item.icon} alt={item.label} />
//                     //     </NavLink>
//                     //   </span>
//                     // </Tooltip>
//                                       <Tooltip key={item.key} title={item.label} placement="top">
//                     <span style={{ display: "inline-block" }}>
//                       <NavLink  to={item.link} end className={`sidebar-icon ${active ? "active" : ""}`} data-tooltip={item.label}  aria-label={item.label}>
//                         {/* <Icon src={item.icon} alt={item.label} active={active} blueSrc={item.blueIcon} /> */}
//                         {/* <img  alt="profile" active={location.pathname === "/management/profile"}  /> */}
//                         {/* <span style={{ display: "inline-block" }}> */}
//                         <Icon src={item.blueIcon} alt={item.label} className="imageClassForActiveandHover" />
//                         {/* </span> */}
//                       </NavLink>
//                     </span>
//                   </Tooltip>
//                   )
//                 })}
//               </div>
//             </nav>
//           )}

//           <div className="sidebar-bottom">
//             <div className="sidebar-track">
//               <button onClick={openLogout} type="button" aria-label="Logout" className={`sidebar-icon cursor-pointer`} data-tooltip="Logout">
//                 <Icon src="/sidebar-images/8.png" alt="profile" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Mobile bottom nav */}
//       {isMobile && (
//         <>
//           <MobDashMenu
//             items={user?.role === "admin" ? mobileItemsForAdmin : mobileItemsForUser}
//             onItemClick={mobileOnItemClick}
//             activePath={activePath}
//             openLogout={openLogout}
//             activeVenue={activeVenue}
//           />
          
//         </>
//       )}

//       <LogoutDialog
//         open={logoutOpen}
//         onClose={closeLogout}
//         onConfirm={handleConfirmLogout}
//         loading={loading}
//         title="Confirm sign out"
//         description="You are about to sign out. Are you sure you want to continue?"
//       />
//     </>
//   )
// }

// export default SidebarRebuilt








// src/components/SidebarRebuilt.jsx
"use client"
import React, { useEffect, useState } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import "../styles/components/Sidebar.css"
import { useStore } from "../contexts/storecontexts"
import Tooltip from "@mui/material/Tooltip";
import LogoutDialog from "./Modals/LogoutDialog"
import { useMediaQuery } from "@mui/material"

const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050"

const Icon = ({ src, alt, size = 24, className = "", ...props }) => (
  <img
    src={src}
    alt={alt}
    width={size}
    height={size}
    className={`imageClassForActiveandHover ${className}`.trim()}
    onError={(e) => { e.currentTarget.src = "/sidebar-images/placeholder.png" }}
    {...props}
  />
)

const MobDashMenu = ({ items = [], onItemClick, activePath = "/", openLogout, activeVenue = null }) => {
  return (
    <div
      className="bg-[#E8EDF2] left-1/2 transform -translate-x-1/2 px-3 flex items-center justify-around rounded-t-[35px] fixed bottom-0 z-30 pt-1"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      {items.map((it) => {
        const isVenueItem = !!it.venueId

        // mirror desktop logic:
        // - if it's a venue item, compare by activeVenue
        // - otherwise consider exact match or startsWith, and also the special home-case
        //  const isActive = isVenueItem
        //   ? (String(activeVenue) === String(it.venueId))
        //   : (
        //       activePath === it.link
        //       || (it.key === "home" && activePath === "/management") // same special-case as desktop
        //       || (it.link && activePath.startsWith(it.link))
        //     )

        // inside MobDashMenu map
const isActive = isVenueItem
  ? String(activeVenue) === String(it.venueId)
  : (() => {
      // Normalize values to strings
      const path = String(activePath || "").replace(/\/+$/, ""); // remove trailing slash
      const link = String(it.link || "").replace(/\/+$/, "");

      // special non-admin login case you had before
      if (it.key === "home" && path === "/management") return true;

      // If this is the home item: only exact match (avoid startsWith)
      if (it.key === "home") {
        return path === link;
      }

      // Otherwise allow exact or prefix match for deeper routes
      return path === link || (link && path.startsWith(link));
    })();

    
          // console.log("isVenueItem", isVenueItem)
        return (
          <Tooltip key={it.key} title={it.label} placement="top">
            <span style={{ display: "inline-block" }}>
              <NavLink
                to={it.link || "#"}
                onClick={(e) => {
                  if (onItemClick) {
                    const prevent = onItemClick(it)
                    if (prevent === true) e.preventDefault()
                    }
                }}
                key={it.key}
                end  className={() => `h-[45px] w-[45px] flex items-center justify-center sidebar-icon ${isActive ? "active" : ""}`}
                // className={`h-[45px] w-[45px] flex items-center justify-center  ${isActive ? "active" : ""}`}
                aria-label={it.label}
                aria-current={isActive ? "page" : undefined}
                title={it.label}
              >
                <Icon src={it.icon} alt={it.label} size={28}   className="imageClassForActiveandHover" />
              </NavLink>
            </span> 
          </Tooltip>
        )
      })}

      <button onClick={openLogout} aria-label="Logout" title="Logout" className="p-2 rounded-full bg-white/10">
        <img src="/sidebar-images/8.png" alt="Logout" width={28} height={28} />
      </button>
    </div>
  )
}


const ebuilt = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, LogoutTrue } = useStore()
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const openLogout = () => setLogoutOpen(true)
  const closeLogout = () => setLogoutOpen(false)
  const isMobile = useMediaQuery("(max-width:759px)")

  const Adminitems = [
    { key: "home", label: "Home", link: "/admin/management", icon: "/sidebar-images/1.png", blueIcon: "/sidebar-images-blue/1.svg" },
    { key: "organization-management", label: "Organization Management", link: "/admin/management/organization", icon: "/sidebar-images/2.png", blueIcon: "/sidebar-images-blue/2.png" },
    { key: "venue-management", label: "Venue Management", link: "/admin/management/venue", icon: "/sidebar-images/4.png", blueIcon: "/sidebar-images-blue/4.png" },
    { key: "users-management", label: "Users Management", link: "/admin/management/users", icon: "/sidebar-images/7.png", blueIcon: "/sidebar-images-blue/7.png" },
    { key: "device-management", label: "Device Management", link: "/admin/management/device", icon: "/sidebar-images/3.png", blueIcon: "/sidebar-images-blue/3.png" },
    { key: "ota-management", label: "OTA Management", link: "/admin/management/brands", icon: "/sidebar-images/5.png", blueIcon: "/sidebar-images-blue/5.png" },
  ]

  useEffect(() => {
    if (!user || !user.organization || user.role === "admin") return
    let aborted = false
    const fetchVenues = async () => {
      try {
        setLoading(true)
        setError(null)
        const token = localStorage.getItem("token")
        const res = await fetch(`${BASE}/venue/venue-by-org/${user.organization}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data?.message || "Failed to fetch venues")
          setVenues([])
          return
        }
        const arr = Array.isArray(data) ? data : Array.isArray(data?.venues) ? data.venues : []
        if (!aborted) setVenues(arr)
      } catch (err) {
        if (!aborted) {
          setError(err.message || "Network error")
          setVenues([])
        }
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    fetchVenues()
    return () => { aborted = true }
  }, [user])

  const topVenues = (venues || []).slice(0, 4)

  const activeVenueFromSearch = () => {
    try {
      const sp = new URLSearchParams(location.search)
      return sp.get("venue") || ""
    } catch { return "" }
  }
  const activeVenue = activeVenueFromSearch()

  const handleVenueClick = (id) => {
    const basePath = location.pathname.split("?")[0]
    navigate(`${basePath}?venue=${id}`, { replace: false })
  }

  useEffect(() => {
    if (!user || user.role === "admin") return
    if (loading) return
    try {
      const sp = new URLSearchParams(location.search)
      if (sp.get("venue")) return
    } catch {}
    const firstVenue = (venues || [])[0] ?? null
    if (!firstVenue) return
    const firstId = String(firstVenue._id ?? firstVenue.id ?? firstVenue)
    navigate(`${location.pathname}?venue=${firstId}`, { replace: true })
  }, [user, loading, venues, location.pathname, location.search, navigate])

  const handleConfirmLogout = async () => {
    try {
      setLoading(true)
      await LogoutTrue(true)
      navigate("/")
    } finally {
      setLoading(false)
      closeLogout()
    }
  }

  // mobile items
  // const mobileItemsForAdmin = Adminitems.map(it => ({ key: it.key, label: it.label, link: it.link, icon: it.blueIcon }))
  const mobileItemsForAdmin = Adminitems.map(it => ({ key: it.key, label: it.label, link: it.link, icon: it.blueIcon }));
  const mobileItemsForUser = topVenues.length
    ? topVenues.map((v, idx) => {
        const id = String(v._id ?? v.id ?? v)
        return {
          key: `venue-${id}`,
          label: v.name ?? v.venue_name ?? `Venue ${idx + 1}`,
          link: `${location.pathname}?venue=${id}`,
          icon: "/venue-icon-sidebar.svg",
          venueId: id
        }
      })
    : [{ key: "no-venues", label: "Home", link: "/", icon: "/sidebar-images/1.png" }]

    // console.log("mobileItemsForUser", mobileItemsForUser)

  const mobileOnItemClick = (item) => {
    if (item.venueId) {
      handleVenueClick(item.venueId)
      return true
    }
    return false
  }

  const activePath = location.pathname

  return (
    <>
      {/* Desktop sidebar (unchanged behavior) */}
      {!isMobile && (
        <div className="sidebar">
          <div className="sidebar-top">
            <img src="/logo-half.png" alt="logo" width={48} height={48} />
          </div>

          {(user?.role !== "admin") ? (
            <div className="sidebar-venues mt-4 px-2">
              <div className="sidebar-track">
                {/* {loading && <div className="text-xs px-2">Loading venues...</div>} */}
                {!loading && topVenues.length === 0 && <div></div>}
                {topVenues.map((v, idx) => {
                  const id = String(v._id ?? v.id ?? v)
                  const name = v.name ?? v.venue_name ?? id
                  const isActive = id === activeVenue
                  return (
                    <Tooltip key={id} title={name} placement="top">
                      <span style={{ display: "inline-block" }}>
                        <button
                          onClick={() => handleVenueClick(id)}
                          className={`sidebar-icon ${isActive ? "active" : ""} venue-shortcut cursor-pointer`}
                          title={name}
                          style={{ display: "flex", alignItems: "center", gap: 8 }}
                        >
                          <div className="relative">
                            <img
                              src="/venue-icon-sidebar.svg"
                              alt=""
                              style={{ height: "25px", width: "25px" }}
                              className="imageClassForActiveandHover"
                            />
                            <p className="absolute bottom-[5px] left-[16px] text-xs text-white">
                              {(idx + 1).toString().padStart(2, "0")}
                            </p>
                          </div>
                        </button>
                      </span>
                    </Tooltip>
                  )
                })}
              </div>
              {/* {error && <div className="text-xs text-red-600 mt-2 px-1">{error}</div>} */}
            </div>
          ) : (
            <nav className="sidebar-nav">
              <div className="sidebar-track">
                {Adminitems.map((item) => {
                  const active = location.pathname === item.link || (item.key === "home" && location.pathname === "/management")
                  return (
                    <Tooltip key={item.key} title={item.label} placement="top">
                      <span style={{ display: "inline-block" }}>
                        <NavLink to={item.link} end className={`sidebar-icon ${active ? "active" : ""}`} data-tooltip={item.label} aria-label={item.label}>
                          <Icon src={item.blueIcon}  alt={item.label} className="imageClassForActiveandHover" />
                        </NavLink>
                      </span>
                    </Tooltip>
                  )
                })}
              </div>
            </nav>
          )}

          <div className="sidebar-bottom">
            <div className="sidebar-track">
              <button onClick={openLogout} type="button" aria-label="Logout" className={`sidebar-icon cursor-pointer`} data-tooltip="Logout">
                <Icon src="/sidebar-images/8.png" alt="profile" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav (fixed) */}
      {isMobile && (!loading || user?.role === 'admin') && (
        <>
        <MobDashMenu
          items={user?.role === "admin" ? mobileItemsForAdmin : mobileItemsForUser}
          onItemClick={mobileOnItemClick}
          activePath={location.pathname}
          openLogout={openLogout}
          activeVenue={activeVenue}
        />

        </>
      )}

      <LogoutDialog
        open={logoutOpen}
        onClose={closeLogout}
        onConfirm={handleConfirmLogout}
        loading={loading}
        title="Confirm sign out"
        description="You are about to sign out. Are you sure you want to continue?"
      />
    </>
  )
}

export default ebuilt
