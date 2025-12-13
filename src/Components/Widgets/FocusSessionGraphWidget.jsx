import React, { useState } from 'react'
import { Zap, Coffee, BarChart3 } from 'lucide-react'
import { useFocusSessions } from '../../Context/FocusSessionContext'

export default function FocusSessionGraphWidget() {
    const { getSessionsByDate } = useFocusSessions()
    const [selectedDate] = useState(new Date()) // Default to today for now

    // Data Processing
    const dateString = selectedDate.toISOString().split('T')[0]
    const daySessions = getSessionsByDate(dateString)

    // Calculate Totals for Legend
    const totalFocusMins = daySessions.filter(s => s.type === 'focus').reduce((acc, s) => acc + (s.duration / 60), 0)
    const totalBreakMins = daySessions.filter(s => s.type === 'break').reduce((acc, s) => acc + (s.duration / 60), 0)
    
    // Format Minutes to "1h 20m" or "45m"
    const formatTime = (mins) => {
        if (mins === 0) return '0m'
        const h = Math.floor(mins / 60)
        const m = Math.round(mins % 60)
        if (h > 0) return `${h}h ${m}m`
        return `${m}m`
    }

    const glassStyle = {
        background: '#1c1c1e',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        maxWidth: '320px', // Restrict width
        minHeight: '160px',
        position: 'relative',
        overflow: 'hidden'
    }

    // Dynamic sizing logic - Reduced base size
    const totalMins = totalFocusMins + totalBreakMins
    const focusRatio = totalMins > 0 ? totalFocusMins / totalMins : 0.5
    const breakRatio = totalMins > 0 ? totalBreakMins / totalMins : 0.5

    // Scale sizes (min 60px, max 110px)
    const baseSize = 180 
    const focusSize = Math.max(70, Math.min(120, baseSize * focusRatio))
    const breakSize = Math.max(60, Math.min(100, baseSize * breakRatio))

    return (
        <div style={glassStyle}>
            {/* LEFT COLUMN: Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 10 }}>
                <h3 style={{ fontSize: '0.95rem', color: '#a1a1aa', fontWeight: 500, margin: 0 }}>Daily Focus</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Focus Legend: Time - Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d9f99d' }} />
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>
                                {formatTime(totalFocusMins)}
                            </span>
                            <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Focus</span>
                        </div>
                    </div>
                    {/* Break Legend: Time - Name */}
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a8a29e' }} />
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>
                                {formatTime(totalBreakMins)}
                            </span>
                             <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Break</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Bubbles */}
            <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0 }}>
                {/* Break Bubble (Background) */}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    width: `${breakSize}px`,
                    height: `${breakSize}px`,
                    borderRadius: '50%',
                    background: '#a8a29e', // Warm Grey
                    opacity: 0.8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    fontWeight: 600,
                    zIndex: 5,
                    fontSize: '0.8rem'
                }}>
                    ~{ Math.round(totalBreakMins / 60) }h
                </div>

                {/* Focus Bubble (Foreground) */}
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '0px',
                    width: `${focusSize}px`,
                    height: `${focusSize}px`,
                    borderRadius: '50%',
                    background: '#d9f99d', // Lime
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    fontWeight: 600,
                    zIndex: 6,
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                    ~{ Math.round(totalFocusMins / 60) }h
                </div>
            </div>
        </div>
    )
}
