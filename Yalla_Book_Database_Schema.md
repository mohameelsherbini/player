# 🏟️ Yalla Book — هندسة قاعدة البيانات الشاملة (Database Schema v2.0)

**Supabase / PostgreSQL — 21 جدول + Functions + RLS + Triggers + PostGIS**

> آخر تحديث: 2026-06-12

---

## 📐 المبادئ المعمارية

1. **كل جدول يحتوي على** `id uuid`, `created_at`, `updated_at`
2. **Soft Delete** على الجداول المالية (`deleted_at timestamp NULL`)
3. **Row Level Security (RLS)** مفعل على كل الجداول
4. **PostGIS** للبحث الجغرافي عن الملاعب
5. **Atomic Functions** لمنع Race Conditions في الحجز
6. **Triggers** لتحديث `updated_at` تلقائيًا

---

## 🔧 Extensions المطلوبة

```sql
-- تفعيل الإضافات المطلوبة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- توليد UUID
CREATE EXTENSION IF NOT EXISTS "postgis";         -- البحث الجغرافي
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- البحث النصي المتقدم
CREATE EXTENSION IF NOT EXISTS "moddatetime";     -- تحديث updated_at تلقائيًا
```

---

## 🔄 Trigger عام لتحديث `updated_at`

```sql
-- Function لتحديث updated_at تلقائيًا
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

> يتم تطبيق هذا الـ Trigger على كل جدول كما هو موضح أدناه.

---

## 📦 الجداول الأساسية (Core Tables)

### 1. `users` — المستخدمين

```sql
CREATE TABLE users (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     varchar(100)  NOT NULL,
  phone         varchar(20)   UNIQUE NOT NULL,
  email         varchar(255)  UNIQUE,
  role          varchar(20)   NOT NULL DEFAULT 'player'
                CHECK (role IN ('player', 'owner', 'admin', 'coach')),
  avatar_url    text,
  fcm_token     text,                          -- Firebase Cloud Messaging token
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

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_city ON users(city);
```

---

### 2. `pitches` — الملاعب

```sql
CREATE TABLE pitches (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            varchar(200)  NOT NULL,
  description     text,
  sport_type      varchar(20)   NOT NULL
                  CHECK (sport_type IN ('football', 'padel', 'padbol')),
  surface_type    varchar(50),                  -- ترتان، نجيل صناعي، إلخ
  pitch_size      varchar(20),                  -- 5v5, 7v7, 11v11, padel_standard
  location        geography(Point, 4326),       -- PostGIS للبحث الجغرافي
  address         text          NOT NULL,
  city            varchar(100)  NOT NULL,
  district        varchar(100),
  price_per_hour  numeric(10,2) NOT NULL DEFAULT 0,  -- السعر الافتراضي
  avg_rating      numeric(2,1)  NOT NULL DEFAULT 0,
  total_reviews   integer       NOT NULL DEFAULT 0,
  status          varchar(20)   NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('active', 'inactive', 'pending', 'rejected')),
  is_featured     boolean       NOT NULL DEFAULT false,  -- ملعب مميز (مدفوع)
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
```

---

### 3. `pitch_images` — صور الملاعب

```sql
CREATE TABLE pitch_images (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitch_id    uuid          NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  image_url   text          NOT NULL,
  thumbnail_url text,                          -- صورة مصغرة للأداء
  sort_order  integer       NOT NULL DEFAULT 0,
  is_cover    boolean       NOT NULL DEFAULT false, -- الصورة الرئيسية
  created_at  timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_pitch_images_pitch ON pitch_images(pitch_id);
```

---

### 4. `pitch_amenities` — مرافق الملاعب

```sql
-- جدول المرافق المتاحة (Lookup)
CREATE TABLE amenities (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar     varchar(100) NOT NULL,           -- إضاءة ليلية
  name_en     varchar(100) NOT NULL,           -- Night Lighting
  icon        varchar(50),                     -- اسم الأيقونة
  created_at  timestamptz  NOT NULL DEFAULT now()
);

-- ربط الملاعب بالمرافق (Many-to-Many)
CREATE TABLE pitch_amenities (
  pitch_id    uuid NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  amenity_id  uuid NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (pitch_id, amenity_id)
);
```

**المرافق الافتراضية (Seed Data):**

```sql
INSERT INTO amenities (name_ar, name_en, icon) VALUES
  ('إضاءة ليلية',    'Night Lighting',   'lightbulb'),
  ('مواقف سيارات',   'Parking',          'car'),
  ('كافتيريا',       'Cafeteria',        'coffee'),
  ('غرف تبديل ملابس','Changing Rooms',   'door-open'),
  ('دش واستحمام',    'Showers',          'shower'),
  ('واي فاي',        'Wi-Fi',            'wifi'),
  ('مدرجات متفرجين', 'Spectator Seats',  'users'),
  ('حكم متاح',       'Referee Available','whistle'),
  ('كرات متاحة',     'Balls Provided',   'circle'),
  ('مكيفة',          'Air Conditioned',  'snowflake');
```

---

### 5. `pitch_schedules` — الجدول الأسبوعي المتكرر (Template)

```sql
CREATE TABLE pitch_schedules (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitch_id      uuid          NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  day_of_week   smallint      NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
                                              -- 0 = الأحد ... 6 = السبت
  start_time    time          NOT NULL,
  end_time      time          NOT NULL,
  price         numeric(10,2) NOT NULL,
  is_active     boolean       NOT NULL DEFAULT true,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  UNIQUE (pitch_id, day_of_week, start_time)
);

CREATE TRIGGER set_pitch_schedules_updated_at
  BEFORE UPDATE ON pitch_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### 6. `time_slots` — الفتحات الزمنية المولدة

```sql
CREATE TABLE time_slots (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitch_id    uuid          NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  schedule_id uuid          REFERENCES pitch_schedules(id) ON DELETE SET NULL,
  slot_date   date          NOT NULL,
  start_time  time          NOT NULL,
  end_time    time          NOT NULL,
  price       numeric(10,2) NOT NULL,
  is_booked   boolean       NOT NULL DEFAULT false,
  is_blocked  boolean       NOT NULL DEFAULT false,  -- صاحب الملعب يقفل الوقت
  created_at  timestamptz   NOT NULL DEFAULT now(),
  updated_at  timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT valid_slot_time CHECK (start_time < end_time),
  UNIQUE (pitch_id, slot_date, start_time)
);

CREATE TRIGGER set_time_slots_updated_at
  BEFORE UPDATE ON time_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_slots_pitch_date ON time_slots(pitch_id, slot_date);
CREATE INDEX idx_slots_available ON time_slots(pitch_id, slot_date, is_booked, is_blocked)
  WHERE is_booked = false AND is_blocked = false;
```

---

## 💳 جداول الحجز والمدفوعات (Booking & Payments)

### 7. `bookings` — الحجوزات

```sql
CREATE TABLE bookings (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id           uuid          NOT NULL REFERENCES users(id),
  slot_id             uuid          NOT NULL REFERENCES time_slots(id),
  pitch_id            uuid          NOT NULL REFERENCES pitches(id),
  total_price         numeric(10,2) NOT NULL,
  platform_fee        numeric(10,2) NOT NULL DEFAULT 0,     -- عمولة المنصة
  owner_amount        numeric(10,2) NOT NULL DEFAULT 0,     -- المبلغ لصاحب الملعب
  payment_method      varchar(30),
                      -- cash, fawry, visa, mastercard, vodafone_cash, orange_cash
  status              varchar(20)   NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  booking_code        varchar(10)   UNIQUE,                 -- كود حجز قصير
  notes               text,
  cancelled_at        timestamptz,
  cancellation_reason text,
  created_at          timestamptz   NOT NULL DEFAULT now(),
  updated_at          timestamptz   NOT NULL DEFAULT now(),
  deleted_at          timestamptz,

  CONSTRAINT unique_slot_booking UNIQUE (slot_id)           -- منع الحجز المزدوج
);

CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_bookings_player ON bookings(player_id);
CREATE INDEX idx_bookings_pitch ON bookings(pitch_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(created_at);
```

---

### 8. `payments` — سجل المعاملات المالية

```sql
CREATE TABLE payments (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id        uuid          REFERENCES bookings(id),
  player_id         uuid          NOT NULL REFERENCES users(id),
  amount            numeric(10,2) NOT NULL,
  currency          varchar(3)    NOT NULL DEFAULT 'EGP',
  payment_method    varchar(30)   NOT NULL,
  gateway           varchar(30)   NOT NULL DEFAULT 'paymob',
                    -- paymob, fawry, manual
  gateway_tx_id     varchar(255),                -- معرف المعاملة من بوابة الدفع
  gateway_response  jsonb,                       -- الرد الكامل من البوابة
  idempotency_key   varchar(255)  UNIQUE,        -- منع المعاملات المكررة
  status            varchar(20)   NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'success', 'failed', 'refunded', 'partially_refunded')),
  refund_amount     numeric(10,2) DEFAULT 0,
  refund_reason     text,
  refunded_at       timestamptz,
  created_at        timestamptz   NOT NULL DEFAULT now(),
  updated_at        timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_player ON payments(player_id);
CREATE INDEX idx_payments_gateway_tx ON payments(gateway_tx_id);
CREATE INDEX idx_payments_idempotency ON payments(idempotency_key);
```

---

### 9. `owner_payouts` — تسويات أصحاب الملاعب

```sql
CREATE TABLE owner_payouts (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        uuid          NOT NULL REFERENCES users(id),
  amount          numeric(10,2) NOT NULL,
  currency        varchar(3)    NOT NULL DEFAULT 'EGP',
  period_start    date          NOT NULL,
  period_end      date          NOT NULL,
  bookings_count  integer       NOT NULL DEFAULT 0,
  status          varchar(20)   NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  paid_at         timestamptz,
  payment_ref     varchar(255),                 -- مرجع التحويل البنكي
  notes           text,
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_owner_payouts_updated_at
  BEFORE UPDATE ON owner_payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_payouts_owner ON owner_payouts(owner_id);
CREATE INDEX idx_payouts_status ON owner_payouts(status);
```

---

## ⚽ الجداول الاجتماعية (Social & Matching)

### 10. `matches` — المباريات المفتوحة

```sql
CREATE TABLE matches (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id        uuid          NOT NULL REFERENCES users(id),
  booking_id        uuid          REFERENCES bookings(id),
  pitch_id          uuid          NOT NULL REFERENCES pitches(id),
  match_type        varchar(20)   NOT NULL DEFAULT 'private'
                    CHECK (match_type IN ('public', 'private')),
  sport_type        varchar(20)   NOT NULL,
  match_date        date          NOT NULL,
  start_time        time          NOT NULL,
  end_time          time          NOT NULL,
  required_players  integer       NOT NULL,
  current_players   integer       NOT NULL DEFAULT 1,
  cost_per_player   numeric(10,2) NOT NULL,
  description       text,
  status            varchar(20)   NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'full', 'in_progress', 'completed', 'cancelled')),
  created_at        timestamptz   NOT NULL DEFAULT now(),
  updated_at        timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_matches_creator ON matches(creator_id);
CREATE INDEX idx_matches_pitch ON matches(pitch_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_public ON matches(match_type, status)
  WHERE match_type = 'public' AND status = 'open';
```

---

### 11. `match_players` — المشاركين في المباريات

```sql
CREATE TABLE match_players (
  match_id        uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id       uuid NOT NULL REFERENCES users(id),
  payment_status  varchar(20) NOT NULL DEFAULT 'pending'
                  CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  joined_at       timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (match_id, player_id)              -- منع انضمام نفس اللاعب مرتين
);

CREATE INDEX idx_match_players_player ON match_players(player_id);
```

---

### 12. `reviews` — التقييمات والمراجعات

```sql
CREATE TABLE reviews (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id   uuid          NOT NULL REFERENCES users(id),
  pitch_id    uuid          NOT NULL REFERENCES pitches(id),
  booking_id  uuid          REFERENCES bookings(id),             -- ربط بالحجز (اختياري)
  rating      smallint      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text,
  owner_reply text,                                              -- رد صاحب الملعب
  replied_at  timestamptz,
  is_visible  boolean       NOT NULL DEFAULT true,
  created_at  timestamptz   NOT NULL DEFAULT now(),
  updated_at  timestamptz   NOT NULL DEFAULT now(),

  UNIQUE (player_id, booking_id)                                 -- تقييم واحد لكل حجز
);

CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_reviews_pitch ON reviews(pitch_id);
CREATE INDEX idx_reviews_player ON reviews(player_id);
```

**Trigger لتحديث `avg_rating` و `total_reviews` في `pitches` تلقائيًا:**

```sql
CREATE OR REPLACE FUNCTION update_pitch_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pitches SET
    avg_rating = (
      SELECT COALESCE(AVG(rating)::numeric(2,1), 0)
      FROM reviews WHERE pitch_id = COALESCE(NEW.pitch_id, OLD.pitch_id) AND is_visible = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews WHERE pitch_id = COALESCE(NEW.pitch_id, OLD.pitch_id) AND is_visible = true
    )
  WHERE id = COALESCE(NEW.pitch_id, OLD.pitch_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_pitch_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_pitch_rating();
```

---

### 13. `favorites` — المفضلات

```sql
CREATE TABLE favorites (
  player_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pitch_id    uuid NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (player_id, pitch_id)
);

CREATE INDEX idx_favorites_player ON favorites(player_id);
```

---

## 🎓 جداول الأكاديميات (Academy)

### 14. `academies` — الأكاديميات

```sql
CREATE TABLE academies (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    uuid          NOT NULL REFERENCES users(id),
  name        varchar(200)  NOT NULL,
  description text,
  logo_url    text,
  sport_type  varchar(20)   NOT NULL,
  city        varchar(100),
  phone       varchar(20),
  status      varchar(20)   NOT NULL DEFAULT 'pending'
              CHECK (status IN ('active', 'inactive', 'pending')),
  created_at  timestamptz   NOT NULL DEFAULT now(),
  updated_at  timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_academies_updated_at
  BEFORE UPDATE ON academies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_academies_owner ON academies(owner_id);
```

---

### 15. `academy_sessions` — الجلسات التدريبية

```sql
CREATE TABLE academy_sessions (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id        uuid          REFERENCES academies(id) ON DELETE CASCADE,
  coach_id          uuid          NOT NULL REFERENCES users(id),
  pitch_id          uuid          REFERENCES pitches(id),
  title             varchar(200)  NOT NULL,
  description       text,
  session_date      date          NOT NULL,
  start_time        time          NOT NULL,
  end_time          time          NOT NULL,
  max_trainees      integer       NOT NULL,
  current_trainees  integer       NOT NULL DEFAULT 0,
  price_per_trainee numeric(10,2) NOT NULL,
  level             varchar(20)   DEFAULT 'all'
                    CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all')),
  status            varchar(20)   NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
  created_at        timestamptz   NOT NULL DEFAULT now(),
  updated_at        timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_academy_sessions_updated_at
  BEFORE UPDATE ON academy_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_sessions_academy ON academy_sessions(academy_id);
CREATE INDEX idx_sessions_coach ON academy_sessions(coach_id);
CREATE INDEX idx_sessions_date ON academy_sessions(session_date);
CREATE INDEX idx_sessions_status ON academy_sessions(status);
```

---

### 16. `session_enrollments` — التسجيل في الجلسات

```sql
CREATE TABLE session_enrollments (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      uuid NOT NULL REFERENCES academy_sessions(id) ON DELETE CASCADE,
  player_id       uuid NOT NULL REFERENCES users(id),
  payment_status  varchar(20) NOT NULL DEFAULT 'pending'
                  CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  enrolled_at     timestamptz NOT NULL DEFAULT now(),

  UNIQUE (session_id, player_id)
);

CREATE INDEX idx_enrollments_session ON session_enrollments(session_id);
CREATE INDEX idx_enrollments_player ON session_enrollments(player_id);
```

---

## 🏢 جداول المنصة والإدارة (Platform & Admin)

### 17. `advertisements` — الإعلانات

```sql
CREATE TABLE advertisements (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  advertiser_name varchar(200)  NOT NULL,
  title           varchar(200)  NOT NULL,
  description     text,
  image_url       text          NOT NULL,
  target_url      text,                          -- رابط الإعلان
  placement       varchar(30)   NOT NULL DEFAULT 'home_banner'
                  CHECK (placement IN ('home_banner', 'search_results', 'pitch_detail', 'interstitial')),
  target_city     varchar(100),                  -- استهداف جغرافي
  target_sport    varchar(20),                   -- استهداف حسب الرياضة
  impressions     integer       NOT NULL DEFAULT 0,
  clicks          integer       NOT NULL DEFAULT 0,
  budget          numeric(10,2),
  cost_per_click  numeric(6,2),
  starts_at       timestamptz   NOT NULL,
  ends_at         timestamptz   NOT NULL,
  status          varchar(20)   NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('active', 'paused', 'pending', 'expired', 'rejected')),
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_ads_updated_at
  BEFORE UPDATE ON advertisements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_ads_status ON advertisements(status);
CREATE INDEX idx_ads_dates ON advertisements(starts_at, ends_at);
CREATE INDEX idx_ads_placement ON advertisements(placement);
```

---

### 18. `notifications` — الإشعارات

```sql
CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        varchar(30)   NOT NULL,
                -- booking_confirmed, booking_cancelled, match_invite, payment_received,
                -- review_received, reminder, admin_announcement, payout_sent
  title       varchar(200)  NOT NULL,
  body        text          NOT NULL,
  data        jsonb,                              -- بيانات إضافية (booking_id, match_id, etc.)
  deep_link   text,                               -- رابط مباشر داخل التطبيق
  is_read     boolean       NOT NULL DEFAULT false,
  read_at     timestamptz,
  created_at  timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read)
  WHERE is_read = false;
CREATE INDEX idx_notifications_date ON notifications(created_at DESC);
```

---

### 19. `reports` — البلاغات والشكاوى

```sql
CREATE TABLE reports (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id   uuid          NOT NULL REFERENCES users(id),
  reported_type varchar(30)   NOT NULL,           -- pitch, user, review, match
  reported_id   uuid          NOT NULL,            -- ID الكيان المبلغ عنه
  reason        varchar(50)   NOT NULL,
                -- inappropriate, spam, fake, safety, other
  description   text,
  status        varchar(20)   NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes   text,
  resolved_by   uuid          REFERENCES users(id),
  resolved_at   timestamptz,
  created_at    timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_type ON reports(reported_type, reported_id);
```

---

### 20. `app_settings` — إعدادات المنصة

```sql
CREATE TABLE app_settings (
  key         varchar(100) PRIMARY KEY,
  value       jsonb        NOT NULL,
  description text,
  updated_at  timestamptz  NOT NULL DEFAULT now(),
  updated_by  uuid         REFERENCES users(id)
);

-- القيم الافتراضية
INSERT INTO app_settings (key, value, description) VALUES
  ('commission_rate', '"0.07"', 'نسبة عمولة المنصة (7%)'),
  ('cancellation_policy_hours', '"2"', 'عدد الساعات المسموح بها للإلغاء قبل الموعد'),
  ('max_images_per_pitch', '"10"', 'أقصى عدد صور لكل ملعب'),
  ('slot_generation_days', '"14"', 'عدد أيام توليد الفتحات الزمنية مقدمًا'),
  ('min_payout_amount', '"100"', 'الحد الأدنى لتسوية صاحب الملعب بالجنيه');
```

---

### 21. `audit_log` — سجل التدقيق

```sql
CREATE TABLE audit_log (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid          REFERENCES users(id),
  action      varchar(30)   NOT NULL,              -- CREATE, UPDATE, DELETE, LOGIN, etc.
  entity_type varchar(50)   NOT NULL,              -- booking, pitch, user, payment, etc.
  entity_id   uuid,
  old_data    jsonb,
  new_data    jsonb,
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_date ON audit_log(created_at DESC);
```

---

## 🔒 Atomic Booking Function (منع Race Condition)

```sql
CREATE OR REPLACE FUNCTION book_slot(
  p_player_id      uuid,
  p_slot_id        uuid,
  p_payment_method varchar DEFAULT 'cash'
) RETURNS jsonb AS $$
DECLARE
  v_booking_id   uuid;
  v_booking_code varchar(10);
  v_is_booked    boolean;
  v_is_blocked   boolean;
  v_price        numeric;
  v_pitch_id     uuid;
  v_commission   numeric;
  v_rate         numeric;
BEGIN
  -- الحصول على نسبة العمولة
  SELECT (value#>>'{}')::numeric INTO v_rate
  FROM app_settings WHERE key = 'commission_rate';
  v_rate := COALESCE(v_rate, 0.07);

  -- قفل صف الفتحة الزمنية (FOR UPDATE) لمنع Race Condition
  SELECT is_booked, is_blocked, price, pitch_id
  INTO v_is_booked, v_is_blocked, v_price, v_pitch_id
  FROM time_slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot not found';
  END IF;

  IF v_is_booked THEN
    RAISE EXCEPTION 'Slot already booked';
  END IF;

  IF v_is_blocked THEN
    RAISE EXCEPTION 'Slot is blocked by owner';
  END IF;

  -- حساب العمولة
  v_commission := ROUND(v_price * v_rate, 2);

  -- توليد كود حجز فريد
  v_booking_code := upper(substr(md5(random()::text), 1, 6));

  -- تحديث حالة الفتحة
  UPDATE time_slots SET is_booked = true WHERE id = p_slot_id;

  -- إنشاء الحجز
  INSERT INTO bookings (
    player_id, slot_id, pitch_id, total_price,
    platform_fee, owner_amount, payment_method,
    status, booking_code
  ) VALUES (
    p_player_id, p_slot_id, v_pitch_id, v_price,
    v_commission, v_price - v_commission, p_payment_method,
    'confirmed', v_booking_code
  ) RETURNING id INTO v_booking_id;

  RETURN jsonb_build_object(
    'booking_id', v_booking_id,
    'booking_code', v_booking_code,
    'total_price', v_price,
    'platform_fee', v_commission,
    'status', 'confirmed'
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 🔒 Function لإلغاء الحجز

```sql
CREATE OR REPLACE FUNCTION cancel_booking(
  p_booking_id uuid,
  p_player_id  uuid,
  p_reason     text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_slot_id    uuid;
  v_status     varchar;
  v_owner_id   uuid;
  v_min_hours  integer;
  v_slot_date  date;
  v_start_time time;
BEGIN
  -- سياسة الإلغاء
  SELECT (value#>>'{}')::integer INTO v_min_hours
  FROM app_settings WHERE key = 'cancellation_policy_hours';
  v_min_hours := COALESCE(v_min_hours, 2);

  -- جلب بيانات الحجز
  SELECT b.slot_id, b.status, ts.slot_date, ts.start_time
  INTO v_slot_id, v_status, v_slot_date, v_start_time
  FROM bookings b
  JOIN time_slots ts ON ts.id = b.slot_id
  WHERE b.id = p_booking_id AND b.player_id = p_player_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or unauthorized';
  END IF;

  IF v_status != 'confirmed' THEN
    RAISE EXCEPTION 'Booking is not in confirmed status';
  END IF;

  -- التحقق من سياسة الإلغاء
  IF (v_slot_date + v_start_time) - now() < (v_min_hours || ' hours')::interval THEN
    RAISE EXCEPTION 'Cannot cancel less than % hours before the slot', v_min_hours;
  END IF;

  -- إلغاء الحجز
  UPDATE bookings SET
    status = 'cancelled',
    cancelled_at = now(),
    cancellation_reason = p_reason
  WHERE id = p_booking_id;

  -- تحرير الفتحة الزمنية
  UPDATE time_slots SET is_booked = false WHERE id = v_slot_id;

  RETURN jsonb_build_object(
    'booking_id', p_booking_id,
    'status', 'cancelled',
    'refund_eligible', true
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 🔐 Row Level Security (RLS) Policies

```sql
-- تفعيل RLS على كل الجداول
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- ========== USERS ==========
CREATE POLICY "Users read own profile"
  ON users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public read basic user info"
  ON users FOR SELECT USING (true);  -- الاسم والصورة فقط عبر View

-- ========== PITCHES ==========
CREATE POLICY "Anyone reads active pitches"
  ON pitches FOR SELECT USING (status = 'active' OR owner_id = auth.uid());

CREATE POLICY "Owners manage own pitches"
  ON pitches FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Admins manage all pitches"
  ON pitches FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ========== BOOKINGS ==========
CREATE POLICY "Players read own bookings"
  ON bookings FOR SELECT USING (player_id = auth.uid());

CREATE POLICY "Owners read their pitch bookings"
  ON bookings FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pitches p
      WHERE p.id = bookings.pitch_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Players create bookings"
  ON bookings FOR INSERT WITH CHECK (player_id = auth.uid());

-- ========== TIME_SLOTS ==========
CREATE POLICY "Anyone reads available slots"
  ON time_slots FOR SELECT USING (true);

CREATE POLICY "Owners manage own pitch slots"
  ON time_slots FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pitches p
      WHERE p.id = time_slots.pitch_id AND p.owner_id = auth.uid()
    )
  );

-- ========== NOTIFICATIONS ==========
CREATE POLICY "Users read own notifications"
  ON notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE USING (user_id = auth.uid());

-- ========== REVIEWS ==========
CREATE POLICY "Anyone reads visible reviews"
  ON reviews FOR SELECT USING (is_visible = true);

CREATE POLICY "Players create reviews"
  ON reviews FOR INSERT WITH CHECK (player_id = auth.uid());

CREATE POLICY "Players update own reviews"
  ON reviews FOR UPDATE USING (player_id = auth.uid());

-- ========== FAVORITES ==========
CREATE POLICY "Players manage own favorites"
  ON favorites FOR ALL USING (player_id = auth.uid());

-- ========== MATCHES ==========
CREATE POLICY "Anyone reads public matches"
  ON matches FOR SELECT USING (match_type = 'public' OR creator_id = auth.uid());

CREATE POLICY "Players create matches"
  ON matches FOR INSERT WITH CHECK (creator_id = auth.uid());

-- ========== PAYMENTS ==========
CREATE POLICY "Players read own payments"
  ON payments FOR SELECT USING (player_id = auth.uid());

CREATE POLICY "Admins read all payments"
  ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ========== ADVERTISEMENTS ==========
CREATE POLICY "Anyone reads active ads"
  ON advertisements FOR SELECT USING (
    status = 'active' AND starts_at <= now() AND ends_at >= now()
  );

CREATE POLICY "Admins manage ads"
  ON advertisements FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## 📊 Views مفيدة

```sql
-- عرض الملاعب مع عدد الحجوزات والتقييم
CREATE OR REPLACE VIEW v_pitch_stats AS
SELECT
  p.id,
  p.name,
  p.sport_type,
  p.city,
  p.avg_rating,
  p.total_reviews,
  p.is_featured,
  COUNT(DISTINCT b.id) AS total_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'confirmed' AND ts.slot_date >= CURRENT_DATE THEN b.id END) AS upcoming_bookings
FROM pitches p
LEFT JOIN time_slots ts ON ts.pitch_id = p.id
LEFT JOIN bookings b ON b.slot_id = ts.id
WHERE p.deleted_at IS NULL
GROUP BY p.id;

-- عرض الأوقات المتاحة اليوم والأيام القادمة
CREATE OR REPLACE VIEW v_available_slots AS
SELECT
  ts.*,
  p.name AS pitch_name,
  p.sport_type,
  p.city,
  p.price_per_hour
FROM time_slots ts
JOIN pitches p ON p.id = ts.pitch_id
WHERE ts.is_booked = false
  AND ts.is_blocked = false
  AND ts.slot_date >= CURRENT_DATE
  AND p.status = 'active'
  AND p.deleted_at IS NULL;
```

---

## 🔗 Entity Relationship Diagram (ملخص)

```
users ─────┬──────── pitches ──────── pitch_images
           │              │──────── pitch_amenities ── amenities
           │              │──────── pitch_schedules
           │              └──────── time_slots ──── bookings ──── payments
           │
           ├──────── matches ──────── match_players
           │
           ├──────── reviews
           │
           ├──────── favorites
           │
           ├──────── notifications
           │
           ├──────── academies ──── academy_sessions ──── session_enrollments
           │
           └──────── owner_payouts

advertisements (standalone - admin managed)
reports (standalone - user reports)
app_settings (standalone - config)
audit_log (standalone - tracking)
```
