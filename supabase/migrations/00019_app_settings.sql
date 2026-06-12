-- ============================================
-- Migration 00019: App Settings
-- ============================================

CREATE TABLE app_settings (
  id            varchar(50) PRIMARY KEY, -- 'platform_fee', 'cancellation_hours'
  value         jsonb         NOT NULL,
  description   text,
  updated_at    timestamptz   NOT NULL DEFAULT now(),
  updated_by    uuid          REFERENCES users(id) ON DELETE SET NULL
);

CREATE TRIGGER set_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
