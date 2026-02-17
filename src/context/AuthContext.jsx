import { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { auth } from '../services/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('Auth timeout')
      setLoading(false)
    }, 5000)

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timeout)
      setUser(user)
      setLoading(false)
    }, (error) => {
      clearTimeout(timeout)
      console.error('Auth error:', error)
      setLoading(false)
    })

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    return signOut(auth)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
