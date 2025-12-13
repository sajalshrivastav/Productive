import React from 'react'
import { CheckCircle2, Circle } from 'lucide-react'

export default function FocusListWidget() {
  // Mock data for the "Onboarding/Project" look from the image
  const items = [
      { id: 1, title: 'Morning Review', time: '08:30 AM', done: true },
      { id: 2, title: 'Deep Work Session', time: '09:00 AM', done: true },
      { id: 3, title: 'Team Sync', time: '02:00 PM', done: false },
      { id: 4, title: 'Wrap Up', time: '05:00 PM', done: false },
  ]

  const completion = Math.round((items.filter(i => i.done).length / items.length) * 100)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1c1c1e', borderRadius: '16px', overflow: 'hidden' }}>
        {/* Header Section */}
        <div style={{ padding: '20px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Daily Goals</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{items.filter(i => i.done).length}/{items.length}</span>
            </div>
            
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${completion}%`, height: '100%', background: 'var(--accent-primary)', transition: 'width 0.5s ease' }} />
            </div>
        </div>

        {/* List */}
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
            {items.map(item => (
                <div key={item.id} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px', borderRadius: '12px',
                    background: item.done ? 'rgba(255,255,255,0.03)' : 'transparent',
                    cursor: 'pointer'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: item.done ? 'var(--text-muted)' : 'white', textDecoration: item.done ? 'line-through' : 'none' }}>{item.title}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.time}</span>
                    </div>
                    
                    {item.done ? 
                        <CheckCircle2 size={20} color="var(--accent-primary)" fill="rgba(249, 115, 22, 0.2)" /> : 
                        <Circle size={20} color="var(--text-muted)" />
                    }
                </div>
            ))}
        </div>
    </div>
  )
}
