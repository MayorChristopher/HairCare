# Final Deployment Steps

## 1. Supabase Setup (5 minutes)
1. Create new Supabase project
2. Copy Project URL and anon key
3. Go to SQL Editor
4. Run `scripts/setup-database-no-email-confirmation.sql`
5. Verify tables created: profiles, conversations, messages
6. Disable email confirmation: Authentication > Settings > Enable email confirmations = OFF

## 2. Vercel Deployment (3 minutes)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
4. Deploy

## 3. Post-Deployment Testing (2 minutes)
1. Visit deployed URL
2. Test user registration (should work immediately with email confirmation off)
3. Test chat functionality
4. Create admin user:
   \`\`\`sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   \`\`\`
5. Test admin dashboard access

## 4. Demo Data (Optional)
Create demo user for presentations:
\`\`\`sql
-- In Supabase SQL Editor
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'demo@haircare.ai',
  crypt('demo123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
\`\`\`

## Total Setup Time: ~10 minutes
