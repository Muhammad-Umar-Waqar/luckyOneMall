// src/Routes/PublicRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../contexts/storecontexts';

/**
 * Wrap public pages (Login, Forgot etc).
 * If user is logged in, redirect them to their proper dashboard.
 */
export default function PublicRoute({ children }) {
  const { isLoggedIn, user } = useStore();

  if (isLoggedIn) {
    // redirect based on role
    if (user?.role === 'admin') return <Navigate to="/admin/management" replace />;
    return <Navigate to="/management" replace />;
  }

  // not logged in -> render public app (App must render <Outlet/> for nested pages)
  return <>{children}</>;
}
