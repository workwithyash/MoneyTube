-- Create referral_codes table
CREATE TABLE public.referral_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Create referral_usage table to track who used which code
CREATE TABLE public.referral_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('signup', 'referral_page')),
    UNIQUE(referred_id)
);

-- Add RLS policies for referral_codes
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referral codes are viewable by everyone"
    ON public.referral_codes FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own referral code"
    ON public.referral_codes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for referral_usage
ALTER TABLE public.referral_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referral usage is viewable by everyone"
    ON public.referral_usage FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own referral usage"
    ON public.referral_usage FOR INSERT
    WITH CHECK (auth.uid() = referred_id);

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
BEGIN
    LOOP
        -- Generate a random 8-character code
        new_code := upper(substring(md5(random()::text) from 1 for 8));
        -- Check if code exists
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.referral_codes WHERE code = new_code);
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to handle referral rewards
CREATE OR REPLACE FUNCTION handle_referral_reward(
    referrer_id UUID,
    referred_id UUID,
    reward_type TEXT
)
RETURNS void AS $$
DECLARE
    referrer_coins INTEGER;
    referred_coins INTEGER;
BEGIN
    -- Set rewards based on type
    IF reward_type = 'signup' THEN
        referrer_coins := 40;
        referred_coins := 10;
    ELSIF reward_type = 'referral_page' THEN
        referrer_coins := 0;
        referred_coins := 60;
    END IF;

    -- Add coins to referrer if applicable
    IF referrer_coins > 0 THEN
        PERFORM increment_user_coins(referrer_id, referrer_coins);
    END IF;

    -- Add coins to referred user
    PERFORM increment_user_coins(referred_id, referred_coins);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS referral_codes_user_id_idx ON public.referral_codes(user_id);
CREATE INDEX IF NOT EXISTS referral_codes_code_idx ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS referral_usage_referrer_id_idx ON public.referral_usage(referrer_id);
CREATE INDEX IF NOT EXISTS referral_usage_referred_id_idx ON public.referral_usage(referred_id); 