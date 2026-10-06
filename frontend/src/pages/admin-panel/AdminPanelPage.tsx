import { Routes, Route, NavLink } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import AdminUsersTab   from "./AdminUsersTab";
import AdminCoursesTab from "./AdminCoursesTab";
import AdminStatsTab   from "./AdminStatsTab";

const tabs = [
  { label: "📊 Stats",   to: "/admin" },
  { label: "👥 Users",   to: "/admin/users" },
  { label: "📚 Courses", to: "/admin/courses" },
];

const AdminPanelPage = () => (
  <AppLayout>
    <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h1>

    {/* Tab nav */}
    <nav className="flex gap-2 mb-8 border-b border-gray-200">
      {tabs.map(({ label, to }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/admin"}
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors
            ${isActive
              ? "border-primary-600 text-primary-700"
              : "border-transparent text-gray-500 hover:text-gray-700"}`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>

    <Routes>
      <Route index          element={<AdminStatsTab />} />
      <Route path="users"   element={<AdminUsersTab />} />
      <Route path="courses" element={<AdminCoursesTab />} />
    </Routes>
  </AppLayout>
);

export default AdminPanelPage;
