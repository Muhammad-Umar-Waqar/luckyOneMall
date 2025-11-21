import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../contexts/storecontexts";

const UserRoute = () => {
  const { isLoggedIn, user  } = useStore();

  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (user?.role !== "user") return <Navigate to="/admin/management" replace />;

  return <Outlet />;
};

export default UserRoute;
