import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const EventContext = createContext()

export function useEvents() {
    return useContext(EventContext)
}

export function EventProvider({ children }) {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()

    // Load events from backend
    useEffect(() => {
        const fetchEvents = async () => {
            if (user) {
                setLoading(true)
                try {
                    const { data } = await api.get('/events')
                    setEvents(data)
                } catch (error) {
                    console.error('Failed to fetch events', error)
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchEvents()
    }, [user])

    const createEvent = async (eventData) => {
        if (user) {
            try {
                const { data } = await api.post('/events', eventData)
                setEvents(prev => [...prev, data].sort((a, b) =>
                    new Date(a.startTime) - new Date(b.startTime)
                ))
                return { success: true, event: data }
            } catch (error) {
                console.error('Failed to create event', error)
                return { success: false, error: error.response?.data?.message }
            }
        }
    }

    const updateEvent = async (id, updates) => {
        // Optimistic update
        setEvents(prev => prev.map(e => e._id === id ? { ...e, ...updates } : e))

        if (user) {
            try {
                await api.put(`/events/${id}`, updates)
            } catch (error) {
                console.error('Failed to update event', error)
                // Revert on error
                const { data } = await api.get('/events')
                setEvents(data)
            }
        }
    }

    const deleteEvent = async (id) => {
        // Optimistic delete
        setEvents(prev => prev.filter(e => e._id !== id))

        if (user) {
            try {
                await api.delete(`/events/${id}`)
            } catch (error) {
                console.error('Failed to delete event', error)
            }
        }
    }

    const getEventsByDate = (dateString) => {
        return events.filter(e => {
            const eventDate = new Date(e.startTime).toISOString().split('T')[0]
            return eventDate === dateString
        })
    }

    const getTodayEvents = () => {
        const today = new Date().toISOString().split('T')[0]
        return getEventsByDate(today)
    }

    const getEventsByRange = async (startDate, endDate) => {
        if (user) {
            try {
                const { data } = await api.get(`/events/range?startDate=${startDate}&endDate=${endDate}`)
                return data
            } catch (error) {
                console.error('Failed to fetch events by range', error)
                return []
            }
        }
        return []
    }

    return (
        <EventContext.Provider value={{
            events,
            loading,
            createEvent,
            updateEvent,
            deleteEvent,
            getEventsByDate,
            getTodayEvents,
            getEventsByRange
        }}>
            {children}
        </EventContext.Provider>
    )
}
