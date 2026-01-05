-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

-- Allow public read access to gallery images
CREATE POLICY "Gallery images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Allow anyone to upload images (for admin use)
CREATE POLICY "Anyone can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery');

-- Allow anyone to delete gallery images (for admin use)
CREATE POLICY "Anyone can delete gallery images"
ON storage.objects FOR DELETE
USING (bucket_id = 'gallery');