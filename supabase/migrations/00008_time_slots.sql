-- ============================================
-- Migration 00008: Time Slots
-- ============================================

CREATE TABLE time_slots (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitch_id      uuid          NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  slot_date     date          NOT NULL,
  start_time    time          NOT NULL,
  end_time      time          NOT NULL,
  price         numeric(10,2) NOT NULL,
  status        varchar(20)   NOT NULL DEFAULT 'available'
                CHECK (status IN ('available', 'booked', 'blocked')),
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_time_slots_updated_at
  BEFORE UPDATE ON time_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_time_slots_pitch_date ON time_slots(pitch_id, slot_date);
CREATE INDEX idx_time_slots_status ON time_slots(status);
