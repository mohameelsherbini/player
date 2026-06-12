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
