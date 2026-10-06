-- Migration: Create assignments and submissions tables

CREATE TYPE submission_status AS ENUM ('pending', 'submitted', 'graded', 'returned');

CREATE TABLE assignments (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id    UUID        NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  lesson_id    UUID        REFERENCES lessons (id) ON DELETE SET NULL,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  due_date     TIMESTAMPTZ,
  max_score    INTEGER     NOT NULL DEFAULT 100,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE assignment_submissions (
  id            UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID              NOT NULL REFERENCES assignments (id) ON DELETE CASCADE,
  user_id       UUID              NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  content_text  TEXT,
  file_url      TEXT,
  status        submission_status NOT NULL DEFAULT 'pending',
  score         INTEGER,
  feedback      TEXT,
  submitted_at  TIMESTAMPTZ,
  graded_at     TIMESTAMPTZ,
  graded_by     UUID              REFERENCES users (id) ON DELETE SET NULL,
  UNIQUE (assignment_id, user_id)
);

CREATE INDEX idx_assignments_course     ON assignments (course_id);
CREATE INDEX idx_submissions_assignment ON assignment_submissions (assignment_id);
CREATE INDEX idx_submissions_user       ON assignment_submissions (user_id);
