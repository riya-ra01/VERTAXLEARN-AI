import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { useAuthStore } from "../../store/auth.store";
import * as coursesService from "../../services/courses.service";
import type { Course } from "../../services/courses.service";

const CourseDetailPage = () => {
  const { slug }   = useParams<{ slug: string }>();
  const navigate   = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [course,    setCourse]    = useState<Course | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled,  setEnrolled]  = useState(false);
  const [error,     setError]     = useState("");

  useEffect(() => {
    if (!slug) return;
    coursesService.getCourse(slug)
      .then(({ data }) => setCourse(data.data))
      .catch(() => setError("Course not found."))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleEnroll = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (!course) return;
    setEnrolling(true);
    try {
      await coursesService.enrollInCourse(course.id);
      setEnrolled(true);
    } catch {
      setError("Enrollment failed. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <AppLayout><div className="py-20"><Spinner size="lg" /></div></AppLayout>;
  if (error || !course) return <AppLayout><div className="py-20 text-center text-red-500">{error || "Course not found"}</div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary-900 to-primary-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex gap-2 mb-3 flex-wrap">
            {course.category_name && <Badge color="blue">{course.category_name}</Badge>}
            {course.level && <Badge color="gray">{course.level}</Badge>}
          </div>
          <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
          {course.description && <p className="text-primary-100 text-lg">{course.description}</p>}
          <p className="mt-4 text-primary-200 text-sm">by {course.instructor_name}</p>
        </div>

        {/* Enroll panel */}
        <div className="flex items-center gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div>
            <p className="text-3xl font-bold text-primary-700">
              {course.is_free ? "Free" : `$${parseFloat(course.price).toFixed(2)}`}
            </p>
            {course.duration_mins && (
              <p className="text-sm text-gray-400 mt-1">{course.duration_mins} min total</p>
            )}
          </div>
          <div className="ml-auto">
            {enrolled ? (
              <Button variant="secondary" onClick={() => navigate(`/courses/${slug}/learn`)}>
                Go to Course →
              </Button>
            ) : (
              <Button loading={enrolling} onClick={() => void handleEnroll()}>
                {isAuthenticated ? "Enroll Now" : "Sign in to Enroll"}
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        {course.description && (
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">About this course</h2>
            <p className="text-gray-600 leading-relaxed">{course.description}</p>
          </section>
        )}
      </div>
    </AppLayout>
  );
};

export default CourseDetailPage;
