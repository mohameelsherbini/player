-- ============================================
-- Migration 00009: Bookings
-- ============================================

CREATE TABLE bookings (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_code    varchar(10)   UNIQUE NOT NULL,
  player_id       uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pitch_id        uuid          NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  slot_id         uuid          NOT NULL REFERENCES time_slots(id) ON DELETE RESTRICT,
  total_price     numeric(10,2) NOT NULL,
  platform_fee    numeric(10,2) NOT NULL,
  owner_amount    numeric(10,2) NOT NULL,
  status          varchar(20)   NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_method  varchar(20)   NOT NULL
                  CHECK (payment_method IN ('cash', 'card', 'wallet', 'fawry')),
  payment_status  varchar(20)   NOT NULL DEFAULT 'pending'
                  CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_bookings_player ON bookings(player_id);
CREATE INDEX idx_bookings_pitch ON bookings(pitch_id);
CREATE INDEX idx_bookings_slot ON bookings(slot_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_code ON bookings(booking_code);
