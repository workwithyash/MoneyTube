-- Update storage policy to allow larger file uploads (5GB)
ALTER POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = 'public' AND
    (storage.foldername(name))[2] = auth.uid()::text AND
    pg_size_pretty(length(data))::text <= '5GB'
  );

-- Update storage policy for public access
ALTER POLICY "Allow public access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'videos'); 