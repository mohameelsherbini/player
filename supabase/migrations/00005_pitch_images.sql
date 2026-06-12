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
