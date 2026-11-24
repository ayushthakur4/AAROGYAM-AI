import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js'

const AuthContext = createContext(null)

export const DEMO_ACCOUNTS = [
  {
    id: 'demo-user-1',
    name: 'Aarav Patel',
    email: 'aarav.patel@wellness.in',
    avatar: '🧘‍♂️',
    recentQueries: ['Headache', 'Stress relief'],
  },
  {
    id: 'demo-user-2',
    name: 'Priya Sharma',
    email: 'priya.sharma@ayur.org',
    avatar: '🌿',
    recentQueries: ['Acidity', 'Common cold'],
  },
]

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [recentQueries, setRecentQueries] = useState([])
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  const userRef = useRef(user)
  userRef.current = user

  // Fetch past queries from Supabase DB, capped strictly at the 2 most recent unique queries
  const loadQueriesFromDb = useCallback(async (userId) => {
    if (!supabase || !userId) return []
    try {
      const { data, error } = await supabase
        .from('searches')
        .select('query, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.warn('Could not load past searches from Supabase DB:', error.message)
        return []
      }

      const unique = []
      for (const item of data || []) {
        const q = item.query?.trim()
        if (q && !unique.some((existing) => existing.toLowerCase() === q.toLowerCase())) {
          unique.push(q)
          if (unique.length === 2) break
        }
      }
      return unique
    } catch (err) {
      console.warn('Error reading searches from database:', err)
      return []
    }
  }, [])

  // Subscribe to Supabase Auth state changes
  useEffect(() => {
    let mounted = true

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
        if (!mounted) return
        setSession(initialSession)
        if (initialSession?.user) {
          const authUser = initialSession.user
          const profile = {
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.display_name || authUser.user_metadata?.name || authUser.email?.split('@')[0],
            avatar: '🌿',
          }
          setUser(profile)
          loadQueriesFromDb(authUser.id).then((queries) => {
            if (mounted) setRecentQueries(queries)
          })
        }
        setIsLoadingAuth(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return
        setSession(newSession)
        if (newSession?.user) {
          const authUser = newSession.user
          const profile = {
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.display_name || authUser.user_metadata?.name || authUser.email?.split('@')[0],
            avatar: '🌿',
          }
          setUser(profile)
          const queries = await loadQueriesFromDb(authUser.id)
          if (mounted) setRecentQueries(queries)
        } else {
          setUser(null)
          setRecentQueries([])
        }
        setIsLoadingAuth(false)
      })

      return () => {
        mounted = false
        subscription.unsubscribe()
      }
    } else {
      setIsLoadingAuth(false)
    }
  }, [loadQueriesFromDb])

  // Supabase Sign In with email & password
  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) {
      const mockUser = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
        avatar: '🌿',
      }
      setUser(mockUser)
      setIsAuthModalOpen(false)
      return { data: { user: mockUser }, error: null }
    }

    const res = await supabase.auth.signInWithPassword({ email, password })
    if (!res.error) {
      setIsAuthModalOpen(false)
    }
    return res
  }, [])

  // Supabase Sign Up with email, password & name
  const signUp = useCallback(async ({ email, password, name }) => {
    if (!supabase) {
      const mockUser = {
        id: `user-${Date.now()}`,
        name: name || email.split('@')[0],
        email,
        avatar: '🌿',
      }
      setUser(mockUser)
      setIsAuthModalOpen(false)
      return { data: { user: mockUser }, error: null }
    }

    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name?.trim() || email.split('@')[0],
          name: name?.trim() || email.split('@')[0],
        },
      },
    })
    if (!res.error && res.data?.session) {
      setIsAuthModalOpen(false)
    }
    return res
  }, [])

  // Supabase Sign Out
  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setSession(null)
    setRecentQueries([])
  }, [])

  // Demo / local account sign-in helper
  const loginDemo = useCallback((accountIndex = 0) => {
    const demo = DEMO_ACCOUNTS[accountIndex] || DEMO_ACCOUNTS[0]
    setUser({
      id: demo.id,
      name: demo.name,
      email: demo.email,
      avatar: demo.avatar,
    })
    setRecentQueries(demo.recentQueries.slice(0, 2))
    setIsAuthModalOpen(false)
  }, [])

  // Direct login helper (supports mock user or password credentials)
  const login = useCallback(async (userData) => {
    if (userData && userData.password) {
      return signIn(userData)
    }
    const profile = {
      id: userData.id || `user-${Date.now()}`,
      name: userData.name || userData.email?.split('@')[0],
      email: userData.email,
      avatar: userData.avatar || '🌿',
    }
    setUser(profile)
    if (userData.recentQueries) {
      setRecentQueries(userData.recentQueries.slice(0, 2))
    }
    setIsAuthModalOpen(false)
    return { data: { user: profile }, error: null }
  }, [signIn])

  /**
   * Save search query to Supabase DB and local state.
   * Strictly enforces: Only stores the past 2 queries!
   */
  const saveSearchQuery = useCallback(async (query) => {
    const trimmed = (query || '').trim()
    if (!trimmed) return

    setRecentQueries((existing) => [
      trimmed,
      ...existing.filter((q) => q.toLowerCase() !== trimmed.toLowerCase()),
    ].slice(0, 2))

    const activeUser = userRef.current
    if (supabase && activeUser?.id) {
      try {
        await supabase.from('searches').insert({
          user_id: activeUser.id,
          query: trimmed,
          status: 'complete',
        })
      } catch (err) {
        console.warn('Could not save search to Supabase DB:', err)
      }
    }
  }, [])

  /**
   * Remove search query from Supabase DB and local state.
   */
  const removeSearchQuery = useCallback(async (queryToRemove) => {
    const trimmed = (queryToRemove || '').trim()
    if (!trimmed) return

    setRecentQueries((existing) =>
      existing.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())
    )

    const activeUser = userRef.current
    if (supabase && activeUser?.id) {
      try {
        await supabase
          .from('searches')
          .delete()
          .eq('user_id', activeUser.id)
          .ilike('query', trimmed)
      } catch (err) {
        console.warn('Could not remove search from Supabase DB:', err)
      }
    }
  }, [])

  /**
   * Clear all searches for user in Supabase DB and local state.
   */
  const clearSearchQueries = useCallback(async () => {
    setRecentQueries([])
    const activeUser = userRef.current
    if (supabase && activeUser?.id) {
      try {
        await supabase
          .from('searches')
          .delete()
          .eq('user_id', activeUser.id)
      } catch (err) {
        console.warn('Could not clear searches in Supabase DB:', err)
      }
    }
  }, [])

  const value = {
    user,
    session,
    sessionToken: session?.access_token || null,
    isLoggedIn: Boolean(user),
    isLoadingAuth,
    recentQueries,
    isSupabaseConfigured,
    login,
    signIn,
    signUp,
    signOut,
    logout: signOut,
    loginDemo,
    saveSearchQuery,
    removeSearchQuery,
    clearSearchQueries,
    isAuthModalOpen,
    openAuthModal: () => setIsAuthModalOpen(true),
    closeAuthModal: () => setIsAuthModalOpen(false),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

const defaultAuthContext = {
  user: null,
  session: null,
  sessionToken: null,
  isLoggedIn: false,
  isLoadingAuth: false,
  recentQueries: [],
  isSupabaseConfigured: false,
  login: async () => ({ data: null, error: null }),
  signIn: async () => ({ data: null, error: null }),
  signUp: async () => ({ data: null, error: null }),
  signOut: async () => {},
  logout: async () => {},
  loginDemo: () => {},
  saveSearchQuery: () => {},
  removeSearchQuery: () => {},
  clearSearchQueries: () => {},
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context || defaultAuthContext
}
