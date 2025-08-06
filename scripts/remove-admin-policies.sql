-- Remove the problematic admin policies that cause infinite recursion
-- Run this script in your Supabase SQL Editor

-- Remove admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can view all messages" ON messages;

-- Verify policies are removed
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'conversations', 'messages')
ORDER BY tablename, policyname;