# Quick Setup Guide

## Step 1: Create `.env.local` file

Create a file named `.env.local` in the root directory with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qmxguuxuqdeeeshullwx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 2: Get your Supabase Anon Key

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **anon/public** key
5. Paste it in your `.env.local` file

## Step 3: Set up the database

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the query

## Step 4: Configure Google OAuth

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - Get Client ID and Client Secret from [Google Cloud Console](https://console.cloud.google.com/)
   - Add authorized redirect URL: `http://localhost:3000/auth/callback` (for local dev)
4. Save

## Step 5: Run the app

```bash
npm run dev
```

The app should now work at http://localhost:3000
