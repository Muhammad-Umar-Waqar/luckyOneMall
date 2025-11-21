// src/Routes/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../contexts/storecontexts";

const ProtectedRoute = () => {
  const { isLoggedIn, loading } = useStore();

  // while verifying session, render nothing (or a spinner component)
  if (loading) return null; // or return <Spinner />;

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
