-- ============================================
-- Migration 00014: Favorites
-- ============================================

CREATE TABLE favorites (
  player_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pitch_id    uuid NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (player_id, pitch_id)
);
