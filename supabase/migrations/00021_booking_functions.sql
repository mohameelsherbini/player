-- ============================================
-- Migration 00021: Booking & Cancellation Functions
-- ============================================

-- Function 1: Atomic Booking
CREATE OR REPLACE FUNCTION book_slot(
  p_slot_id uuid,
  p_player_id uuid,
  p_payment_method varchar
)
RETURNS jsonb AS $$
DECLARE
  v_slot record;
  v_booking_id uuid;
  v_booking_code varchar(10);
  v_platform_fee numeric;
  v_fee_percentage numeric;
  v_owner_amount numeric;
BEGIN
  -- 1. Lock the time_slot to prevent concurrent bookings
  SELECT * INTO v_slot 
  FROM time_slots 
  WHERE id = p_slot_id 
  FOR UPDATE;

  -- 2. Validate availability
  IF v_slot.status != 'available' THEN
    RAISE EXCEPTION 'Slot is no longer available';
  END IF;

  -- 3. Get platform fee percentage from settings
  SELECT (value->>'percentage')::numeric INTO v_fee_percentage
  FROM app_settings
  WHERE id = 'platform_fee';
  
  IF v_fee_percentage IS NULL THEN v_fee_percentage := 7.0; END IF;

  -- 4. Calculate amounts
  v_platform_fee := ROUND((v_slot.price * v_fee_percentage / 100)::numeric, 2);
  v_owner_amount := v_slot.price - v_platform_fee;

  -- 5. Generate random booking code
  v_booking_code := upper(substring(md5(random()::text) from 1 for 6));

  -- 6. Insert booking
  INSERT INTO bookings (
    booking_code, player_id, pitch_id, slot_id, 
    total_price, platform_fee, owner_amount, payment_method
  )
  VALUES (
    v_booking_code, p_player_id, v_slot.pitch_id, p_slot_id,
    v_slot.price, v_platform_fee, v_owner_amount, p_payment_method
  ) RETURNING id INTO v_booking_id;

  -- 7. Update slot status
  UPDATE time_slots 
  SET status = 'booked' 
  WHERE id = p_slot_id;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'booking_code', v_booking_code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function 2: Cancel Booking
CREATE OR REPLACE FUNCTION cancel_booking(
  p_booking_id uuid,
  p_user_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_booking record;
  v_slot_date date;
  v_slot_time time;
  v_cancellation_hours numeric;
  v_hours_difference numeric;
BEGIN
  -- 1. Lock booking
  SELECT * INTO v_booking 
  FROM bookings 
  WHERE id = p_booking_id 
  FOR UPDATE;

  -- 2. Validate state
  IF v_booking.status = 'cancelled' THEN
    RAISE EXCEPTION 'Booking is already cancelled';
  END IF;

  -- 3. Verify user authorization (Player or Admin)
  -- Simplified check, actual auth is handled by RLS and Edge Function
  IF v_booking.player_id != p_user_id AND 
     (SELECT role FROM users WHERE id = p_user_id) != 'admin' THEN
    RAISE EXCEPTION 'Not authorized to cancel this booking';
  END IF;

  -- 4. Check cancellation policy
  SELECT slot_date, start_time INTO v_slot_date, v_slot_time
  FROM time_slots WHERE id = v_booking.slot_id;

  SELECT (value->>'hours')::numeric INTO v_cancellation_hours
  FROM app_settings WHERE id = 'cancellation_policy';
  
  IF v_cancellation_hours IS NULL THEN v_cancellation_hours := 2; END IF;

  v_hours_difference := extract(epoch from ((v_slot_date + v_slot_time) - now())) / 3600;

  IF v_hours_difference < v_cancellation_hours THEN
    RAISE EXCEPTION 'Cannot cancel within % hours of the match', v_cancellation_hours;
  END IF;

  -- 5. Update booking status
  UPDATE bookings SET status = 'cancelled' WHERE id = p_booking_id;

  -- 6. Free up the slot
  UPDATE time_slots SET status = 'available' WHERE id = v_booking.slot_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Booking cancelled successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
