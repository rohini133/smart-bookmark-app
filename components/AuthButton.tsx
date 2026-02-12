'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthButton() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      router.refresh()
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  const handleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) {
        console.error('Error signing in:', error)
        alert('Failed to sign in. Please try again.')
      }
    } catch (err) {
      console.error('Error initiating OAuth:', err)
      alert('Failed to sign in. Please try again.')
    }
  }

  const handleSignOut = async () => {
    await fetch('/auth/signout', {
      method: 'POST',
    })
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
      >
        Loading...
      </button>
    )
  }

  if (user) {
    return (
      <button
        onClick={handleSignOut}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Sign Out
      </button>
    )
  }

  return (
    <button
      onClick={handleSignIn}
      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold w-full"
    >
      Sign in with Google
    </button>
  )
}
