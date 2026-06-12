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
