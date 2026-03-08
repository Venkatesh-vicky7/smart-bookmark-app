# Smart Bookmark App

A modern, real-time bookmark manager built with React, Supabase, and Tailwind CSS.

## Live Demo

**Vercel URL:** https://smart-bookmark-app-three-rust.vercel.app

**GitHub Repository:** https://github.com/Venkatesh-vicky7/smart-bookmark-app

## Features

- **Google OAuth Authentication** - Secure sign-in with Google
- **Real-time Sync** - Changes sync instantly across all devices using Supabase Realtime
- **CRUD Operations** - Add, view, and delete bookmarks
- **Modern UI** - Clean, responsive design with Tailwind CSS
- **Row Level Security** - Your bookmarks are private and secure

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Database + Realtime)
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/Venkatesh-vicky7/smart-bookmark-app.git
cd smart-bookmark-app

# Install dependencies
pnpm install

# Create .env file
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
pnpm dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Setup

### 1. Create a Supabase Project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Create the `bookmarks` table

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL
);
```

### 3. Enable Row Level Security

```sql
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON bookmarks FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own bookmarks
CREATE POLICY "Users can insert their own bookmarks"
ON bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
ON bookmarks FOR DELETE
USING (auth.uid() = user_id);
```

### 4. Configure Google OAuth

1. Go to **Authentication > Providers > Google** in Supabase Dashboard
2. Enable Google provider
3. Add your Google Cloud OAuth credentials:
   - Client ID
   - Client Secret
4. Add your domain to **Authorized Redirect URLs**

## Deployment

### Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Add the environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## Challenges Faced & Solutions

### Challenge 1: Environment Variables Not Loading in Vercel
**Problem:** The initial vercel.json had references to Vercel secrets that didn't exist, causing deployment errors.

**Solution:** Removed the secret references from vercel.json and passed environment variables directly via CLI during deployment.

### Challenge 2: Sensitive API Keys Exposed in GitHub
**Problem:** The .env file with real Supabase credentials was accidentally committed to GitHub.

**Solution:**
- Removed .env from git tracking
- Updated .gitignore to exclude .env files
- Replaced actual keys with placeholder values
- Force-pushed to update GitHub history

### Challenge 3: Supabase Connection Timeout
**Problem:** Users experienced ERR_CONNECTION_TIMED_OUT when accessing the app.

**Solution:**
- Verified Supabase URL was accessible from server side
- Identified that free-tier Supabase projects pause after 7 days of inactivity
- User needed to resume the project from Supabase Dashboard
- Added redirect URLs in Google OAuth settings for Vercel domain

### Challenge 4: Real-time Sync Implementation
**Problem:** Needed to implement live updates across multiple devices/sessions.

**Solution:** Used Supabase Realtime subscriptions in the Dashboard component to listen for INSERT and DELETE events on the bookmarks table, filtering by user_id for security.

## AI Tools Used

- **MiniMax Agent** - Used as the primary AI assistant for:
  - Code generation and implementation
  - Project architecture planning
  - Debugging and error resolution
  - Documentation writing
  - Deployment automation

## How Authentication & Privacy Were Handled

1. **Google OAuth**: Users sign in via Google OAuth through Supabase
2. **Row Level Security (RLS)**: Database policies ensure users can only access their own bookmarks
3. **User ID Tracking**: Every bookmark is linked to the authenticated user's ID
4. **No Public Access**: RLS policies prevent any cross-user data access

## How Real-time Updates Were Implemented

```typescript
// Using Supabase Realtime subscription
const channel = supabase
  .channel('bookmarks')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'bookmarks',
      filter: `user_id=eq.${user.id}`,
    },
    (payload) => {
      // Handle INSERT, UPDATE, DELETE events
    }
  )
  .subscribe()
```

This ensures that when a user adds or removes a bookmark in one tab/device, all other open tabs/devices update instantly without page refresh.

## Project Structure

```
src/
├── contexts/         # React contexts
│   └── AuthContext.tsx    # Authentication state management
├── components/       # Reusable components
│   └── ProtectedRoute.tsx # Route protection
├── pages/            # Page components
│   ├── Login.tsx          # Google OAuth login
│   └── Dashboard.tsx      # Main bookmark management
├── lib/              # Utilities
│   └── supabase.ts        # Supabase client
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## License

MIT License

## Author

Created by Venkatesh with MiniMax Agent assistance
