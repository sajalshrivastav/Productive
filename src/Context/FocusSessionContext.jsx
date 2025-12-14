import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const FocusSessionContext = createContext()

export function useFocusSessions() {
    return useContext(FocusSessionContext)
}

export function FocusSessionProvider({ children }) {
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()

    // Load sessions from backend or localStorage
    useEffect(() => {
        const fetchSessions = async () => {
            if (user) {
                setLoading(true)
                try {
                    const { data } = await api.get('/focus-sessions')
                    setSessions(data)
                } catch (error) {
                    console.error('Failed to fetch focus sessions', error)
                } finally {
                    setLoading(false)
                }
            } else {
                // Load from localStorage for non-authenticated users
                try {
                    const saved = localStorage.getItem('cb-focus-sessions')
                    setSessions(saved ? JSON.parse(saved) : [])
                } catch (error) {
                    console.error('Failed to load sessions from localStorage', error)
                    setSessions([])
                }
            }
        }
        fetchSessions()
    }, [user])

    // Save to localStorage only for non-authenticated users
    useEffect(() => {
        if (!user) {
            localStorage.setItem('cb-focus-sessions', JSON.stringify(sessions))
        }
    }, [sessions, user])

    const addSession = async (session) => {
        // session: { startTime: timestamp, endTime: timestamp, type: 'focus' | 'break', duration: seconds }
        if (user) {
            try {
                const { data } = await api.post('/focus-sessions', session)
                setSessions(prev => [data, ...prev])
            } catch (error) {
                console.error('Failed to create focus session', error)
            }
        } else {
            // Local fallback
            const localSession = {
                ...session,
                _id: 'local-' + Date.now(),
                createdAt: new Date().toISOString()
            }
            setSessions(prev => [localSession, ...prev])
        }
    }

    const getSessionsByDate = (dateString) => {
        // dateString format: 'YYYY-MM-DD'
        return sessions.filter(s => {
            const sessionDate = new Date(s.startTime).toISOString().split('T')[0]
            return sessionDate === dateString
        })
    }

    const getTodaySessions = () => {
        const today = new Date().toISOString().split('T')[0]
        return getSessionsByDate(today)
    }

    return (
        <FocusSessionContext.Provider value={{
            sessions,
            addSession,
            getSessionsByDate,
            getTodaySessions,
            loading
        }}>
            {children}
        </FocusSessionContext.Provider>
    )
}
