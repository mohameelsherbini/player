-- ============================================
-- Migration 00023: Views
-- ============================================

CREATE OR REPLACE VIEW v_pitch_stats AS
SELECT 
  p.id as pitch_id,
  p.name,
  p.owner_id,
  COUNT(b.id) as total_bookings,
  COALESCE(SUM(b.total_price), 0) as total_revenue,
  COALESCE(SUM(b.owner_amount), 0) as total_earnings
FROM pitches p
LEFT JOIN bookings b ON p.id = b.pitch_id AND b.status = 'completed'
GROUP BY p.id, p.name, p.owner_id;

CREATE OR REPLACE VIEW v_available_slots AS
SELECT 
  ts.id as slot_id,
  ts.pitch_id,
  p.name as pitch_name,
  ts.slot_date,
  ts.start_time,
  ts.end_time,
  ts.price
FROM time_slots ts
JOIN pitches p ON ts.pitch_id = p.id
WHERE ts.status = 'available' 
  AND p.status = 'active'
  AND (ts.slot_date > CURRENT_DATE OR (ts.slot_date = CURRENT_DATE AND ts.start_time > CURRENT_TIME));
