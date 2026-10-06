-- Migration: Create gamification tables (points, badges, leaderboard)

CREATE TABLE badges (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_url    TEXT,
  condition   JSONB,       -- flexible rule definition, evaluated by the backend
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_badges (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  badge_id   UUID        NOT NULL REFERENCES badges (id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_id)
);

-- Running XP / point balance per user
CREATE TABLE user_points (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE UNIQUE,
  total      INTEGER     NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Append-only log of every point event
CREATE TABLE point_transactions (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  points      INTEGER     NOT NULL,             -- positive = earn, negative = spend
  reason      VARCHAR(255) NOT NULL,
  reference_id UUID,                            -- optional: quiz_id, lesson_id, etc.
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_badges_user         ON user_badges (user_id);
CREATE INDEX idx_point_transactions_user  ON point_transactions (user_id);
