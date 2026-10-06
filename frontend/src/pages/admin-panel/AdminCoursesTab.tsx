import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import * as adminService from "../../services/admin.service";
import type { Course } from "../../services/courses.service";

const statusColor = (s: string) =>
  ({ published: "green", draft: "yellow", archived: "gray" } as Record<string, "green" | "yellow" | "gray">)[s] ?? "gray";

const AdminCoursesTab = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminService.listAllCourses(page, 20);
      const res = data as { data: Course[]; meta: { total: number } };
      setCourses(res.data);
      setTotal(res.meta.total);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{total} total courses</p>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Instructor</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{c.title}</td>
                  <td className="px-4 py-3 text-gray-500">{c.instructor_name}</td>
                  <td className="px-4 py-3"><Badge color={statusColor(c.status)}>{c.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.is_free ? <span className="text-green-600 font-medium">Free</span> : `$${parseFloat(c.price).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/courses/${c.slug}`} className="text-primary-600 hover:underline text-xs">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</Button>
          <Button variant="secondary" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>Next →</Button>
        </div>
      )}
    </div>
  );
};

export default AdminCoursesTab;
