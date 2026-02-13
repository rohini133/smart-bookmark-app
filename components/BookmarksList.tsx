'use client'

import { supabase } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
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
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookmarks = useCallback(async () => {
    try {
      console.log('Fetching bookmarks for user:', userId)
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching bookmarks:', error)
        throw error
      }

      console.log('Fetched bookmarks:', data)
      setBookmarks(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Error in fetchBookmarks:', err)
      const errorMessage = err.message || 'Failed to load bookmarks'
      
      // Provide more helpful error messages
      if (errorMessage.includes('relation') || errorMessage.includes('does not exist')) {
        setError('Database table not found. Please run the SQL schema in Supabase (see DATABASE_SETUP.md)')
      } else if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
        setError('Permission denied. Please check Row Level Security policies in Supabase.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchBookmarks()

    // Set up real-time subscription for cross-tab updates
    const channelName = `bookmarks-changes-${userId}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Real-time update received:', payload)
          // Re-fetch bookmarks on any event (INSERT, DELETE, UPDATE)
          fetchBookmarks()
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to realtime updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to realtime updates')
        } else if (status === 'TIMED_OUT') {
          console.warn('Realtime subscription timed out')
        } else if (status === 'CLOSED') {
          console.log('Realtime subscription closed')
        }
      })

    return () => {
      console.log('Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [userId, fetchBookmarks])

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

      if (error) {
        throw error
      }

      // Real-time subscription will handle the update
      console.log('Bookmark deleted successfully')
    } catch (err: any) {
      console.error('Error deleting bookmark:', err)
      alert(err.message || 'Failed to delete bookmark')
      // Re-fetch to ensure UI is in sync
      fetchBookmarks()
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
