import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const HabitContext = createContext()

export function useHabits() {
  return useContext(HabitContext)
}

const STORAGE_KEY = 'cb-habits'

export function HabitProvider({ children }) {
  const [habits, setHabits] = useState([])
  const { user } = useAuth()

  // Load
  useEffect(() => {
    const fetchHabits = async () => {
        if(user) {
            try {
                const { data } = await api.get('/habits')
                // Backend 'history' is Map/Object, ensure compatibility
                setHabits(data)
            } catch (e) {
                console.error("Failed to fetch habits", e)
            }
        } else {
            try {
                const raw = localStorage.getItem(STORAGE_KEY)
                if (raw) setHabits(JSON.parse(raw))
            } catch (e) { console.error(e) }
        }
    }
    fetchHabits()
  }, [user])

  // Save (Local only)
  useEffect(() => {
      if(!user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
      }
  }, [habits, user])

  const addHabit = async (newHabit) => {
      const habitData = {
          ...newHabit,
          history: {},
          streak: 0,
          total: 0
      }

      if(user) {
          try {
              const { data } = await api.post('/habits', habitData)
              setHabits(prev => [...prev, data])
          } catch(e) {
              console.error("Failed to create habit", e)
          }
      } else {
        setHabits(prev => [...prev, {
            id: crypto.randomUUID(),
            ...habitData
        }])
      }
  }

  const deleteHabit = async (id) => {
      // Optimistic
      setHabits(prev => prev.filter(h => h.id !== id && h._id !== id))
      if(user) {
          try {
              await api.delete(`/habits/${id}`)
          } catch(e) { console.error("Failed delete habit", e) }
      }
  }

  const toggleDay = async (habitId, dateKey) => {
      // We need to perform the logic, then update backend
      // Because 'history' logic is complex, currently replicating logic on frontend
      // Ideally move to backend calculation, but keeping hybrid for optimistic UI
      
      let updatedHabit = null
      
      setHabits(prev => prev.map(h => {
          if (h.id !== habitId && h._id !== habitId) return h
          
          const newHistory = { ...(h.history || {}) }
          if (newHistory[dateKey]) delete newHistory[dateKey]
          else newHistory[dateKey] = true
          
          // Recalc Streak
          let streak = 0
          const today = new Date()
          let d = new Date(today)
          
          for(let i=0; i<365; i++) {
              const y = d.getFullYear()
              const m = String(d.getMonth() + 1).padStart(2, '0')
              const day = String(d.getDate()).padStart(2, '0')
              const k = `${y}-${m}-${day}`

              if (newHistory[k]) streak++
              else if (i === 0 && !newHistory[k]) {
                  // allow today to be empty if checking yesterday
              } else {
                  break
              }
              d.setDate(d.getDate() - 1)
          }

          const total = Object.keys(newHistory).length
          updatedHabit = { ...h, history: newHistory, streak, total }
          return updatedHabit
      }))

      if(user && updatedHabit) {
          try {
              await api.put(`/habits/${habitId}`, {
                  history: updatedHabit.history,
                  streak: updatedHabit.streak,
                  total: updatedHabit.total
              })
          } catch(e) { console.error("Failed update habit", e) }
      }
  }

  const updateHabit = async (id, updates) => {
      setHabits(prev => prev.map(h => h.id === id || h._id === id ? { ...h, ...updates } : h))
      if(user) {
          try {
              await api.put(`/habits/${id}`, updates)
          } catch(e) { console.error("Failed update habit", e) }
      }
  }

  return (
    <HabitContext.Provider value={{ habits, addHabit, deleteHabit, toggleDay, updateHabit }}>
      {children}
    </HabitContext.Provider>
  )
}
