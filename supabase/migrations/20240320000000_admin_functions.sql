-- Function to increment user coins
CREATE OR REPLACE FUNCTION increment_user_coins(user_id UUID, coins_to_add INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET coins = COALESCE(coins, 0) + coins_to_add
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment video views
CREATE OR REPLACE FUNCTION increment_views(video_id UUID, views_to_add INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE videos
  SET views = COALESCE(views, 0) + views_to_add
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 