# Database Setup Instructions

## Important: You must set up the database before bookmarks will work!

The most common issue is that the `bookmarks` table doesn't exist in your Supabase database yet.

## Steps to Set Up the Database:

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Schema Script**
   - Copy the entire contents of `supabase/schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)

4. **Verify the Table was Created**
   - Go to "Table Editor" in the left sidebar
   - You should see a `bookmarks` table
   - It should have columns: `id`, `user_id`, `url`, `title`, `created_at`

5. **Check Row Level Security (RLS)**
   - In the Table Editor, click on the `bookmarks` table
   - Go to the "Policies" tab
   - You should see 4 policies:
     - Users can view their own bookmarks
     - Users can insert their own bookmarks
     - Users can delete their own bookmarks
     - Users can update their own bookmarks

6. **Enable Realtime (if needed)**
   - Go to "Database" → "Replication" in the left sidebar
   - Make sure `bookmarks` table is enabled for replication

## Troubleshooting:

If you get an error when running the SQL:
- Make sure you're running the entire script
- If you see "relation already exists", that's okay - the table already exists
- If you see policy errors, you can drop existing policies first:
  ```sql
  DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
  DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON bookmarks;
  DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;
  DROP POLICY IF EXISTS "Users can update their own bookmarks" ON bookmarks;
  ```
  Then run the schema.sql script again.

## After Setup:

Once the database is set up, try adding a bookmark again. It should work now!

If you still have issues:
1. Check the browser console (F12) for error messages
2. Make sure you're logged in
3. Verify the table exists in Supabase Table Editor
