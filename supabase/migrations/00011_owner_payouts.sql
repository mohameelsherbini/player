-- ============================================
-- Migration 00011: Owner Payouts
-- ============================================

CREATE TABLE owner_payouts (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount          numeric(10,2) NOT NULL,
  period_start    date          NOT NULL,
  period_end      date          NOT NULL,
  status          varchar(20)   NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processing', 'completed')),
  receipt_url     text,
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_owner_payouts_updated_at
  BEFORE UPDATE ON owner_payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_owner_payouts_owner ON owner_payouts(owner_id);
CREATE INDEX idx_owner_payouts_status ON owner_payouts(status);
