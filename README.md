# Real Estate Assistant - AI-Powered Property Guidance

A production-ready real estate chat interface built with Next.js, React, TailwindCSS, Shadcn, and Supabase. This application provides non-legal advice and educational information about real estate matters.

## 🏠 Features

- **Real Estate Domain Focus**: Specialized categories for different areas of property law
- 💬 **Real-time Chat**: Streaming responses with typing indicators  
- 📚 **Real Estate Areas**: Pre-defined categories (Buying/Selling, Landlord-Tenant, Property Disputes, Financing, etc.)
- 📁 **Document Upload**: Upload and analyze real estate documents (contracts, leases, deeds)
- 🔐 **Authentication**: Secure email-based authentication with Supabase
- 💾 **Persistent Storage**: Chat history and conversation management
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⚖️ **Legal Disclaimers**: Built-in disclaimers and confidence indicators
- 🎨 **Modern UI**: Clean, professional interface with Shadcn components

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS, Shadcn UI
- **Backend**: Supabase (Database, Authentication, Storage)
- **Icons**: Lucide React

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 2. Setup Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema in `supabase-schema.sql` in your Supabase SQL editor
3. Get your Supabase URL and anon key from the project settings

### 3. Environment Configuration

Copy the provided `.env.local` file and update with your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_NAME="Real Estate Assistant"
NEXT_PUBLIC_APP_DESCRIPTION="AI-powered non-legal advice for real estate matters"
```

### 4. Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                          # Next.js app router
│   ├── layout.tsx               # Root layout with metadata
│   └── page.tsx                 # Main chat application page
├── components/                   # React components
│   ├── chat/                    # Chat-related components
│   │   ├── ChatInterface.tsx    # Main chat container
│   │   ├── ChatMessage.tsx      # Individual message display
│   │   ├── ChatInput.tsx        # Message input with file upload
│   │   └── DocumentUpload.tsx   # Document upload component
│   ├── sidebar/                 # Sidebar components
│   │   ├── Sidebar.tsx         # Main sidebar container
│   │   ├── ConversationsList.tsx # Chat history
│   │   └── LegalAreasPanel.tsx  # Real estate topics
│   └── ui/                     # Shadcn UI components
├── hooks/                      # Custom React hooks
│   └── useChat.ts             # Main chat functionality
├── lib/                       # Utilities and configurations
│   ├── supabase.ts           # Supabase client & types
│   └── utils.ts              # Utility functions
├── types/                     # TypeScript type definitions
│   └── chat.ts               # Chat-related types
└── styles/                    # Global styles
```

## 🏠 Real Estate Features

### Real Estate Topics
- **Buying & Selling**: Purchase agreements, closings, title issues
- **Landlord-Tenant**: Rental agreements, evictions, security deposits  
- **Property Disputes**: Boundary disputes, easements, neighbor issues
- **Financing & Mortgages**: Loan terms, foreclosures, refinancing
- **Zoning & Permits**: Building permits, zoning laws, development
- **Property Management**: HOA issues, maintenance, property taxes
- **Commercial Real Estate**: Commercial leases, investment properties
- **Estate & Property Transfer**: Inheritance, wills, property transfer

### Document Upload
- **Supported Documents**: Purchase agreements, leases, deeds, mortgages, inspection reports, HOA documents, tax records
- **File Types**: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
- **Privacy**: Secure processing with clear privacy notices

### Legal Metadata
- Confidence scoring for responses
- Real estate area classification
- Citation references
- Automatic disclaimers

## 🔒 Authentication

The app uses Supabase Auth with magic link email authentication:
- Passwordless login via email
- Secure session management
- Automatic user profile creation

## 📊 Database Schema

The application uses the following Supabase tables:

- `user_profiles`: User information and preferences
- `conversations`: Chat conversation metadata
- `messages`: Individual chat messages with real estate metadata

All tables include Row Level Security (RLS) for data protection.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## ⚖️ Important Legal Considerations

This application is designed to provide educational information only about real estate matters. Key considerations:

- **Not Legal Advice**: Always display legal disclaimers making it clear that responses are not legal advice
- **Encourage Professional Consultation**: Direct users to consult qualified real estate attorneys
- **State-Specific Laws**: Real estate laws vary significantly by location
- **Confidence Indicators**: Include confidence scores for AI responses
- **Citation Sources**: Provide references when possible

## 🔒 Security

- Row Level Security (RLS) enabled on all database tables
- User data isolation through Supabase Auth
- Environment variables for sensitive data
- Input validation and sanitization
- Secure document upload handling

## 🎨 Customization

### Adding New Real Estate Areas

Edit `src/components/sidebar/LegalAreasPanel.tsx` to add new real estate categories with appropriate keywords and examples.

### Modifying AI Responses

Update the `simulateLegalAIResponse` function in `src/hooks/useChat.ts` to integrate with your preferred AI service (OpenAI, Anthropic, etc.) for production use.

### Styling

The app uses TailwindCSS with Shadcn components. Customize the theme in `tailwind.config.js` and `src/app/globals.css`.

## 🧪 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For questions or issues:
- Open a GitHub issue
- Check the documentation
- Review the Supabase setup guide

---

**Disclaimer**: This application provides educational information about real estate matters only. It does not constitute legal advice. Always consult with qualified real estate attorneys for specific legal matters.
