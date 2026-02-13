'use client'

import { supabase } from '@/lib/supabase/client'
import { useState } from 'react'

interface AddBookmarkFormProps {
  onBookmarkAdded?: () => void
}

export default function AddBookmarkForm({ onBookmarkAdded }: AddBookmarkFormProps) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!url.trim()) {
      setError('URL is required')
      setLoading(false)
      return
    }

    // Validate URL
    let validUrl = url.trim()
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in to add bookmarks')
        setLoading(false)
        return
      }

      const { data: insertData, error: insertError } = await supabase
        .from('bookmarks')
        .insert({
          url: validUrl,
          title: title.trim() || validUrl,
          user_id: user.id,
        })
        .select()

      if (insertError) {
        console.error('Insert error:', insertError)
        throw insertError
      }

      console.log('Bookmark inserted successfully:', insertData)
      setUrl('')
      setTitle('')
      
      // Notify parent component to refresh bookmarks (optional, realtime will handle it)
      if (onBookmarkAdded) {
        onBookmarkAdded()
      }
    } catch (err: any) {
      console.error('Error adding bookmark:', err)
      const errorMessage = err.message || 'Failed to add bookmark'
      
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
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          URL
        </label>
        <input
          id="url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
      </div>
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title (optional)
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Bookmark title"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
      </div>
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
      >
        {loading ? 'Adding...' : 'Add Bookmark'}
      </button>
    </form>
  )
}
