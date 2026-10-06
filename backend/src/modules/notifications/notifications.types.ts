export type NotificationType =
  | "course_published"
  | "enrollment_confirmed"
  | "assignment_graded"
  | "quiz_passed"
  | "badge_awarded"
  | "discussion_reply"
  | "announcement";

export interface CreateNotificationBody {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  referenceId?: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  reference_id: string | null;
  created_at: string;
}
