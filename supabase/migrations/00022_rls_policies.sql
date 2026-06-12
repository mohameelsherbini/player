-- ============================================
-- Migration 00022: RLS Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- pitches
CREATE POLICY "Anyone can view active pitches" ON pitches
  FOR SELECT USING (status = 'active');

CREATE POLICY "Owners can view all their pitches" ON pitches
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners can update their pitches" ON pitches
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert pitches" ON pitches
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- time_slots
CREATE POLICY "Anyone can view available time_slots" ON time_slots
  FOR SELECT USING (status = 'available');

CREATE POLICY "Owners can view all their time_slots" ON time_slots
  FOR SELECT USING (
    pitch_id IN (SELECT id FROM pitches WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners can update their time_slots" ON time_slots
  FOR UPDATE USING (
    pitch_id IN (SELECT id FROM pitches WHERE owner_id = auth.uid())
  );

-- bookings
CREATE POLICY "Players can view their bookings" ON bookings
  FOR SELECT USING (player_id = auth.uid());

CREATE POLICY "Owners can view bookings for their pitches" ON bookings
  FOR SELECT USING (
    pitch_id IN (SELECT id FROM pitches WHERE owner_id = auth.uid())
  );

-- reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Players can insert reviews for their bookings" ON reviews
  FOR INSERT WITH CHECK (player_id = auth.uid());

-- favorites
CREATE POLICY "Players can manage their favorites" ON favorites
  FOR ALL USING (player_id = auth.uid());

-- notifications
CREATE POLICY "Users can manage their notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Admin override (Applied to all tables via a function or check)
-- Example for pitches:
CREATE POLICY "Admins can do everything on pitches" ON pitches
  FOR ALL USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );
