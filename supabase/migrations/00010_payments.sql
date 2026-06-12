-- ============================================
-- Migration 00010: Payments
-- ============================================

CREATE TABLE payments (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      uuid          NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount          numeric(10,2) NOT NULL,
  currency        varchar(10)   NOT NULL DEFAULT 'EGP',
  provider        varchar(50)   NOT NULL, -- 'paymob', 'cash'
  transaction_id  varchar(255)  UNIQUE,   -- External gateway ID
  idempotency_key varchar(255)  UNIQUE NOT NULL,
  status          varchar(20)   NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
