-- Migration: Create notifications table

CREATE TYPE notification_type AS ENUM (
  'course_published',
  'enrollment_confirmed',
  'assignment_graded',
  'quiz_passed',
  'badge_awarded',
  'discussion_reply',
  'announcement'
);

CREATE TABLE notifications (
  id         UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID              NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type       notification_type NOT NULL,
  title      VARCHAR(255)      NOT NULL,
  body       TEXT,
  is_read    BOOLEAN           NOT NULL DEFAULT FALSE,
  reference_id UUID,            -- optional: course_id, assignment_id, etc.
  created_at TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user    ON notifications (user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications (created_at DESC);
