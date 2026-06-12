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
