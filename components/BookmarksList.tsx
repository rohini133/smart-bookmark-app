'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Bookmark {
  id: string
  url: string
  title: string
  created_at: string
}

interface BookmarksListProps {
  userId: string
}

export default function BookmarksList({ userId }: BookmarksListProps) {
  const supabase = createClient()
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        setBookmarks(data || [])
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Failed to load bookmarks')
      } finally {
        setLoading(false)
      }
    }

    fetchBookmarks()

    // Set up real-time subscription
    const channel = supabase
      .channel('bookmarks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Real-time update:', payload)
          // Refresh bookmarks when changes occur
          fetchBookmarks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error

      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to delete bookmark')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Bookmarks</h2>
        <p className="text-gray-600">Loading bookmarks...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Bookmarks</h2>
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Bookmarks</h2>
      {bookmarks.length === 0 ? (
        <p className="text-gray-600">No bookmarks yet. Add one above to get started!</p>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-semibold block truncate"
                >
                  {bookmark.title}
                </a>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 text-sm block truncate"
                >
                  {bookmark.url}
                </a>
                <p className="text-gray-400 text-xs mt-1">
                  {new Date(bookmark.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(bookmark.id)}
                className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
