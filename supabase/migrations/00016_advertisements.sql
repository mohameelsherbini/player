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
