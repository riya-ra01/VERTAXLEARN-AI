import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as coursesService from "../../services/courses.service";
import * as lessonsService from "../../services/lessons.service";
import type { Course } from "../../services/courses.service";
import type { Lesson } from "../../services/lessons.service";
import Spinner from "../../components/common/Spinner";
import ProgressBar from "../../components/common/ProgressBar";
import LessonSidebar from "./LessonSidebar";
import LessonContent from "./LessonContent";

const CoursePlayerPage = () => {
  const { slug, lessonId } = useParams<{ slug: string; lessonId?: string }>();
  const navigate = useNavigate();

  const [course,          setCourse]          = useState<Course | null>(null);
  const [lessons,         setLessons]         = useState<Lesson[]>([]);
  const [activeLesson,    setActiveLesson]     = useState<Lesson | null>(null);
  const [completedIds,    setCompletedIds]     = useState<Set<string>>(new Set());
  const [loading,         setLoading]          = useState(true);
  const [error,           setError]            = useState("");

  const loadCourse = useCallback(async () => {
    if (!slug) return;
    try {
      const [courseRes] = await Promise.all([
        coursesService.getCourse(slug),
        // parallel fetch placeholder — lessons fetched after courseId is known
        coursesService.getCourse(slug),
      ]);
      const c = courseRes.data.data;
      setCourse(c);
      const lr = await lessonsService.listLessons(c.id);
      const ls = lr.data.data;
      setLessons(ls);

      // Set active lesson from URL param or first lesson
      const target = lessonId ? ls.find((l) => l.id === lessonId) : ls[0];
      setActiveLesson(target ?? ls[0] ?? null);
    } catch {
      setError("Failed to load course.");
    } finally {
      setLoading(false);
    }
  }, [slug, lessonId]);

  useEffect(() => { void loadCourse(); }, [loadCourse]);

  const markComplete = (lessonId: string) => {
    setCompletedIds((prev) => new Set([...prev, lessonId]));
  };

  const goToNext = () => {
    if (!activeLesson) return;
    const idx = lessons.findIndex((l) => l.id === activeLesson.id);
    if (idx < lessons.length - 1) {
      const next = lessons[idx + 1];
      setActiveLesson(next);
      navigate(`/courses/${slug}/learn/${next.id}`);
    }
  };

  const progress = lessons.length > 0
    ? Math.round((completedIds.size / lessons.length) * 100)
    : 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (error)   return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top bar */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(`/courses/${slug}`)}
          className="text-gray-400 hover:text-white text-sm"
        >
          ← Back
        </button>
        <h1 className="text-white font-semibold truncate flex-1">{course?.title}</h1>
        <div className="w-48">
          <ProgressBar value={progress} label={`${completedIds.size}/${lessons.length} lessons`} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <LessonSidebar
          lessons={lessons}
          activeLesson={activeLesson}
          completedIds={completedIds}
          onSelect={(l) => { setActiveLesson(l); navigate(`/courses/${slug}/learn/${l.id}`); }}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {activeLesson ? (
            <LessonContent
              lesson={activeLesson}
              isCompleted={completedIds.has(activeLesson.id)}
              onComplete={() => markComplete(activeLesson.id)}
              onNext={goToNext}
              hasNext={lessons.findIndex((l) => l.id === activeLesson.id) < lessons.length - 1}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a lesson to begin
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CoursePlayerPage;
