import { useState, useEffect } from 'react'
import { ref, onValue, push, update, get, remove } from 'firebase/database'
import { database } from '../services/firebase'
import { localCache } from '../services/localCache'

const API_BASE_URL = 'https://www.speedrun.com/api/v1'

export function useCategories(gameId) {
  const [categories, setCategories] = useState(() => {
    // Try to get from cache first
    return gameId ? localCache.getCategories(gameId) || [] : []
  })
  const [loading, setLoading] = useState(!categories.length)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/games/${gameId}/categories?embed=variables`)
        const data = await response.json()
        const categoriesData = data.data || []
        setCategories(categoriesData)
        // Save to cache
        localCache.setCategories(gameId, categoriesData)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (gameId) fetchCategories()
  }, [gameId])

  return { categories, loading, error }
}

export function useLeaderboard(gameId, categoryId, variableId, valueId) {
  const [runs, setRuns] = useState(() => {
    // Try to get from cache first
    if (gameId && categoryId) {
      return localCache.getLeaderboard(gameId, categoryId, variableId, valueId) || []
    }
    return []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId || !categoryId) {
      setRuns([])
      setLoading(false)
      return
    }

    setLoading(true)
    let dbPath = `games/${gameId}/leaderboards/${categoryId}`
    if (variableId && valueId) {
      dbPath += `/${variableId}/${valueId}`
    }

    const leaderboardRef = ref(database, dbPath)
    
    const unsubscribe = onValue(leaderboardRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const runsArray = Object.entries(data).map(([id, run]) => ({
          id,
          ...run
        }))
        runsArray.sort((a, b) => {
          const timeA = parseTime(a.time)
          const timeB = parseTime(b.time)
          return timeA - timeB
        })
        setRuns(runsArray)
        // Save to cache
        localCache.setLeaderboard(gameId, categoryId, variableId, valueId, runsArray)
      } else {
        setRuns([])
      }
      setLoading(false)
    }, (error) => {
      console.error('Firebase error:', error)
      setRuns([])
      setLoading(false)
    })

    return unsubscribe
  }, [gameId, categoryId, variableId, valueId])

  return { runs, loading }
}

function parseTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0
  
  // Replace colons with dots for parsing
  const normalized = timeStr.replace(/:/g, '.')
  const parts = normalized.split('.')
  let totalMs = 0
  
  if (parts.length === 4) {
    // h:m:s.ms format (e.g. 1:9:42.440 = 1h 9m 42s 440ms)
    totalMs += parseInt(parts[0]) * 3600000 // hours
    totalMs += parseInt(parts[1]) * 60000   // minutes
    totalMs += parseInt(parts[2]) * 1000    // seconds
    totalMs += parseInt(parts[3])           // milliseconds
  } else if (parts.length === 3) {
    // m:s.ms format (e.g. 9:42.440 = 9m 42s 440ms)
    totalMs += parseInt(parts[0]) * 60000   // minutes
    totalMs += parseInt(parts[1]) * 1000    // seconds
    totalMs += parseInt(parts[2])           // milliseconds
  } else if (parts.length === 2) {
    // m:s format (e.g. 9:42 = 9m 42s)
    totalMs += parseInt(parts[0]) * 60000   // minutes
    totalMs += parseInt(parts[1]) * 1000    // seconds
  } else if (parts.length === 1) {
    // just seconds (e.g. 42 = 42s)
    totalMs += parseInt(parts[0]) * 1000    // seconds
  }
  
  return totalMs
}

export function useSubmissions(gameId, status) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId) {
      setLoading(false)
      return
    }

    setLoading(true)
    const submissionsRef = ref(database, `games/${gameId}/submissions`)
    
    const timeout = setTimeout(() => {
      console.warn('Firebase timeout, setting loading to false')
      setLoading(false)
    }, 5000)
    
    const unsubscribe = onValue(submissionsRef, (snapshot) => {
      clearTimeout(timeout)
      const data = snapshot.val()
      if (data) {
        let submissionsArray = Object.entries(data).map(([id, sub]) => ({
          id,
          ...sub
        }))
        
        if (status) {
          submissionsArray = submissionsArray.filter(s => s.status === status)
        }
        
        setSubmissions(submissionsArray)
      } else {
        setSubmissions([])
      }
      setLoading(false)
    }, (error) => {
      clearTimeout(timeout)
      console.error('Firebase error:', error)
      setSubmissions([])
      setLoading(false)
    })

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [gameId, status])

  return { submissions, loading }
}

export function useRunActions(gameId) {
  const submitRun = async (runData) => {
    const submissionsRef = ref(database, `games/${gameId}/submissions`)
    await push(submissionsRef, {
      ...runData,
      status: 'pending',
      submittedAt: new Date().toISOString()
    })
  }

  const verifyRun = async (submissionId) => {
    const submissionRef = ref(database, `games/${gameId}/submissions/${submissionId}`)
    const snapshot = await get(submissionRef)
    const data = snapshot.val()
    
    if (!data) return

    let leaderboardPath = `games/${gameId}/leaderboards/${data.category.id}`
    if (data.subcategory?.variableId && data.subcategory?.valueId) {
      leaderboardPath += `/${data.subcategory.variableId}/${data.subcategory.valueId}`
    }

    const newRunRef = await push(ref(database, leaderboardPath), {
      player: data.player,
      time: data.time,
      date: data.date,
      videoUrl: data.videoUrl || ''
    })

    await update(submissionRef, {
      status: 'verified',
      leaderboardKey: newRunRef.key
    })
  }

  const rejectRun = async (submissionId) => {
    const submissionRef = ref(database, `games/${gameId}/submissions/${submissionId}`)
    const snapshot = await get(submissionRef)
    const data = snapshot.val()

    if (data?.status === 'verified' && data?.leaderboardKey) {
      let leaderboardPath = `games/${gameId}/leaderboards/${data.category.id}`
      if (data.subcategory?.variableId && data.subcategory?.valueId) {
        leaderboardPath += `/${data.subcategory.variableId}/${data.subcategory.valueId}`
      }
      leaderboardPath += `/${data.leaderboardKey}`
      await remove(ref(database, leaderboardPath))
    }

    await update(submissionRef, { status: 'rejected', leaderboardKey: null })
  }

  const deleteRun = async (submissionId) => {
    const submissionRef = ref(database, `games/${gameId}/submissions/${submissionId}`)
    const snapshot = await get(submissionRef)
    const data = snapshot.val()

    if (data?.status === 'verified' && data?.leaderboardKey) {
      let leaderboardPath = `games/${gameId}/leaderboards/${data.category.id}`
      if (data.subcategory?.variableId && data.subcategory?.valueId) {
        leaderboardPath += `/${data.subcategory.variableId}/${data.subcategory.valueId}`
      }
      leaderboardPath += `/${data.leaderboardKey}`
      await remove(ref(database, leaderboardPath))
    }

    await remove(submissionRef)
  }

  const updateRun = async (submissionId, updates) => {
    const submissionRef = ref(database, `games/${gameId}/submissions/${submissionId}`)
    const snapshot = await get(submissionRef)
    const existingData = snapshot.val()
    
    await update(submissionRef, {
      ...existingData,
      ...updates
    })
  }

  return { submitRun, verifyRun, rejectRun, deleteRun, updateRun }
}
