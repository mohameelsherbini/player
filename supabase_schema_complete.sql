-- ============================================
-- Migration 00001: PostgreSQL Extensions
-- يلا حجز — Yalla Book
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- ============================================
-- Migration 00002: Shared Functions & Triggers
-- ============================================

-- Function لتحديث updated_at تلقائيًا
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function لإنشاء user row عند التسجيل في Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, phone, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.phone, ''),
    NEW.email,
    'player'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


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


-- ============================================
-- Migration 00004: Pitches Table (with PostGIS)
-- ============================================

CREATE TABLE pitches (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            varchar(200)  NOT NULL,
  description     text,
  sport_type      varchar(20)   NOT NULL
                  CHECK (sport_type IN ('football', 'padel', 'padbol')),
  surface_type    varchar(50),
  pitch_size      varchar(20),
  location        geography(Point, 4326),
  address         text          NOT NULL,
  city            varchar(100)  NOT NULL,
  district        varchar(100),
  price_per_hour  numeric(10,2) NOT NULL DEFAULT 0,
  avg_rating      numeric(2,1)  NOT NULL DEFAULT 0,
  total_reviews   integer       NOT NULL DEFAULT 0,
  status          varchar(20)   NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('active', 'inactive', 'pending', 'rejected')),
  is_featured     boolean       NOT NULL DEFAULT false,
  featured_until  timestamptz,
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE TRIGGER set_pitches_updated_at
  BEFORE UPDATE ON pitches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_pitches_owner ON pitches(owner_id);
CREATE INDEX idx_pitches_sport ON pitches(sport_type);
CREATE INDEX idx_pitches_status ON pitches(status);
CREATE INDEX idx_pitches_city ON pitches(city);
CREATE INDEX idx_pitches_featured ON pitches(is_featured) WHERE is_featured = true;
CREATE INDEX idx_pitches_location ON pitches USING GIST(location);
CREATE INDEX idx_pitches_name_trgm ON pitches USING GIN(name gin_trgm_ops);


-- ============================================
-- Migration 00005: Pitch Images
-- ============================================

CREATE TABLE pitch_images (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitch_id      uuid          NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  image_url     text          NOT NULL,
  is_primary    boolean       NOT NULL DEFAULT false,
  display_order integer       NOT NULL DEFAULT 0,
  created_at    timestamptz   NOT NULL DEFAULT now()
);

-- Ensure only one primary image per pitch
CREATE UNIQUE INDEX idx_pitch_images_primary 
ON pitch_images(pitch_id) 
WHERE is_primary = true;

CREATE INDEX idx_pitch_images_pitch ON pitch_images(pitch_id);


-- ============================================
-- Migration 00006: Amenities
-- ============================================

CREATE TABLE amenities (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar       varchar(100)  NOT NULL,
  name_en       varchar(100)  NOT NULL,
  icon          varchar(50)   NOT NULL,
  created_at    timestamptz   NOT NULL DEFAULT now()
);

CREATE TABLE pitch_amenities (
  pitch_id      uuid NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  amenity_id    uuid NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (pitch_id, amenity_id)
);


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


-- ============================================
-- Migration 00010: Payments
-- ============================================

CREATE TABLE payments (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      uuid          NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount          numeric(10,2) NOT NULL,
  currency        varchar(10)   NOT NULL DEFAULT 'EGP',
  provider        varchar(50)   NOT NULL, -- 'paymob', 'cash'
  transaction_id  varchar(255)  UNIQUE,   -- External gateway ID
  idempotency_key varchar(255)  UNIQUE NOT NULL,
  status          varchar(20)   NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);


-- ============================================
-- Migration 00011: Owner Payouts
-- ============================================

CREATE TABLE owner_payouts (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount          numeric(10,2) NOT NULL,
  period_start    date          NOT NULL,
  period_end      date          NOT NULL,
  status          varchar(20)   NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processing', 'completed')),
  receipt_url     text,
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_owner_payouts_updated_at
  BEFORE UPDATE ON owner_payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_owner_payouts_owner ON owner_payouts(owner_id);
CREATE INDEX idx_owner_payouts_status ON owner_payouts(status);


-- ============================================
-- Migration 00012: Matches (Social)
-- ============================================

CREATE TABLE matches (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id        uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pitch_id          uuid          NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  slot_id           uuid          NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  required_players  integer       NOT NULL CHECK (required_players > 1),
  current_players   integer       NOT NULL DEFAULT 1,
  total_price       numeric(10,2) NOT NULL,
  cost_per_player   numeric(10,2) NOT NULL,
  status            varchar(20)   NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'full', 'completed', 'cancelled')),
  is_public         boolean       NOT NULL DEFAULT true,
  description       text,
  created_at        timestamptz   NOT NULL DEFAULT now(),
  updated_at        timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE match_players (
  match_id      uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_status varchar(20) NOT NULL DEFAULT 'pending'
                 CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  joined_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (match_id, player_id)
);

