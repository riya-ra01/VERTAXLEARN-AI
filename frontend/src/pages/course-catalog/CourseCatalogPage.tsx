import { useState, useEffect, useCallback } from "react";
import AppLayout from "../../layouts/AppLayout";
import CourseCard from "../../components/common/CourseCard";
import Spinner from "../../components/common/Spinner";
import Input from "../../components/common/Input";
import * as coursesService from "../../services/courses.service";
import type { Course, Category } from "../../services/courses.service";

const CourseCatalogPage = () => {
  const [courses,    setCourses]    = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await coursesService.listCourses(page, 12, search);
      setCourses(data.data);
      setTotalPages(data.meta.totalPages);
    } catch {
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { void fetchCourses(); }, [fetchCourses]);

  useEffect(() => {
    coursesService.listCategories()
      .then(({ data }) => setCategories(data.data))
      .catch(() => {/* non-critical */});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchCourses();
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Course Catalog</h1>
        <p className="text-gray-500 mt-1">Explore {categories.length > 0 ? `${categories.length} categories and` : ""} hundreds of courses</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-xl">
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Content */}
      {loading ? (
        <div className="py-20"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="py-20 text-center text-red-500">{error}</div>
      ) : courses.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg">No courses found{search ? ` for "${search}"` : ""}.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                ← Prev
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default CourseCatalogPage;
