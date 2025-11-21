import React from 'react'
import { Outlet } from 'react-router'

const DashboardRoute = () => {
  return (
    <div className="w-full h-screen">
      <Outlet />
    </div>
  )
}

export default DashboardRoute
