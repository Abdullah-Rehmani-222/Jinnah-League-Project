import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, setCsrfToken, setUnauthorizedHandler } from './lib/api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

/** status: 'loading' (checking session) | 'authed' | 'guest' */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')

  const clear = useCallback(() => {
    setCsrfToken(null)
    setUser(null)
    setStatus('guest')
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(clear)
    api
      .get('/auth/me')
      .then((r) => {
        setCsrfToken(r.data.csrfToken)
        setUser(r.data.user)
        setStatus('authed')
      })
      .catch(clear)
    return () => setUnauthorizedHandler(null)
  }, [clear])

  const login = useCallback(async (email, password) => {
    const r = await api.post('/auth/login', { email, password })
    setCsrfToken(r.data.csrfToken)
    setUser(r.data.user)
    setStatus('authed')
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout') } catch { /* session is cleared locally either way */ }
    clear()
  }, [clear])

  const value = useMemo(() => ({ user, status, login, logout, setUser }), [user, status, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
