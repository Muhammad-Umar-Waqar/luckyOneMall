// src/Routes/AdminRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../contexts/storecontexts";

const AdminRoute = () => {
  const { isLoggedIn, user, loading, hasRole } = useStore();

  if (loading) return null; // or a spinner UI

  if (!isLoggedIn) return <Navigate to="/" replace />;

  // Prefer using hasRole helper
  if (!hasRole("admin")) return <Navigate to="/management" replace />;

  return <Outlet />;
};

export default AdminRoute;

