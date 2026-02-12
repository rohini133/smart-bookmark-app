# Smart Bookmark App

A simple bookmark manager built with Next.js, Supabase, and Tailwind CSS. Features Google OAuth authentication, real-time updates, and private bookmarks per user.

## Features

- 🔐 Google OAuth authentication (no email/password)
- ➕ Add bookmarks with URL and optional title
- 🔒 Private bookmarks (users can only see their own)
- ⚡ Real-time updates (changes appear instantly across all tabs)
- 🗑️ Delete bookmarks
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** (Authentication, Database, Realtime)
- **Tailwind CSS** (Styling)
- **TypeScript**

## Prerequisites

- Node.js 18+ installed
- Supabase project (already configured)
- Google OAuth credentials configured in Supabase

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd smart-bookmark-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://qmxguuxuqdeeeshullwx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```
   
   You can find your Supabase anon key in your Supabase project settings under API.

4. **Set up the database**
   
   Run the SQL script in `supabase/schema.sql` in your Supabase SQL Editor:
   - Creates the `bookmarks` table
   - Sets up Row Level Security (RLS) policies
   - Enables Realtime subscriptions

5. **Configure Google OAuth in Supabase**
   
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials (Client ID and Client Secret)
   - Add authorized redirect URL: `https://your-vercel-url.vercel.app/auth/callback` (for production) and `http://localhost:3000/auth/callback` (for local development)

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment on Vercel

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Deploy

3. **Update Supabase redirect URLs**
   - After deployment, update the authorized redirect URL in Supabase to include your Vercel URL

## Problems Encountered and Solutions

### Problem 1: Real-time Updates Not Working Initially
**Issue**: When implementing real-time updates using Supabase Realtime, the changes weren't appearing in other browser tabs.

**Solution**: 
- Ensured that Realtime was enabled for the `bookmarks` table by adding it to the `supabase_realtime` publication
- Used the `postgres_changes` event listener with proper filtering by `user_id` to only receive updates for the current user
- Implemented proper cleanup of subscriptions in the `useEffect` return function to prevent memory leaks
- Added `router.refresh()` calls to ensure the UI updates when changes occur

### Problem 2: Row Level Security (RLS) Policies
**Issue**: Initially, users could see all bookmarks or couldn't access their own bookmarks due to missing or incorrect RLS policies.

**Solution**:
- Created comprehensive RLS policies for SELECT, INSERT, UPDATE, and DELETE operations
- All policies check that `auth.uid() = user_id` to ensure users can only access their own data
- Enabled RLS on the table with `ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY`

### Problem 3: Authentication State Management
**Issue**: The authentication state wasn't persisting correctly across page refreshes, and the user session wasn't being maintained.

**Solution**:
- Implemented proper Supabase SSR (Server-Side Rendering) setup using `@supabase/ssr`
- Created separate client and server-side Supabase clients
- Added middleware to refresh user sessions automatically
- Used `onAuthStateChange` listener in client components to react to auth state changes

### Problem 4: URL Validation and Formatting
**Issue**: Users could enter URLs without the `http://` or `https://` prefix, which would break the links.

**Solution**:
- Added URL validation in the `AddBookmarkForm` component
- Automatically prepend `https://` if the URL doesn't start with `http://` or `https://`
- Used the URL as the default title if no title is provided

### Problem 5: CORS and Redirect Issues with Google OAuth
**Issue**: Google OAuth redirect wasn't working correctly after authentication.

**Solution**:
- Created a dedicated `/auth/callback` route to handle the OAuth callback
- Used `exchangeCodeForSession` to properly exchange the authorization code for a session
- Ensured redirect URLs were correctly configured in both Supabase and Google OAuth console
- Used `window.location.origin` to dynamically set the redirect URL based on the current environment

### Problem 6: TypeScript Type Errors
**Issue**: Various TypeScript errors related to Supabase types and React component props.

**Solution**:
- Created proper TypeScript interfaces for bookmarks
- Used proper type assertions and optional chaining where needed
- Ensured all async functions have proper error handling with typed catch blocks

## Project Structure

```
smart-bookmark-app/
├── app/
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts          # OAuth callback handler
│   │   └── signout/
│   │       └── route.ts          # Sign out handler
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   ├── AddBookmarkForm.tsx       # Form to add bookmarks
│   ├── AuthButton.tsx            # Sign in/out button
│   └── BookmarksList.tsx        # List of bookmarks with real-time updates
├── lib/
│   └── supabase/
│       ├── client.ts             # Browser Supabase client
│       ├── middleware.ts         # Middleware helper
│       └── server.ts             # Server Supabase client
├── supabase/
│   └── schema.sql                # Database schema and RLS policies
├── middleware.ts                 # Next.js middleware
└── package.json
```

## Live URL

[Your Vercel deployment URL will be here after deployment]

## License

MIT
