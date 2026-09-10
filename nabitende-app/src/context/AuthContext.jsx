import { createContext, useContext, useState } from 'react'
import api from '../api'

const AuthContext = createContext(null)

const ROLE_HOME = {
  admin:      '/admin/dashboard',
  teacher:    '/teacher/dashboard',
  parent:     '/parent/dashboard',
  student:    '/student/dashboard',
  government: '/government/dashboard',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('educonnect_user')
    return saved ? JSON.parse(saved) : null
  })

  async function login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { ok, token, user: userData, error } = response.data

      if (!ok) return { ok: false, error }

      // Save token and user to localStorage
      localStorage.setItem('educonnect_token', token)
      localStorage.setItem('educonnect_user', JSON.stringify(userData))
      setUser(userData)

      return { ok: true, home: ROLE_HOME[userData.role] }

    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please try again.'
      return { ok: false, error: message }
    }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('educonnect_token')
    localStorage.removeItem('educonnect_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}