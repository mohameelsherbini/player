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
