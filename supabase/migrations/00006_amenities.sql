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
