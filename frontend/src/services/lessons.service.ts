import api from "./api";

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content_type: "video" | "article" | "pdf" | "quiz" | "assignment";
  content_url: string | null;
  content_text: string | null;
  position: number;
  duration_mins: number | null;
  is_preview: boolean;
  created_at: string;
}

export const listLessons = (courseId: string) =>
  api.get<{ data: Lesson[] }>(`/api/courses/${courseId}/lessons`);
