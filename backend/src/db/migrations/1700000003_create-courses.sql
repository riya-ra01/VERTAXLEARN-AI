-- Migration: Create courses and lessons tables

CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE content_type  AS ENUM ('video', 'article', 'pdf', 'quiz', 'assignment');

CREATE TABLE categories (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(100) NOT NULL UNIQUE,
  slug       VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE courses (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id UUID          NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  category_id   UUID          REFERENCES categories (id) ON DELETE SET NULL,
  title         VARCHAR(255)  NOT NULL,
  slug          VARCHAR(280)  NOT NULL UNIQUE,
  description   TEXT,
  thumbnail_url TEXT,
  status        course_status NOT NULL DEFAULT 'draft',
  price         NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_free       BOOLEAN       NOT NULL DEFAULT TRUE,
  level         VARCHAR(50),                          -- beginner / intermediate / advanced
  duration_mins INTEGER,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE lessons (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id   UUID         NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  content_type content_type NOT NULL DEFAULT 'video',
  content_url TEXT,
  content_text TEXT,
  position    INTEGER      NOT NULL DEFAULT 0,         -- ordering within course
  duration_mins INTEGER,
  is_preview  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_instructor ON courses (instructor_id);
CREATE INDEX idx_courses_status     ON courses (status);
CREATE INDEX idx_courses_category   ON courses (category_id);
CREATE INDEX idx_lessons_course     ON lessons (course_id);
CREATE INDEX idx_lessons_position   ON lessons (course_id, position);
