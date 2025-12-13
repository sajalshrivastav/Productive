import React, { createContext, useContext, useState, useEffect } from 'react'

const FocusSessionContext = createContext()

export function useFocusSessions() {
    return useContext(FocusSessionContext)
}

export function FocusSessionProvider({ children }) {
    const [sessions, setSessions] = useState(() => {
        try {
            const saved = localStorage.getItem('cb-focus-sessions')
            return saved ? JSON.parse(saved) : []
        } catch {
            return []
        }
    })

    useEffect(() => {
        localStorage.setItem('cb-focus-sessions', JSON.stringify(sessions))
    }, [sessions])

    const addSession = (session) => {
        // session: { startTime: timestamp, endTime: timestamp, type: 'focus' | 'break', duration: seconds }
        setSessions(prev => [...prev, session])
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
        <FocusSessionContext.Provider value={{ sessions, addSession, getSessionsByDate, getTodaySessions }}>
            {children}
        </FocusSessionContext.Provider>
    )
}
