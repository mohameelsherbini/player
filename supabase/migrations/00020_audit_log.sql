-- ============================================
-- Migration 00020: Audit Log
-- ============================================

CREATE TABLE audit_log (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name    varchar(100)  NOT NULL,
  record_id     uuid          NOT NULL,
  action        varchar(20)   NOT NULL -- 'INSERT', 'UPDATE', 'DELETE'
                CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data      jsonb,
  new_data      jsonb,
  user_id       uuid          REFERENCES users(id) ON DELETE SET NULL,
  ip_address    varchar(45),
  created_at    timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_table ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
