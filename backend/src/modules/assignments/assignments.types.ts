export interface CreateAssignmentBody {
  courseId: string;
  lessonId?: string;
  title: string;
  description?: string;
  dueDate?: string;
  maxScore?: number;
}

export interface SubmitAssignmentBody {
  contentText?: string;
  fileUrl?: string;
}

export interface GradeSubmissionBody {
  score: number;
  feedback?: string;
}

export interface AssignmentRow {
  id: string;
  course_id: string;
  lesson_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  max_score: number;
  created_at: string;
}

export interface SubmissionRow {
  id: string;
  assignment_id: string;
  user_id: string;
  content_text: string | null;
  file_url: string | null;
  status: string;
  score: number | null;
  feedback: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  graded_by: string | null;
}
