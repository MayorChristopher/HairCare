-- Create a demo user for testing
-- Run this after setting up the database

-- First, create the auth user (you might need to do this through the Supabase dashboard)
-- Or you can insert directly if you have the right permissions

-- Insert demo profile (adjust the UUID to match your demo user)
INSERT INTO profiles (id, email, full_name, role, hair_type, scalp_condition, hair_concerns)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Replace with actual user UUID
  'demo@haircare.ai',
  'Demo User',
  'user',
  'curly',
  'dry',
  ARRAY['Frizz', 'Dryness', 'Split Ends']
) ON CONFLICT (id) DO UPDATE SET
  hair_type = EXCLUDED.hair_type,
  scalp_condition = EXCLUDED.scalp_condition,
  hair_concerns = EXCLUDED.hair_concerns;

-- Create an admin user (replace email with your actual email)
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
