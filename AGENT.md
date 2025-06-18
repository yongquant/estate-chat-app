# Real Estate Assistant - Agent Reference

This document contains essential information for AI agents working on this codebase.

## 📁 Project Overview

A production-ready real estate chat application providing non-legal advice and educational information about property matters. Built with Next.js, React, TailwindCSS, Shadcn, and Supabase.

## 🛠 Development Commands

```bash
# Development
npm run dev          # Start development server (typically runs on port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm run build        # Validates TypeScript and builds successfully
```

## 🏗 Architecture

### Frontend Stack
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **TailwindCSS** for styling
- **Shadcn UI** components
- **Lucide React** for icons

### Backend & Database
- **Supabase** for database, authentication, and storage
- **Row Level Security (RLS)** for data protection
- **Magic link authentication** (passwordless)

### Key Components

```
src/
├── app/
│   ├── layout.tsx               # Root layout with metadata
│   └── page.tsx                 # Main application page (force-dynamic)
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx    # Main chat container
│   │   ├── ChatMessage.tsx      # Message display with metadata
│   │   ├── ChatInput.tsx        # Input with document upload
│   │   └── DocumentUpload.tsx   # File upload component
│   ├── sidebar/
│   │   ├── Sidebar.tsx         # Responsive sidebar
│   │   ├── ConversationsList.tsx # Chat history
│   │   └── LegalAreasPanel.tsx  # Real estate topics
│   └── ui/                     # Shadcn components
├── hooks/
│   └── useChat.ts              # Main chat logic & Supabase integration
├── lib/
│   ├── supabase.ts            # Supabase client & database types
│   └── utils.ts               # Utility functions
└── types/
    └── chat.ts                # TypeScript interfaces
```

## 🏠 Real Estate Specialization

### Topics Covered
- Buying & Selling
- Landlord-Tenant
- Property Disputes  
- Financing & Mortgages
- Zoning & Permits
- Property Management
- Commercial Real Estate
- Estate & Property Transfer

### AI Response Logic
Located in `src/hooks/useChat.ts` - `simulateLegalAIResponse` function:
- Keyword-based area detection
- Real estate-specific responses
- Confidence scoring (0.7-1.0)
- Automatic disclaimers
- Citation references

## 🔧 Configuration

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_NAME="Real Estate Assistant"
```

### Database Schema
See `supabase-schema.sql` for complete setup:
- `user_profiles` - User information
- `conversations` - Chat sessions
- `messages` - Individual messages with metadata

## 🚨 Important Notes

### Build Configuration
- Uses `export const dynamic = 'force-dynamic'` in page.tsx to avoid build-time Supabase issues
- Dummy environment values in `src/lib/supabase.ts` for build compatibility

### Legal Compliance
- All responses include disclaimers
- Confidence indicators shown
- Emphasizes educational purpose only
- Encourages consultation with qualified attorneys

### Security
- RLS enabled on all tables
- User data isolation
- Secure file upload handling
- Input validation

## 🎯 Development Guidelines

### Code Style
- TypeScript throughout
- Functional components with hooks
- Tailwind for styling
- Consistent naming (camelCase for JS, kebab-case for files)

### Component Patterns
- Props interfaces defined inline or exported
- Error handling in async operations
- Loading states for better UX
- Responsive design with mobile-first approach

### Real Estate Focus
- All content tailored to property matters
- Specific terminology and examples
- State/location-aware disclaimers
- Document types relevant to real estate

## 🚀 Deployment

### Vercel (Recommended)
- Uses `vercel.json` configuration
- Environment variables set in dashboard
- Automatic deployments from Git

### Alternative Platforms
- Netlify, Railway, AWS Amplify, DigitalOcean
- Standard Next.js deployment process

## 🔄 Future Enhancements

### Planned Features
- Integration with real AI services (OpenAI, Anthropic)
- Document processing and analysis
- State-specific legal information
- Advanced search and filtering
- Export conversation summaries

### Integration Points
- AI service integration in `useChat.ts`
- File processing in `DocumentUpload.tsx`
- Enhanced metadata in message storage