CREATE INDEX idx_matches_creator ON matches(creator_id);
CREATE INDEX idx_matches_pitch ON matches(pitch_id);
CREATE INDEX idx_matches_slot ON matches(slot_id);
CREATE INDEX idx_matches_status ON matches(status);


-- ============================================
-- Migration 00013: Reviews
-- ============================================

CREATE TABLE reviews (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id   uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pitch_id    uuid          NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  booking_id  uuid          NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  rating      integer       NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text,
  owner_reply text,
  created_at  timestamptz   NOT NULL DEFAULT now(),
  updated_at  timestamptz   NOT NULL DEFAULT now(),
  UNIQUE(player_id, booking_id) -- One review per booking
);

CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function and trigger to update avg_rating on pitches table
CREATE OR REPLACE FUNCTION update_pitch_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE pitches
    SET 
      avg_rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE pitch_id = NEW.pitch_id),
      total_reviews = (SELECT COUNT(*) FROM reviews WHERE pitch_id = NEW.pitch_id)
    WHERE id = NEW.pitch_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE pitches
    SET 
      avg_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE pitch_id = OLD.pitch_id), 0),
      total_reviews = (SELECT COUNT(*) FROM reviews WHERE pitch_id = OLD.pitch_id)
    WHERE id = OLD.pitch_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_changed
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_pitch_rating();

CREATE INDEX idx_reviews_pitch ON reviews(pitch_id);
CREATE INDEX idx_reviews_player ON reviews(player_id);


-- ============================================
-- Migration 00014: Favorites
-- ============================================

CREATE TABLE favorites (
  player_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pitch_id    uuid NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (player_id, pitch_id)
);


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


-- ============================================
-- Migration 00016: Advertisements
-- ============================================

