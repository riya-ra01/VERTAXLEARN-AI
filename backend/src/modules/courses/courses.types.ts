export interface CreateCourseBody {
  title: string;
  description?: string;
  categoryId?: string;
  price?: number;
  isFree?: boolean;
  level?: string;
}

export interface UpdateCourseBody extends Partial<CreateCourseBody> {
  status?: "draft" | "published" | "archived";
  thumbnailUrl?: string;
}

export interface CreateLessonBody {
  title: string;
  contentType?: "video" | "article" | "pdf" | "quiz" | "assignment";
  contentUrl?: string;
  contentText?: string;
  position?: number;
  durationMins?: number;
  isPreview?: boolean;
}

export interface CourseRow {
  id: string;
  instructor_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  status: string;
  price: string;
  is_free: boolean;
  level: string | null;
  duration_mins: number | null;
  created_at: string;
  updated_at: string;
}

export interface LessonRow {
  id: string;
  course_id: string;
  title: string;
  content_type: string;
  content_url: string | null;
  content_text: string | null;
  position: number;
  duration_mins: number | null;
  is_preview: boolean;
  created_at: string;
}
