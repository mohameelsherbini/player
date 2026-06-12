-- ============================================
-- Migration 00007: Pitch Schedules
-- ============================================

CREATE TABLE pitch_schedules (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitch_id      uuid          NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  day_of_week   integer       NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  start_time    time          NOT NULL,
  end_time      time          NOT NULL,
  price         numeric(10,2) NOT NULL,
  is_active     boolean       NOT NULL DEFAULT true,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_pitch_schedules_updated_at
  BEFORE UPDATE ON pitch_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_pitch_schedules_pitch ON pitch_schedules(pitch_id);
