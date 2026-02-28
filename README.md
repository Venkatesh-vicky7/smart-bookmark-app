# Smart Bookmark App

A modern, real-time bookmark manager built with React, Supabase, and Tailwind CSS.

![Smart Bookmark App](https://img.shields.io/badge/Live-Demo-blue)
![Vercel](https://vercelbadge.vercel.app/api/your-username/smart-bookmark-app)

## Features

- **Google OAuth Authentication** - Secure sign-in with Google
- **Real-time Sync** - Changes sync instantly across all devices
- **CRUD Operations** - Add, view, and delete bookmarks
- **Modern UI** - Clean, responsive design with Tailwind CSS
- **Row Level Security** - Your bookmarks are private and secure

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Database + Realtime)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/smart-bookmark-app.git
cd smart-bookmark-app

# Install dependencies
pnpm install

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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/smart-bookmark-app)

1. Click the button above or go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Add the environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Build for Production

```bash
pnpm build
```

The built files will be in the `dist` directory.

## Live Demo

**[Live URL: https://your-vercel-app.vercel.app](https://your-vercel-app.vercel.app)**

## Project Structure

```
src/
├── contexts/         # React contexts
│   └── AuthContext.tsx
├── components/       # Reusable components
│   └── ProtectedRoute.tsx
├── pages/            # Page components
│   ├── Login.tsx
│   └── Dashboard.tsx
├── lib/              # Utilities
│   └── supabase.ts
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Author

Created by MiniMax Agent

---

## Environment Variables for Vercel

When deploying to Vercel, add these environment variables in your Vercel project settings:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

Get these from: **Supabase Dashboard > Settings > API**
