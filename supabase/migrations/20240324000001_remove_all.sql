-- First, drop all dependent tables
DROP TABLE IF EXISTS public.ad_watches CASCADE;
DROP TABLE IF EXISTS public.user_rewards CASCADE;
DROP TABLE IF EXISTS public.rewards CASCADE;
DROP TABLE IF EXISTS public.withdrawals CASCADE;
DROP TABLE IF EXISTS public.videos CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.views CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_referral() CASCADE;
DROP FUNCTION IF EXISTS public.handle_withdrawal() CASCADE;
DROP FUNCTION IF EXISTS public.handle_ad_watch() CASCADE;

-- Drop all policies (if tables exist)
DO $$ 
BEGIN
    -- Profiles policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    END IF;

    -- Videos policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'videos') THEN
        DROP POLICY IF EXISTS "Anyone can view videos" ON public.videos;
        DROP POLICY IF EXISTS "Users can insert their own videos" ON public.videos;
        DROP POLICY IF EXISTS "Users can update their own videos" ON public.videos;
        DROP POLICY IF EXISTS "Users can delete their own videos" ON public.videos;
    END IF;

    -- Ad watches policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ad_watches') THEN
        DROP POLICY IF EXISTS "Users can view their own ad watches" ON public.ad_watches;
        DROP POLICY IF EXISTS "Users can insert their own ad watches" ON public.ad_watches;
    END IF;
END $$;

-- Now we can safely remove auth data
DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.users WHERE email != 'admin999@gmail.com';

-- Disable RLS
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rewards DISABLE ROW LEVEL SECURITY; 