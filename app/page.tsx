import { createClient } from '@/lib/supabase/server'
import AuthButton from '@/components/AuthButton'
import BookmarksList from '@/components/BookmarksList'
import AddBookmarkForm from '@/components/AddBookmarkForm'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Smart Bookmark App
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Sign in with Google to manage your bookmarks
          </p>
          <AuthButton />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Smart Bookmark App
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome, {user.email || user.user_metadata?.full_name || 'User'}
              </p>
            </div>
            <AuthButton />
          </div>
          <AddBookmarkForm />
        </div>
        <BookmarksList userId={user.id} />
      </div>
    </main>
  )
}
