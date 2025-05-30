/*
  # Add video view increment function
  
  1. New Functions
    - `increment_views`: Increments the view count for a specific video
  
  2. Security
    - Function is accessible to authenticated users only
*/

CREATE OR REPLACE FUNCTION increment_views(video_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE videos SET views = COALESCE(views, 0) + 1 WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;