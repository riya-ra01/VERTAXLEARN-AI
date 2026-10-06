import api from "./api";

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface PaginatedUsers {
  data: AdminUser[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const listUsers      = (page = 1, limit = 20) =>
  api.get<PaginatedUsers>("/api/users", { params: { page, limit } });

export const setUserActive  = (id: string, isActive: boolean) =>
  api.patch(`/api/users/${id}/active`, { isActive });

export const listAllCourses = (page = 1, limit = 20) =>
  api.get("/api/courses", { params: { page, limit } });

export const getLeaderboard = (limit = 10) =>
  api.get("/api/gamification/leaderboard", { params: { limit } });
