import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import * as authService from "../services/auth.service";

interface Props { children: ReactNode }

const AppLayout = ({ children }: Props) => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-bold text-primary-700">
          VertexLearn AI
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/courses"   className="text-sm text-gray-600 hover:text-primary-600">Courses</Link>
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-primary-600">Dashboard</Link>
          {user?.role === "admin" && (
            <Link to="/admin" className="text-sm text-gray-600 hover:text-primary-600">Admin</Link>
          )}
          <div className="flex items-center gap-3 ml-4">
            <span className="text-sm font-medium text-gray-700">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      {/* Page content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
};

export default AppLayout;
