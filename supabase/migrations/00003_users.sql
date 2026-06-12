-- ============================================
-- Migration 00003: Users Table
-- ============================================

CREATE TABLE users (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     varchar(100)  NOT NULL,
  phone         varchar(20)   UNIQUE NOT NULL,
  email         varchar(255)  UNIQUE,
  role          varchar(20)   NOT NULL DEFAULT 'player'
                CHECK (role IN ('player', 'owner', 'admin', 'coach')),
  avatar_url    text,
  fcm_token     text,
  is_verified   boolean       NOT NULL DEFAULT false,
  bio           text,
  city          varchar(100),
  district      varchar(100),
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auth trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_city ON users(city);
