import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const ChallengeContext = createContext()

export function useChallenge() {
  return useContext(ChallengeContext)
}

export function ChallengeProvider({ children }) {
  // If we support multiple, this changes. But current UI assumes one active?
  // Model supports multiple. Let's assume we find the FIRST 'active' one.
  const [activeChallenge, setActiveChallenge] = useState(null)
  
  // History is now part of Challenge model in backend, no longer separate local map
  // We sync it from the activeChallenge object
  const [history, setHistory] = useState({}) 
  
  const { user } = useAuth()

  useEffect(() => {
      const fetchChallenge = async () => {
          if (user) {
              try {
                  const { data } = await api.get('/challenges')
                  // find first active
                  const active = data.find(c => c.status === 'active')
                  if (active) {
                      setActiveChallenge(active)
                      setHistory(active.history || {})
                  } else {
                      setActiveChallenge(null)
                      setHistory({})
                  }
              } catch(e) { console.error("Fetch challenge failed", e) }
          } else {
              // Local fallback
              try {
                const saved = localStorage.getItem('challenge_active')
                if(saved) setActiveChallenge(JSON.parse(saved))
                
                const savedHist = localStorage.getItem('challenge_history')
                if(savedHist) setHistory(JSON.parse(savedHist))
              } catch(e) { console.error(e) }
          }
      }
      fetchChallenge()
  }, [user])

  useEffect(() => {
    if(!user) {
        localStorage.setItem('challenge_active', JSON.stringify(activeChallenge))
    }
  }, [activeChallenge, user])

  useEffect(() => {
    if(!user) {
        localStorage.setItem('challenge_history', JSON.stringify(history))
    }
  }, [history, user])

  // Create a new challenge
  const createChallenge = async (title, durationDays, dailyActions) => {
    const newChallengeData = {
      title,
      durationDays: parseInt(durationDays),
      startDate: new Date().toISOString(),
      dailyActions: dailyActions.map(action => ({
          text: action, 
          type: 'checkbox'
      })),
      status: 'active' 
    }
    
    if(user) {
        try {
            const { data } = await api.post('/challenges', newChallengeData)
            setActiveChallenge(data)
            setHistory({})
        } catch(e) { console.error("Create challenge failed", e) }
    } else {
        const localChallenge = {
            ...newChallengeData,
            id: crypto.randomUUID(),
            dailyActions: newChallengeData.dailyActions.map(a => ({...a, id: crypto.randomUUID()}))
        }
        setActiveChallenge(localChallenge)
        setHistory({}) 
    }
  }

  // Toggle an action for a specific date
  const toggleAction = async (dateStr, actionId) => {
    // Optimistic Update
    let newHistory = { ...history }
    const dayRecord = newHistory[dateStr] || []
    const isCompleted = dayRecord.includes(actionId)

    let newDayRecord
    if (isCompleted) {
        newDayRecord = dayRecord.filter(id => id !== actionId)
    } else {
        newDayRecord = [...dayRecord, actionId]
    }
    
    newHistory[dateStr] = newDayRecord
    setHistory(newHistory)
    
    // Backend Sync
    if(user && activeChallenge) {
        try {
            await api.put(`/challenges/${activeChallenge._id || activeChallenge.id}`, {
                history: newHistory
            })
        } catch(e) { console.error("Update challenge failed", e) }
    }
  }

  // Get progress for a specific date
  const getProgress = (dateStr) => {
    if (!activeChallenge) return { completed: 0, total: 0, percentage: 0 }
    
    const completedIds = history[dateStr] || []
    const total = activeChallenge.dailyActions.length
    const completed = completedIds.length
    
    return {
      completed,
      total,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
      isPerfect: completed === total && total > 0,
      completedActionIds: completedIds
    }
  }

  const addAction = async (text) => {
      // Not typically supported in active challenge but lets support it
      const newAction = { text, type: 'checkbox' }
      
      if(user && activeChallenge) {
           // We'd need to regenerate structure or push. 
           // Mongoose expects full array often or $push. 
           // Simplified: Just update local and let next refresh handle or PUT whole actions
           const updatedActions = [...activeChallenge.dailyActions, newAction]
           setActiveChallenge(prev => ({...prev, dailyActions: updatedActions}))
           try {
                await api.put(`/challenges/${activeChallenge._id || activeChallenge.id}`, {
                    dailyActions: updatedActions
                })
           } catch(e) { console.error(e) }
      } else {
          setActiveChallenge(prev => ({
              ...prev,
              dailyActions: [...prev.dailyActions, { id: crypto.randomUUID(), text, type: 'checkbox' }]
          }))
      }
  }

  const removeAction = async (actionId) => {
      if(user && activeChallenge) {
          const updatedActions = activeChallenge.dailyActions.filter(a => (a._id || a.id) !== actionId)
          setActiveChallenge(prev => ({...prev, dailyActions: updatedActions}))
           try {
                await api.put(`/challenges/${activeChallenge._id || activeChallenge.id}`, {
                    dailyActions: updatedActions
                })
           } catch(e) { console.error(e) }
      } else {
        setActiveChallenge(prev => ({
            ...prev,
            dailyActions: prev.dailyActions.filter(a => a.id !== actionId)
        }))
      }
  }

  const deleteChallenge = async () => {
      if(user && activeChallenge) {
          try {
              // Delete or just mark abandoned? Delete for now
              await api.delete(`/challenges/${activeChallenge._id || activeChallenge.id}`)
          } catch(e) { console.error(e) }
      }
      setActiveChallenge(null)
      setHistory({})
  }

  const activeDay = activeChallenge ? Math.max(1, Math.ceil((new Date() - new Date(activeChallenge.startDate)) / (1000 * 60 * 60 * 24))) : 0
  const completedDays = Object.keys(history)

  const updateChallenge = async (id, updates) => {
      // Optimistic
      setActiveChallenge(prev => prev ? { ...prev, ...updates } : prev)
      
      if(user) {
          try {
              await api.put(`/challenges/${id}`, updates)
          } catch(e) { console.error("Update challenge failed", e) }
      }
  }

  return (
    <ChallengeContext.Provider value={{
      activeChallenge,
      history,
      activeDay,
      completedDays,
      giveUp: deleteChallenge,
      createChallenge,
      updateChallenge,
      deleteChallenge,
      toggleAction,
      getProgress,
      addAction,
      removeAction
    }}>
      {children}
    </ChallengeContext.Provider>
  )
}
