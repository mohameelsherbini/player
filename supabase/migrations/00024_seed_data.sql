-- ============================================
-- Migration 00024: Seed Data
-- ============================================

-- Insert default amenities
INSERT INTO amenities (name_ar, name_en, icon) VALUES
  ('حمام', 'Bathroom', 'shower'),
  ('غرفة تغيير ملابس', 'Locker Room', 'door-open'),
  ('موقف سيارات', 'Parking', 'car'),
  ('كافتيريا', 'Cafeteria', 'coffee'),
  ('إنارة ليلية', 'Night Lighting', 'lightbulb'),
  ('مدرجات', 'Tribunes', 'users'),
  ('مياه شرب', 'Drinking Water', 'tint'),
  ('واي فاي', 'Wi-Fi', 'wifi'),
  ('مسجد / مصلى', 'Prayer Room', 'moon'),
  ('تأجير كرات', 'Ball Rental', 'futbol-o')
ON CONFLICT DO NOTHING;

-- Insert default app settings
INSERT INTO app_settings (id, value, description) VALUES
  ('platform_fee', '{"percentage": 7}', 'Platform commission percentage per booking'),
  ('cancellation_policy', '{"hours": 2}', 'Minimum hours before start time allowed for cancellation')
ON CONFLICT (id) DO UPDATE 
SET value = EXCLUDED.value, description = EXCLUDED.description;
