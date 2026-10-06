-- Migration: Create users table

CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');

CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  role          user_role   NOT NULL DEFAULT 'student',
  avatar_url    TEXT,
  bio           TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  email_verified BOOLEAN    NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role  ON users (role);
