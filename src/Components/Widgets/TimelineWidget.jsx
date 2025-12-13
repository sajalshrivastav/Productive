import React from 'react'
import { ChevronLeft, ChevronRight, User } from 'lucide-react'

// Mock Data matching the image style
const events = [
    { id: 1, title: 'Weekly Team Sync', subtitle: 'Discuss progress', dayInd: 2, startHour: 8, duration: 1.5, color: '#27272a', textColor: 'white' }, // Wed
    { id: 2, title: 'Onboarding Session', subtitle: 'Introduction for new hires', dayInd: 4, startHour: 10, duration: 1, color: '#f4f4f5', textColor: 'black' } // Fri
]

const days = [
    { label: 'Mon', date: 22 },
    { label: 'Tue', date: 23 },
    { label: 'Wed', date: 24, active: true },
    { label: 'Thu', date: 25 },
    { label: 'Fri', date: 26 },
    { label: 'Sat', date: 27 },
    { label: 'Sun', date: 28 }, // Added Sun
]

const hours = [8, 9, 10, 11]

export default function TimelineWidget() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button style={{ background: 'var(--bg-surface)', border: 'none', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                August
            </button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>September 2024</h3>
            <button style={{ background: 'var(--bg-surface)', border: 'none', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                October
            </button>
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', flex: 1, gap: '0' }}>
            
            {/* Header Row (Empty top-left, Days) */}
            <div /> {/* Top Left Corner */}
            {days.map((d, i) => (
                <div key={i} style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1px solid transparent' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{d.label}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: d.active ? 600 : 400, color: d.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>{d.date}</div>
                </div>
            ))}

            {/* Time Rows */}
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', position: 'relative' }}>
                {/* Background Grid Lines */}
                 {days.map((_, i) => (
                     <div key={i} style={{ 
                         gridColumn: i + 2, 
                         gridRow: '1 / 6', 
                         borderLeft: '1px dashed var(--bg-card-hover)',
                         height: '100%' 
                     }} />
                 ))}

                {/* Hours and Content */}
                {hours.map((h, i) => (
                    <React.Fragment key={h}>
                        <div style={{ 
                            height: '60px', 
                            fontSize: '0.75rem', 
                            color: 'var(--text-muted)', 
                            display: 'flex', 
                            alignItems: 'flex-start',
                            paddingTop: '8px'
                        }}>
                            {h}:00 am
                        </div>
                        {/* Empty cells for grid alignment if needed, or we use absolute positioning for events on top */}
                        <div style={{ gridColumn: '2 / -1', height: '60px' }} /> 
                    </React.Fragment>
                ))}

                {/* Events Layer (Overlay) */}
                {events.map((ev, i) => {
                    // Calculate position
                    // Row starts at 1. each hour is 60px height.
                    // StartHour 8 is index 0.
                    // Top = (ev.startHour - 8) * 60 + padding?
                    // Let's use absolute positioning relative to the container grid.
                    // But grid cells are easier?
                    // Use Grid placement? gridRow: start / span?
                    // We need finer control (1.5h). Absolute is better.
                    const top = (ev.startHour - 8) * 60 + 8 // +8 for spacing/alignment
                    const height = ev.duration * 60 - 4 
                    
                    return (
                        <div key={i} style={{
                            position: 'absolute',
                            left: `calc(60px + ${(ev.dayInd * (100 - 10) / 7)}%)`, // rough calc
                            // Better: grid column placement
                            gridColumn: ev.dayInd + 2, // 1 is time, 2 is Mon(0)
                            gridRowStart: 1, // We are inside a container, position top relative to it
                            top: `${top}px`,
                            height: `${height}px`,
                            width: '90%',
                            background: ev.color,
                            color: ev.textColor,
                            borderRadius: '16px',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            zIndex: 10,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                             <div style={{ overflow: 'hidden' }}>
                                 <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</div>
                                 <div style={{ fontSize: '0.7rem', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.subtitle}</div>
                             </div>
                             <div style={{ display: 'flex', gap: '-4px' }}>
                                 {[1,2,3].map(u => (
                                     <div key={u} style={{ 
                                         width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(127,127,127,0.3)', 
                                         marginLeft: '-8px', border: `2px solid ${ev.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                     }}>
                                         <User size={12} />
                                     </div>
                                 ))}
                             </div>
                        </div>
                    )
                })}

            </div>
        </div>
    </div>
  )
}
