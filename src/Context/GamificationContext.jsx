import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const GamificationContext = createContext()

export function useGamification() {
  return useContext(GamificationContext)
}

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500] 

export function GamificationProvider({ children }) {
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const { user } = useAuth()

  // Load from User Profile on auth change
  useEffect(() => {
      if(user) {
          // User object from Auth might be stale if we relied only on login response
          // But usually we trust it or fetch profile.
          // Let's rely on AuthContext user for initial load if it has it
          if(user.xp !== undefined) setXp(user.xp)
          if(user.level !== undefined) setLevel(user.level)
      } else {
          setXp(parseInt(localStorage.getItem('cb-xp') || '0'))
          setLevel(parseInt(localStorage.getItem('cb-level') || '1'))
      }
  }, [user])
  
  // Save local only if not user
  useEffect(() => {
     if(!user) {
         localStorage.setItem('cb-xp', xp)
         localStorage.setItem('cb-level', level)
     }
  }, [xp, level, user])

  const calculateLevel = (currentXp) => {
      let lvl = 1
      for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
          if (currentXp >= LEVEL_THRESHOLDS[i]) lvl = i + 1
          else break
      }
      return lvl
  }

  const addXP = async (amount) => {
      let newXp, newLevel;
      
      // Calculate new state based on current
      // NOTE: There's a race condition if rapid updates, but ok for now
      newXp = xp + amount
      newLevel = calculateLevel(newXp)
      
      // Optimistic
      setXp(newXp)
      if (newLevel > level) {
          setLevel(newLevel)
          console.log("LEVEL UP!")
      }

      // Sync
      if(user) {
          try {
              await api.put('/users/profile', {
                  xp: newXp,
                  level: newLevel
              })
          } catch(e) { console.error("Failed to sync stats", e) }
      }
  }

  const getLevelProgress = () => {
      const currentLevelStart = LEVEL_THRESHOLDS[level - 1] || 0
      const nextLevelStart = LEVEL_THRESHOLDS[level] || (currentLevelStart + 1000)
      const progress = xp - currentLevelStart
      const totalNeeded = nextLevelStart - currentLevelStart
      return Math.min(100, Math.max(0, (progress / totalNeeded) * 100))
  }

  return (
    <GamificationContext.Provider value={{ xp, level, addXP, getLevelProgress, title: `Level ${level} Achiever` }}>
      {children}
    </GamificationContext.Provider>
  )
}
