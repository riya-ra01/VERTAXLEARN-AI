-- Migration: Create discussions / forum tables

CREATE TABLE discussions (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id  UUID        NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  lesson_id  UUID        REFERENCES lessons (id) ON DELETE SET NULL,
  user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title      VARCHAR(255),
  body       TEXT        NOT NULL,
  is_pinned  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE discussion_replies (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  discussion_id UUID        NOT NULL REFERENCES discussions (id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  body          TEXT        NOT NULL,
  is_accepted   BOOLEAN     NOT NULL DEFAULT FALSE,  -- instructor marks as answer
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discussions_course ON discussions (course_id);
CREATE INDEX idx_discussions_lesson ON discussions (lesson_id);
CREATE INDEX idx_replies_discussion ON discussion_replies (discussion_id);
