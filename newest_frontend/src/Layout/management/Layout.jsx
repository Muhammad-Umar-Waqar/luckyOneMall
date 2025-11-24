"use client"
import { Outlet } from "react-router"
import Sidebar from "../../components/SidebarRebuilt"

const ManagementLayout = () => {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-row bg-[#F5F6FA] font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area with light grey-blue background */}
      <main className="z-10 flex-1 overflow-auto md:pr-6 bg-white">
        {/* Main content area */}
        <div className="MainContentArea h-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default ManagementLayout;
