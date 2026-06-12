-- ============================================
-- Migration 00015: Academies
-- ============================================

CREATE TABLE academies (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id      uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          varchar(200)  NOT NULL,
  description   text,
  sport_type    varchar(20)   NOT NULL,
  logo_url      text,
  status        varchar(20)   NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'inactive')),
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_academies_updated_at
  BEFORE UPDATE ON academies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE academy_sessions (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id    uuid          NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  pitch_id      uuid          NOT NULL REFERENCES pitches(id) ON DELETE RESTRICT,
  session_date  date          NOT NULL,
  start_time    time          NOT NULL,
  end_time      time          NOT NULL,
  price         numeric(10,2) NOT NULL,
  max_trainees  integer       NOT NULL,
  current_trainees integer    NOT NULL DEFAULT 0,
  level         varchar(20)   NOT NULL DEFAULT 'all',
  status        varchar(20)   NOT NULL DEFAULT 'upcoming'
                CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_academy_sessions_updated_at
  BEFORE UPDATE ON academy_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE session_enrollments (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    uuid          NOT NULL REFERENCES academy_sessions(id) ON DELETE CASCADE,
  player_id     uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_status varchar(20)  NOT NULL DEFAULT 'pending'
                 CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at    timestamptz   NOT NULL DEFAULT now(),
  UNIQUE(session_id, player_id)
);

CREATE INDEX idx_academies_coach ON academies(coach_id);
CREATE INDEX idx_academy_sessions_academy ON academy_sessions(academy_id);
CREATE INDEX idx_session_enrollments_session ON session_enrollments(session_id);
