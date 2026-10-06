import api from "./api";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  status: string;
  price: string;
  is_free: boolean;
  level: string | null;
  duration_mins: number | null;
  instructor_name: string;
  category_name: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Enrollment {
  id: string;
  course_id: string;
  status: string;
  enrolled_at: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  level: string | null;
}

export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const listCourses = (page = 1, limit = 12, search = "") =>
  api.get<PaginatedResponse<Course>>("/api/courses", { params: { page, limit, search: search || undefined } });

export const getCourse = (slug: string) =>
  api.get<{ data: Course }>(`/api/courses/${slug}`);

export const listCategories = () =>
  api.get<{ data: Category[] }>("/api/courses/categories");

export const enrollInCourse = (courseId: string) =>
  api.post(`/api/courses/${courseId}/enroll`);

export const getMyEnrollments = () =>
  api.get<{ data: Enrollment[] }>("/api/courses/enrollments/me");
