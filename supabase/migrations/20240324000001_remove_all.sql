-- Remove all auth users (except admin)
DELETE FROM auth.users WHERE email != 'admin999@gmail.com';

-- Remove all sessions
DELETE FROM auth.sessions;

-- Remove all refresh tokens
DELETE FROM auth.refresh_tokens;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_referral() CASCADE;
DROP FUNCTION IF EXISTS public.handle_withdrawal() CASCADE;

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
END $$;

-- Drop all tables
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.videos CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.withdrawals CASCADE;
DROP TABLE IF EXISTS public.rewards CASCADE;

-- Disable RLS
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rewards DISABLE ROW LEVEL SECURITY; 