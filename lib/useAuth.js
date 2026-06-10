import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { useRouter } from 'next/router'

export function useAuth(requireAuth = false) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (requireAuth && !session?.user) router.replace('/login')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (requireAuth && !session?.user) router.replace('/login')
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return { user, loading, signOut }
}
