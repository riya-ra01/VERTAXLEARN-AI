import { useEffect, useState } from "react";
import StatsCard from "../../components/student/StatsCard";
import Spinner from "../../components/common/Spinner";
import * as adminService from "../../services/admin.service";

interface LeaderboardEntry {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  total: number;
}

const AdminStatsTab = () => {
  const [totalUsers,   setTotalUsers]   = useState<number | null>(null);
  const [totalCourses, setTotalCourses] = useState<number | null>(null);
  const [leaderboard,  setLeaderboard]  = useState<LeaderboardEntry[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.listUsers(1, 1),
      adminService.listAllCourses(1, 1),
      adminService.getLeaderboard(5),
    ]).then(([users, courses, lb]) => {
      setTotalUsers(users.data.meta.total);
      setTotalCourses((courses.data as { meta: { total: number } }).meta.total);
      setLeaderboard((lb.data as { data: LeaderboardEntry[] }).data);
    }).catch(() => {/* ignore */})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard title="Total Users"   value={totalUsers   ?? "—"} icon="👥" color="bg-blue-50" />
        <StatsCard title="Total Courses" value={totalCourses ?? "—"} icon="📚" color="bg-purple-50" />
        <StatsCard title="Top Learners"  value={leaderboard.length}  icon="🏆" color="bg-yellow-50" />
      </div>

      {leaderboard.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Leaderboard</h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leaderboard.map((u, i) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {u.first_name} {u.last_name}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-primary-600">{u.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminStatsTab;
