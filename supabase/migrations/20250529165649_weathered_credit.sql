-- Create table for user rewards and earnings
CREATE TABLE public.user_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  video_id UUID REFERENCES public.videos(id),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('ad_watch', 'video_milestone')),
  coins_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for daily upload tracking
CREATE TABLE public.daily_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  upload_count INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, upload_date)
);

-- Create table for ad watch tracking
CREATE TABLE public.ad_watches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  video_id UUID REFERENCES public.videos(id) NOT NULL,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reward_given BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, video_id)
);

-- Add coins column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins INTEGER NOT NULL DEFAULT 0;

-- Add milestone_rewards_claimed column to videos table
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS milestone_rewards_claimed JSONB DEFAULT '{}';

-- Enable RLS on new tables
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_watches ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_rewards
CREATE POLICY "Users can view their own rewards" 
  ON public.user_rewards 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards" 
  ON public.user_rewards 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for daily_uploads
CREATE POLICY "Users can view their own upload counts" 
  ON public.daily_uploads 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own upload counts" 
  ON public.daily_uploads 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own upload counts" 
  ON public.daily_uploads 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for ad_watches
CREATE POLICY "Users can view their own ad watches" 
  ON public.ad_watches 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ad watches" 
  ON public.ad_watches 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Function to increment user coins
CREATE OR REPLACE FUNCTION public.increment_user_coins(user_id UUID, coins_to_add INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET coins = coins + coins_to_add 
  WHERE id = user_id;
END;
$$;