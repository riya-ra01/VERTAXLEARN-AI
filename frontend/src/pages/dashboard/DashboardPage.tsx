import { useEffect, useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import { useAuthStore } from "../../store/auth.store";
import StatsCard from "../../components/student/StatsCard";
import EnrolledCourseCard from "../../components/student/EnrolledCourseCard";
import Spinner from "../../components/common/Spinner";
import { Link } from "react-router-dom";
import * as coursesService from "../../services/courses.service";
import type { Enrollment } from "../../services/courses.service";

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    coursesService.getMyEnrollments()
      .then(({ data }) => setEnrollments(data.data))
      .catch(() => {/* user might not be enrolled in anything yet */})
      .finally(() => setLoading(false));
  }, []);

  const completed = enrollments.filter((e) => e.status === "completed").length;
  const active    = enrollments.filter((e) => e.status === "active").length;

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your learning today.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatsCard title="Enrolled Courses"  value={enrollments.length} icon="📚" color="bg-blue-50" />
        <StatsCard title="In Progress"       value={active}             icon="⏳" color="bg-yellow-50" />
        <StatsCard title="Completed"         value={completed}          icon="🏆" color="bg-green-50" />
      </div>

      {/* My Courses */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">My Courses</h2>
          <Link to="/courses" className="text-sm text-primary-600 hover:underline">
            Browse catalog →
          </Link>
        </div>

        {loading ? (
          <div className="py-10"><Spinner /></div>
        ) : enrollments.length === 0 ? (
          <div className="py-10 text-center bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-4xl mb-3">🎓</p>
            <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
            <Link
              to="/courses"
              className="inline-block px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {enrollments.slice(0, 6).map((e) => (
              <EnrolledCourseCard key={e.id} enrollment={e} />
            ))}
          </div>
        )}
      </section>

      {/* Quick actions for instructor */}
      {user?.role === "instructor" && (
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Instructor Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Create Course",  icon: "➕", to: "/courses/new" },
              { label: "My Courses",     icon: "📋", to: "/courses/mine" },
              { label: "Student Progress", icon: "📊", to: "/instructor/progress" },
            ].map(({ label, icon, to }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all"
              >
                <span className="text-2xl">{icon}</span>
                <span className="font-medium text-gray-700">{label}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </AppLayout>
  );
};

export default DashboardPage;
