import { createContext, useContext, useState, useEffect } from 'react'
import { ref, onValue, update } from 'firebase/database'
import { database } from '../services/firebase'
import { localCache } from '../services/localCache'

const UserProfileContext = createContext(null)

export function UserProfileProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Carregar perfil do localStorage ao iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      const cached = localCache.getUserProfile(user.id)
      if (cached) {
        setUserProfile(cached)
      }
    }
    setLoading(false)
  }, [])

  // Sincronizar com Firebase quando mudar o usuário
  useEffect(() => {
    if (!currentUser?.id) {
      setUserProfile(null)
      return
    }

    const profileRef = ref(database, `users/${currentUser.id}/profile`)
    const unsubscribe = onValue(profileRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const profile = {
          ...data,
          id: currentUser.id
        }
        setUserProfile(profile)
        localCache.setUserProfile(currentUser.id, profile)
      }
    })

    return unsubscribe
  }, [currentUser?.id])

  const setUser = (user) => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('currentUser')
    }
    setCurrentUser(user)
  }

  const updateProfile = async (updates) => {
    if (!currentUser?.id) return
    
    const profileRef = ref(database, `users/${currentUser.id}/profile`)
    await update(profileRef, {
      ...updates,
      updatedAt: Date.now()
    })
  }

  const updateAvatar = async (avatarUrl) => {
    await updateProfile({ avatar: avatarUrl })
  }

  const value = {
    currentUser,
    userProfile,
    loading,
    setUser,
    updateProfile,
    updateAvatar,
    isLoggedIn: !!currentUser
  }

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  const context = useContext(UserProfileContext)
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider')
  }
  return context
}
