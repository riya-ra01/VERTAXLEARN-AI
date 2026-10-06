import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Auth
import LoginPage    from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

// App pages
import DashboardPage    from "../pages/dashboard/DashboardPage";
import CourseCatalog    from "../pages/course-catalog/CourseCatalogPage";
import CourseDetailPage from "../pages/course-catalog/CourseDetailPage";
import CoursePlayerPage from "../pages/course-player/CoursePlayerPage";
import QuizPage         from "../pages/quizzes/QuizPage";
import AdminPanelPage   from "../pages/admin-panel/AdminPanelPage";

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/register"       element={<RegisterPage />} />
      <Route path="/courses"        element={<CourseCatalog />} />
      <Route path="/courses/:slug"  element={<CourseDetailPage />} />

      {/* Authenticated — any role */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard"                              element={<DashboardPage />} />
        <Route path="/courses/:slug/learn"                   element={<CoursePlayerPage />} />
        <Route path="/courses/:slug/learn/:lessonId"         element={<CoursePlayerPage />} />
        <Route path="/courses/:courseId/quizzes/:quizId"     element={<QuizPage />} />
      </Route>

      {/* Admin only */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/*" element={<AdminPanelPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
