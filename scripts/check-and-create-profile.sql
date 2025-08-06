-- Check if your user profile exists and create it if missing
-- Run this script in your Supabase SQL Editor

-- First, let's see what users exist in auth.users
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data->>'full_name' as full_name_from_meta
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Check what profiles exist
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM profiles
ORDER BY created_at DESC;

-- Create profiles for any users that don't have them
INSERT INTO profiles (id, email, full_name, role)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        split_part(au.email, '@', 1)
    ) as full_name,
    'user' as role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Show the final result
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    'Profile exists' as status
FROM profiles p
UNION ALL
SELECT 
    au.id,
    au.email,
    'No profile' as full_name,
    'N/A' as role,
    'Missing profile' as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY status, email;