import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DashboardEventsWidget() {
    const navigate = useNavigate()
    const [events, setEvents] = useState([])

    const loadEvents = () => {
        try {
            const raw = localStorage.getItem('cb-events-v1')
            if (raw) {
                const parsed = JSON.parse(raw)
                // Filter for today and future
                const now = new Date()
                const todayKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
                
                const upcoming = parsed.filter(e => {
                    if (e.dateKey > todayKey) return true
                    if (e.dateKey === todayKey) {
                        // Check time if available
                        if (!e.startTime) return true
                        const [h, m] = e.startTime.split(':').map(Number)
                        const eventDate = new Date()
                        eventDate.setHours(h, m, 0, 0)
                        return eventDate >= now
                    }
                    return false
                }).sort((a,b) => {
                    if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey)
                    return (a.startTime || '').localeCompare(b.startTime || '')
                }).slice(0, 3) // Show max 3

                setEvents(upcoming)
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        loadEvents()
        
        // Listen for storage updates (from other tabs or same tab manual triggers)
        const handleStorage = () => loadEvents()
        window.addEventListener('storage', handleStorage)
        // Custom event for same-tab updates
        window.addEventListener('cb-events-updated', handleStorage)
        
        return () => {
            window.removeEventListener('storage', handleStorage)
            window.removeEventListener('cb-events-updated', handleStorage)
        }
    }, [])

    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    }

    return (
        <div style={glassStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CalendarIcon size={20} color="#a855f7" /> 
                    Upcoming Events
                </h3>
                <span 
                    onClick={() => navigate('/calendar')}
                    style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                    View Calendar
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {events.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', padding: '20px 0', fontSize: '0.9rem' }}>
                        No upcoming events
                    </div>
                ) : (
                    events.map(e => (
                        <div key={e.id} style={{ 
                            display: 'flex', alignItems: 'center', gap: '12px',
                            background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px',
                            borderLeft: `3px solid ${e.color || '#a855f7'}`
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{e.title}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#a1a1aa' }}>
                                    <Clock size={12} />
                                    <span>{e.dateKey === new Date().toISOString().split('T')[0] ? 'Today' : e.dateKey}</span>
                                    {e.startTime && <span>• {e.startTime}</span>}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
