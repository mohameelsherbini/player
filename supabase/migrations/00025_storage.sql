-- 00025_storage.sql
-- Create storage buckets for Yalla Book platform

-- Create pitch-images bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('pitch-images', 'pitch-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create ad-images bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-images', 'ad-images', true)
ON CONFLICT (id) DO NOTHING;

-- Setup Storage Policies

-- 1. pitch-images: Public can view, authenticated can upload
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'pitch-images');

CREATE POLICY "Authenticated users can upload pitch images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pitch-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update and delete their own pitch images" ON storage.objects
  FOR ALL USING (bucket_id = 'pitch-images' AND auth.uid() = owner);

-- 2. avatars: Public can view, users can upload/update their own
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

CREATE POLICY "Users can update and delete their own avatar" ON storage.objects
  FOR ALL USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- 3. ad-images: Public can view, only admin can upload/update (admin role logic to be enforced via RLS or App layer)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'ad-images');

CREATE POLICY "Authenticated users can upload ad images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'ad-images' AND auth.role() = 'authenticated');
