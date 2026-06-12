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
