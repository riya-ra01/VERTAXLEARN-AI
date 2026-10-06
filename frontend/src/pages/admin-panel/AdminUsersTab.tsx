import { useEffect, useState, useCallback } from "react";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import * as adminService from "../../services/admin.service";
import type { AdminUser } from "../../services/admin.service";

const AdminUsersTab = () => {
  const [users,   setUsers]   = useState<AdminUser[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminService.listUsers(page, 20);
      setUsers(data.data);
      setTotal(data.meta.total);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { void load(); }, [load]);

  const toggle = async (user: AdminUser) => {
    setToggling(user.id);
    try {
      await adminService.setUserActive(user.id, !user.is_active);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    } finally { setToggling(null); }
  };

  const roleColor = (role: string) =>
    ({ admin: "red", instructor: "blue", student: "green" } as Record<string, "red" | "blue" | "green">)[role] ?? "gray";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{total} total users</p>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3"><Badge color={roleColor(u.role)}>{u.role}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge color={u.is_active ? "green" : "red"}>
                      {u.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant={u.is_active ? "danger" : "secondary"}
                      loading={toggling === u.id}
                      onClick={() => void toggle(u)}
                      className="text-xs px-3 py-1"
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</Button>
          <Button variant="secondary" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>Next →</Button>
        </div>
      )}
    </div>
  );
};

export default AdminUsersTab;
