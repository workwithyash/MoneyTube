-- Create admin user in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin999@gmail.com',
  crypt('mlpnkobj', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Get the admin user's ID
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin999@gmail.com';

  -- Create admin profile
  INSERT INTO public.profiles (
    id,
    username,
    email,
    avatar_url,
    coins,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'admin999',
    'admin999@gmail.com',
    null,
    0,
    now(),
    now()
  );
END $$; 