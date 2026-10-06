-- Migration: Create enrollments and lesson progress tables

CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'cancelled', 'refunded');

CREATE TABLE enrollments (
  id          UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID              NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  course_id   UUID              NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  status      enrollment_status NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, course_id)
);

-- Tracks per-lesson completion for each enrolled student
CREATE TABLE lesson_progress (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID       NOT NULL REFERENCES enrollments (id) ON DELETE CASCADE,
  lesson_id    UUID        NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
  is_completed BOOLEAN     NOT NULL DEFAULT FALSE,
  watch_time_secs INTEGER  NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE (enrollment_id, lesson_id)
);

CREATE INDEX idx_enrollments_user   ON enrollments (user_id);
CREATE INDEX idx_enrollments_course ON enrollments (course_id);
CREATE INDEX idx_lesson_progress_enrollment ON lesson_progress (enrollment_id);
