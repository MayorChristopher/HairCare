-- Create missing profile for existing authenticated user
-- Run this script in your Supabase SQL editor after fixing RLS policies

-- First, let's check if the user exists in auth.users but not in profiles
-- and create the missing profile

DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through all users in auth.users who don't have a profile
    FOR user_record IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL
    LOOP
        -- Insert missing profile
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (
            user_record.id,
            user_record.email,
            COALESCE(
                user_record.raw_user_meta_data->>'full_name',
                user_record.raw_user_meta_data->>'name',
                split_part(user_record.email, '@', 1)
            ),
            'user'
        );
        
        RAISE NOTICE 'Created profile for user: %', user_record.email;
    END LOOP;
END $$;

-- Verify the profiles were created
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at
FROM profiles p
ORDER BY p.created_at DESC;