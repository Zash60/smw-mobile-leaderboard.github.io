const CACHE_PREFIX = 'smw_leaderboard_'
const CACHE_EXPIRY = 1000 * 60 * 60 // 1 hour

export const localCache = {
  // Cache para categorias
  setCategories: (gameId, data) => {
    const key = `${CACHE_PREFIX}categories_${gameId}`
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  },

  getCategories: (gameId) => {
    const key = `${CACHE_PREFIX}categories_${gameId}`
    const cached = localStorage.getItem(key)
    if (!cached) return null
    
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key)
      return null
    }
    return data
  },

  // Cache para leaderboard
  setLeaderboard: (gameId, categoryId, variableId, valueId, data) => {
    const key = `${CACHE_PREFIX}leaderboard_${gameId}_${categoryId}_${variableId || 'null'}_${valueId || 'null'}`
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  },

  getLeaderboard: (gameId, categoryId, variableId, valueId) => {
    const key = `${CACHE_PREFIX}leaderboard_${gameId}_${categoryId}_${variableId || 'null'}_${valueId || 'null'}`
    const cached = localStorage.getItem(key)
    if (!cached) return null
    
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key)
      return null
    }
    return data
  },

  // Cache para submissões
  setSubmissions: (gameId, data) => {
    const key = `${CACHE_PREFIX}submissions_${gameId}`
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  },

  getSubmissions: (gameId) => {
    const key = `${CACHE_PREFIX}submissions_${gameId}`
    const cached = localStorage.getItem(key)
    if (!cached) return null
    
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key)
      return null
    }
    return data
  },

  // Perfil do usuário
  setUserProfile: (userId, profile) => {
    const key = `${CACHE_PREFIX}profile_${userId}`
    localStorage.setItem(key, JSON.stringify({
      ...profile,
      updatedAt: Date.now()
    }))
  },

  getUserProfile: (userId) => {
    const key = `${CACHE_PREFIX}profile_${userId}`
    const cached = localStorage.getItem(key)
    return cached ? JSON.parse(cached) : null
  },

  // Limpar todo o cache
  clearAll: () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  },

  // Limpar cache expirado
  clearExpired: () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = JSON.parse(localStorage.getItem(key))
          if (cached.timestamp && Date.now() - cached.timestamp > CACHE_EXPIRY) {
            localStorage.removeItem(key)
          }
        } catch (e) {
          // Invalid cache, remove it
          localStorage.removeItem(key)
        }
      }
    })
  }
}
