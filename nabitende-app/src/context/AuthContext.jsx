import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

const ROLE_HOME = {
  admin:      '/admin/dashboard',
  teacher:    '/teacher/dashboard',
  parent:     '/parent/dashboard',
  student:    '/student/dashboard',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On load, check if a Supabase session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadProfile(session.user)
      else setLoading(false)
    })

    // Keep user in sync if the session changes elsewhere (tab refresh, sign out, etc.)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadProfile(session.user)
      else { setUser(null); setLoading(false) }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function loadProfile(authUser) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (error) {
      console.error('Failed to load profile:', error)
      setUser(null)
    } else {
      setUser({ ...profile, email: authUser.email })
    }
    setLoading(false)
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) return { ok: false, error: 'Could not load user profile.' }

    setUser({ ...profile, email: data.user.email })
    return { ok: true, home: ROLE_HOME[profile.role] }
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}