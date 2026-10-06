import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

interface Props {
  allowedRoles?: string[];
}

/** Redirects unauthenticated users to /login. Optionally restricts by role. */
const ProtectedRoute = ({ allowedRoles }: Props) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
