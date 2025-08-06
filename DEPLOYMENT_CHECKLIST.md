# HairCare AI Deployment Checklist

## 1. Supabase Setup
- [ ] Create Supabase project
- [ ] Run the database setup SQL script
- [ ] Verify tables are created (profiles, conversations, messages)
- [ ] Test the user creation trigger
- [ ] Note down Project URL and anon key

## 2. Vercel Environment Variables
Add these in Vercel Dashboard > Settings > Environment Variables:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

## 3. Deployment Steps
- [ ] Push code to GitHub repository
- [ ] Connect repository to Vercel
- [ ] Add environment variables in Vercel
- [ ] Deploy the application
- [ ] Test user registration after deployment

## 4. Post-Deployment Testing
- [ ] Test user sign up/sign in
- [ ] Verify profile creation
- [ ] Test chat functionality
- [ ] Create admin user (manually in Supabase)
- [ ] Test admin dashboard access

## 5. Creating Admin User
In Supabase SQL Editor, run:
\`\`\`sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
\`\`\`

## 6. Troubleshooting
If you still get database errors:
- Check Vercel function logs
- Verify environment variables are set
- Check Supabase logs for RLS policy issues
- Ensure database trigger is working
