export interface CreateDiscussionBody {
  courseId: string;
  lessonId?: string;
  title?: string;
  body: string;
}

export interface CreateReplyBody {
  body: string;
}

export interface DiscussionRow {
  id: string;
  course_id: string;
  lesson_id: string | null;
  user_id: string;
  title: string | null;
  body: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author_name?: string;
  reply_count?: number;
}

export interface ReplyRow {
  id: string;
  discussion_id: string;
  user_id: string;
  body: string;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
  author_name?: string;
}
