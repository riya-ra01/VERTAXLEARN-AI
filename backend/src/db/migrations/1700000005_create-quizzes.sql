-- Migration: Create quizzes, questions, and attempts tables

CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer', 'essay');

CREATE TABLE quizzes (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id     UUID        NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  lesson_id     UUID        REFERENCES lessons (id) ON DELETE SET NULL,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  time_limit_mins INTEGER,                          -- NULL = no limit
  pass_score    INTEGER     NOT NULL DEFAULT 70,    -- percentage
  max_attempts  INTEGER     NOT NULL DEFAULT 3,
  is_ai_generated BOOLEAN   NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quiz_questions (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id       UUID          NOT NULL REFERENCES quizzes (id) ON DELETE CASCADE,
  question_text TEXT          NOT NULL,
  question_type question_type NOT NULL DEFAULT 'multiple_choice',
  options       JSONB,        -- [{id, text, is_correct}] for MC; NULL for essay
  explanation   TEXT,         -- shown after answering
  points        INTEGER       NOT NULL DEFAULT 1,
  position      INTEGER       NOT NULL DEFAULT 0
);

CREATE TABLE quiz_attempts (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id     UUID        NOT NULL REFERENCES quizzes (id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  answers     JSONB       NOT NULL DEFAULT '{}',  -- {question_id: answer}
  score       INTEGER,                             -- percentage, set on submit
  passed      BOOLEAN,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);

CREATE INDEX idx_quizzes_course    ON quizzes (course_id);
CREATE INDEX idx_quiz_questions_quiz ON quiz_questions (quiz_id, position);
CREATE INDEX idx_quiz_attempts_user  ON quiz_attempts (user_id, quiz_id);