CREATE TABLE advertisements (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         varchar(200)  NOT NULL,
  image_url     text          NOT NULL,
  link_url      text,
  placement     varchar(50)   NOT NULL -- 'home_banner', 'search_results'
                CHECK (placement IN ('home_banner', 'search_results', 'pitch_details', 'interstitial')),
  target_city   varchar(100),
  target_sport  varchar(20),
  start_date    timestamptz   NOT NULL,
  end_date      timestamptz   NOT NULL,
  impressions   integer       NOT NULL DEFAULT 0,
  clicks        integer       NOT NULL DEFAULT 0,
  is_active     boolean       NOT NULL DEFAULT true,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_advertisements_updated_at
  BEFORE UPDATE ON advertisements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_advertisements_active ON advertisements(is_active) WHERE is_active = true;
CREATE INDEX idx_advertisements_dates ON advertisements(start_date, end_date);


-- ============================================
-- Migration 00017: Notifications
-- ============================================

CREATE TABLE notifications (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         varchar(200)  NOT NULL,
  body          text          NOT NULL,
  type          varchar(50)   NOT NULL, -- 'booking_confirmed', 'match_full'
  data          jsonb,        -- For deep linking
  is_read       boolean       NOT NULL DEFAULT false,
  created_at    timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read) WHERE is_read = false;


-- ============================================
-- Migration 00018: Reports & Complaints
-- ============================================

CREATE TABLE reports (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id   uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id     uuid          NOT NULL, -- ID of pitch, review, or user
  target_type   varchar(50)   NOT NULL, -- 'pitch', 'review', 'user'
  reason        varchar(100)  NOT NULL,
  description   text,
  status        varchar(20)   NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  admin_notes   text,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_reports_status ON reports(status);


-- ============================================
-- Migration 00019: App Settings
-- ============================================

CREATE TABLE app_settings (
  id            varchar(50) PRIMARY KEY, -- 'platform_fee', 'cancellation_hours'
  value         jsonb         NOT NULL,
  description   text,
  updated_at    timestamptz   NOT NULL DEFAULT now(),
  updated_by    uuid          REFERENCES users(id) ON DELETE SET NULL
);

CREATE TRIGGER set_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- Migration 00020: Audit Log
-- ============================================

CREATE TABLE audit_log (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name    varchar(100)  NOT NULL,
  record_id     uuid          NOT NULL,
  action        varchar(20)   NOT NULL -- 'INSERT', 'UPDATE', 'DELETE'
                CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data      jsonb,
  new_data      jsonb,
  user_id       uuid          REFERENCES users(id) ON DELETE SET NULL,
  ip_address    varchar(45),
  created_at    timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_table ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);


-- ============================================
-- Migration 00021: Booking & Cancellation Functions
-- ============================================

-- Function 1: Atomic Booking
CREATE OR REPLACE FUNCTION book_slot(
  p_slot_id uuid,
  p_player_id uuid,
  p_payment_method varchar
)
RETURNS jsonb AS $$
DECLARE
  v_slot record;
  v_booking_id uuid;
  v_booking_code varchar(10);
  v_platform_fee numeric;
  v_fee_percentage numeric;
  v_owner_amount numeric;
BEGIN
  -- 1. Lock the time_slot to prevent concurrent bookings
  SELECT * INTO v_slot 
  FROM time_slots 
  WHERE id = p_slot_id 
  FOR UPDATE;

  -- 2. Validate availability
  IF v_slot.status != 'available' THEN
    RAISE EXCEPTION 'Slot is no longer available';
  END IF;

  -- 3. Get platform fee percentage from settings
  SELECT (value->>'percentage')::numeric INTO v_fee_percentage
  FROM app_settings
  WHERE id = 'platform_fee';
  
  IF v_fee_percentage IS NULL THEN v_fee_percentage := 7.0; END IF;

  -- 4. Calculate amounts
  v_platform_fee := ROUND((v_slot.price * v_fee_percentage / 100)::numeric, 2);
  v_owner_amount := v_slot.price - v_platform_fee;

  -- 5. Generate random booking code
  v_booking_code := upper(substring(md5(random()::text) from 1 for 6));

  -- 6. Insert booking
  INSERT INTO bookings (
    booking_code, player_id, pitch_id, slot_id, 
    total_price, platform_fee, owner_amount, payment_method
  )
  VALUES (
    v_booking_code, p_player_id, v_slot.pitch_id, p_slot_id,
    v_slot.price, v_platform_fee, v_owner_amount, p_payment_method
  ) RETURNING id INTO v_booking_id;

  -- 7. Update slot status
  UPDATE time_slots 
  SET status = 'booked' 
  WHERE id = p_slot_id;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'booking_code', v_booking_code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function 2: Cancel Booking
CREATE OR REPLACE FUNCTION cancel_booking(
  p_booking_id uuid,
  p_user_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_booking record;
  v_slot_date date;
  v_slot_time time;
  v_cancellation_hours numeric;
  v_hours_difference numeric;
BEGIN
  -- 1. Lock booking
  SELECT * INTO v_booking 
  FROM bookings 
  WHERE id = p_booking_id 
  FOR UPDATE;

  -- 2. Validate state
  IF v_booking.status = 'cancelled' THEN
    RAISE EXCEPTION 'Booking is already cancelled';
  END IF;

  -- 3. Verify user authorization (Player or Admin)
  -- Simplified check, actual auth is handled by RLS and Edge Function
  IF v_booking.player_id != p_user_id AND 
     (SELECT role FROM users WHERE id = p_user_id) != 'admin' THEN
    RAISE EXCEPTION 'Not authorized to cancel this booking';
  END IF;

  -- 4. Check cancellation policy
  SELECT slot_date, start_time INTO v_slot_date, v_slot_time
  FROM time_slots WHERE id = v_booking.slot_id;

  SELECT (value->>'hours')::numeric INTO v_cancellation_hours
  FROM app_settings WHERE id = 'cancellation_policy';
  
  IF v_cancellation_hours IS NULL THEN v_cancellation_hours := 2; END IF;

  v_hours_difference := extract(epoch from ((v_slot_date + v_slot_time) - now())) / 3600;

  IF v_hours_difference < v_cancellation_hours THEN
    RAISE EXCEPTION 'Cannot cancel within % hours of the match', v_cancellation_hours;
  END IF;

  -- 5. Update booking status
  UPDATE bookings SET status = 'cancelled' WHERE id = p_booking_id;

  -- 6. Free up the slot
  UPDATE time_slots SET status = 'available' WHERE id = v_booking.slot_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Booking cancelled successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Migration 00022: RLS Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- pitches
CREATE POLICY "Anyone can view active pitches" ON pitches
  FOR SELECT USING (status = 'active');

CREATE POLICY "Owners can view all their pitches" ON pitches
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners can update their pitches" ON pitches
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert pitches" ON pitches
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- time_slots
CREATE POLICY "Anyone can view available time_slots" ON time_slots
  FOR SELECT USING (status = 'available');

CREATE POLICY "Owners can view all their time_slots" ON time_slots
  FOR SELECT USING (
    pitch_id IN (SELECT id FROM pitches WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners can update their time_slots" ON time_slots
  FOR UPDATE USING (
    pitch_id IN (SELECT id FROM pitches WHERE owner_id = auth.uid())
  );

-- bookings
CREATE POLICY "Players can view their bookings" ON bookings
  FOR SELECT USING (player_id = auth.uid());

CREATE POLICY "Owners can view bookings for their pitches" ON bookings
  FOR SELECT USING (
    pitch_id IN (SELECT id FROM pitches WHERE owner_id = auth.uid())
  );

-- reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Players can insert reviews for their bookings" ON reviews
  FOR INSERT WITH CHECK (player_id = auth.uid());

-- favorites
CREATE POLICY "Players can manage their favorites" ON favorites
  FOR ALL USING (player_id = auth.uid());

-- notifications
CREATE POLICY "Users can manage their notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Admin override (Applied to all tables via a function or check)
-- Example for pitches:
CREATE POLICY "Admins can do everything on pitches" ON pitches
  FOR ALL USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );


-- ============================================
-- Migration 00023: Views
-- ============================================

CREATE OR REPLACE VIEW v_pitch_stats AS
SELECT 
  p.id as pitch_id,
  p.name,
  p.owner_id,
  COUNT(b.id) as total_bookings,
  COALESCE(SUM(b.total_price), 0) as total_revenue,
  COALESCE(SUM(b.owner_amount), 0) as total_earnings
FROM pitches p
LEFT JOIN bookings b ON p.id = b.pitch_id AND b.status = 'completed'
GROUP BY p.id, p.name, p.owner_id;

CREATE OR REPLACE VIEW v_available_slots AS
SELECT 
  ts.id as slot_id,
  ts.pitch_id,
  p.name as pitch_name,
  ts.slot_date,
  ts.start_time,
  ts.end_time,
  ts.price
FROM time_slots ts
JOIN pitches p ON ts.pitch_id = p.id
WHERE ts.status = 'available' 
  AND p.status = 'active'
  AND (ts.slot_date > CURRENT_DATE OR (ts.slot_date = CURRENT_DATE AND ts.start_time > CURRENT_TIME));


-- ============================================
-- Migration 00024: Seed Data
-- ============================================

-- Insert default amenities
INSERT INTO amenities (name_ar, name_en, icon) VALUES
  ('حمام', 'Bathroom', 'shower'),
  ('غرفة تغيير ملابس', 'Locker Room', 'door-open'),
  ('موقف سيارات', 'Parking', 'car'),
  ('كافتيريا', 'Cafeteria', 'coffee'),
  ('إنارة ليلية', 'Night Lighting', 'lightbulb'),
  ('مدرجات', 'Tribunes', 'users'),
  ('مياه شرب', 'Drinking Water', 'tint'),
  ('واي فاي', 'Wi-Fi', 'wifi'),
  ('مسجد / مصلى', 'Prayer Room', 'moon'),
  ('تأجير كرات', 'Ball Rental', 'futbol-o')
ON CONFLICT DO NOTHING;

-- Insert default app settings
INSERT INTO app_settings (id, value, description) VALUES
  ('platform_fee', '{"percentage": 7}', 'Platform commission percentage per booking'),
  ('cancellation_policy', '{"hours": 2}', 'Minimum hours before start time allowed for cancellation')
ON CONFLICT (id) DO UPDATE 
SET value = EXCLUDED.value, description = EXCLUDED.description;


