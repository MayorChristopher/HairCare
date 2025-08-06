# HairCare AI Assistant

A comprehensive AI-powered hair care recommendation system built with Next.js, featuring a ChatGPT-like interface for personalized hair care advice.

## Features

### 🤖 AI Chat Interface
- ChatGPT-style conversation interface
- Real-time mock AI responses using keyword matching
- Personalized recommendations based on user hair profile
- Conversation history and management

### 👤 User Management
- Secure authentication with Supabase
- Detailed hair profile system (hair type, scalp condition, concerns)
- Role-based access control (User/Admin)
- Profile customization and management

### 📊 Admin Dashboard
- User management and analytics
- Conversation monitoring
- System usage statistics
- Admin-only access controls

### 💬 Smart Recommendations
- Keyword-based response matching
- Profile-aware suggestions
- Suggested prompts for common questions
- Contextual hair care advice

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **AI Logic**: Custom keyword matching system
- **Deployment**: Vercel-ready

## Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- Git

### Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd haircare-ai-assistant
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up Supabase**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Run the SQL setup script in the Supabase SQL editor

4. **Environment Variables**
Create a `.env.local` file:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

5. **Run the development server**
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## Database Setup

The application uses Supabase with the following tables:

- **profiles**: User information and hair profiles
- **conversations**: Chat conversation metadata  
- **messages**: Individual chat messages

Run the provided SQL script in your Supabase dashboard to set up the database schema with proper RLS policies.

## Project Structure

\`\`\`
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── chat/              # Main chat interface
│   ├── profile/           # User profile management
│   └── admin/             # Admin dashboard
├── components/            # Reusable React components
│   ├── auth/              # Authentication components
│   ├── chat/              # Chat interface components
│   └── ui/                # shadcn/ui components
├── data/                  # Mock data files
│   ├── responses.json     # AI response templates
│   └── prompts.json       # Suggested user prompts
├── lib/                   # Utility functions
│   ├── supabase.ts        # Supabase client
│   └── get-mock-response.ts # AI response logic
└── scripts/               # Database setup scripts
\`\`\`

## Key Features Explained

### Mock AI System
The application simulates AI responses using a keyword matching system:

- **responses.json**: Contains response templates with keywords and conditions
- **getMockResponse()**: Matches user input against keywords and user profile
- **Personalization**: Responses adapt based on hair type and scalp condition

### Authentication & Authorization
- Supabase Auth for secure user management
- Row Level Security (RLS) for data protection
- Role-based access (User/Admin)
- Protected routes with middleware

### Chat Interface
- Real-time conversation simulation
- Message persistence in database
- Conversation history and management
- Suggested prompts for user guidance

### Admin Features
- User analytics and management
- Conversation monitoring
- System usage statistics
- Admin-only dashboard access

## Customization

### Adding New Responses
Edit `data/responses.json` to add new AI response templates:

\`\`\`json
{
  "keywords": ["new", "keyword"],
  "hairType": "curly",
  "scalp": "dry", 
  "response": "Your personalized advice here..."
}
\`\`\`

### Modifying Hair Types/Conditions
Update the options in `app/profile/page.tsx`:

\`\`\`typescript
const hairTypes = [
  { value: 'new-type', label: 'New Hair Type' }
]
\`\`\`

### Styling Changes
The app uses Tailwind CSS with shadcn/ui components. Modify:
- `app/globals.css` for global styles
- Component files for specific styling
- `tailwind.config.ts` for theme customization

## Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
\`\`\`

## Academic Defense Points

### Technical Implementation
- **Architecture**: Modern Next.js app with server-side rendering
- **Database Design**: Normalized schema with proper relationships
- **Security**: RLS policies, authentication, and authorization
- **Performance**: Optimized queries and component rendering

### AI Simulation
- **Keyword Matching**: Sophisticated pattern matching system
- **Personalization**: Profile-based response customization
- **Scalability**: Easy to extend with new responses and logic

### User Experience
- **Interface Design**: ChatGPT-inspired, intuitive interface
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation

### System Features
- **Real-time Chat**: Simulated real-time conversation experience
- **Data Persistence**: All conversations and profiles saved
- **Admin Tools**: Comprehensive management dashboard
- **Role Management**: Secure multi-role system

## Future Enhancements

- Integration with real AI APIs (OpenAI, etc.)
- Advanced analytics and reporting
- Mobile app development
- Multi-language support
- Advanced recommendation algorithms
- Integration with hair product databases

## Support

For questions or issues:
1. Check the documentation
2. Review the code comments
3. Test with the provided mock data
4. Verify Supabase configuration

## License

This project is created for academic purposes. Please ensure proper attribution when using or modifying the code.
