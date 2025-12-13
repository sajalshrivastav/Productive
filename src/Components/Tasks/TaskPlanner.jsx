import React, { useEffect, useState, useRef } from 'react'
import { Plus, X, Clock, Calendar, ChevronLeft, ChevronRight, Users, ChevronDown } from 'lucide-react'

const STORAGE_KEY_CUSTOM = 'cb-planner-custom-v1'

function getDateKey(d) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

// Helper for Custom Time Picker
const CustomTimePicker = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef(null)

    // Parse HH:MM
    const [h, m] = value?.split(':') || ['09', '00']

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
    const minutes = ['00', '15', '30', '45'] // Simplified for blocks

    const handleSelect = (newH, newM) => {
        onChange(`${newH}:${newM}`)
        // Don't close immediately, maybe user wants to change minute?
        // Actually for UX, closing after Minute selection is nice, but we need to track what was clicked.
        // Let's just keep it open until clicked outside or toggled.
    }

    return (
        <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    width: '100%', background: 'var(--bg-panel)', padding: '14px', borderRadius: '12px', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    border: isOpen ? '1px solid var(--accent-primary)' : '1px solid transparent'
                }}
            >
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.95rem' }}>{value}</span>
                <ChevronDown size={14} style={{ opacity: 0.5 }} />
            </div>

            {isOpen && (
                <div style={{ 
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '200px', zIndex: 999, 
                    background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', 
                    borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', padding: '12px',
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'
                }}>
                    <div style={{ paddingRight: '8px', borderRight: '1px solid var(--border-subtle)', maxHeight: '180px', overflowY: 'auto' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px', textAlign: 'center' }}>HR</div>
                        {hours.map(hr => (
                            <div 
                                key={hr} 
                                onClick={() => handleSelect(hr, m)}
                                style={{ 
                                    padding: '6px', textAlign: 'center', cursor: 'pointer', borderRadius: '4px',
                                    background: hr === h ? 'var(--accent-primary)' : 'transparent',
                                    color: hr === h ? 'black' : 'var(--text-primary)',
                                    fontWeight: hr === h ? 700 : 400
                                }}
                            >
                                {hr}
                            </div>
                        ))}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px', textAlign: 'center' }}>MIN</div>
                         {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(min => (
                             <div 
                                key={min} 
                                onClick={() => { handleSelect(h, min); setIsOpen(false) }}
                                style={{ 
                                    padding: '6px', textAlign: 'center', cursor: 'pointer', borderRadius: '4px',
                                    background: min === m ? 'var(--bg-card-hover)' : 'transparent',
                                    color: min === m ? 'white' : 'var(--text-primary)',
                                    marginBottom: '2px'
                                }}
                            >
                                {min}
                            </div>
                         ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function TaskPlanner() {
  const [plans, setPlans] = useState({}) 
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date())
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('10:30')
  const [end, setEnd] = useState('11:45')
  const [category, setCategory] = useState('Work')

  const dateKey = getDateKey(currentDate)

  // Load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM)
      if (raw) setPlans(JSON.parse(raw))
    } catch (e) { console.error(e) }
  }, [])

  // Save
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(plans))
  }, [plans])

  const dayBlocks = plans[dateKey] || []

  const addBlock = (e) => {
    e.preventDefault()
    if (!title.trim() || !start || !end) return

    setPlans(prev => {
        const current = prev[dateKey] || []
        const newBlock = {
            id: crypto.randomUUID(),
            title: title.trim(),
            start,
            end,
            category,
            type: 'custom'
        }
        const updated = [...current, newBlock].sort((a, b) => a.start.localeCompare(b.start))
        return { ...prev, [dateKey]: updated }
    })
    
    setTitle('')
  }

  const removeBlock = (id) => {
      setPlans(prev => ({
          ...prev,
          [dateKey]: prev[dateKey].filter(b => b.id !== id)
      }))
  }

  const changeDay = (offset) => {
      const splitDate = new Date(currentDate)
      splitDate.setDate(splitDate.getDate() + offset)
      setCurrentDate(splitDate)
  }

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(450px, 1.4fr) 1fr', gap: '40px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: CREATE FORM */}
        <div>
            <form onSubmit={addBlock} className="panel-card" style={{ 
                background: 'var(--bg-surface)', borderRadius: '24px', padding: '32px', 
                border: '1px solid var(--border-subtle)', position: 'sticky', top: '20px',
                overflow: 'visible' // Ensure popup isn't clipped
            }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px' }}>Create Event</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Event Name */}
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Event Name</label>
                        <input 
                            value={title} onChange={e => setTitle(e.target.value)} 
                            placeholder="Deep Work Session..." 
                            style={{ 
                                width: '100%', background: 'var(--bg-panel)', border: 'none', 
                                color: 'white', padding: '14px', borderRadius: '12px', fontSize: '0.95rem', outline: 'none' 
                            }}
                        />
                    </div>

                    {/* Date Picker */}
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Date</label>
                        <div style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                            background: 'var(--bg-panel)', padding: '12px 14px', borderRadius: '12px' 
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '0.9rem' }}>
                                <Calendar size={16} className="text-accent" />
                                {currentDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button type="button" onClick={() => changeDay(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}><ChevronLeft size={18}/></button>
                                <button type="button" onClick={() => changeDay(1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}><ChevronRight size={18}/></button>
                            </div>
                        </div>
                    </div>

                    {/* Time Split */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Time Start</label>
                            <CustomTimePicker value={start} onChange={setStart} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Time End</label>
                            <CustomTimePicker value={end} onChange={setEnd} />
                        </div>
                    </div>

                    {/* Participants Placeholder */}
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Participants</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                             <div style={{ padding: '6px 12px', background: 'var(--bg-panel)', borderRadius: '16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}> <Users size={12} /> Team </div>
                             <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Plus size={14} color="var(--text-muted)" />
                             </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button type="button" className="btn-secondary" style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'transparent', fontSize: '0.9rem' }}>Cancel</button>
                        <button type="submit" className="btn-primary" style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'white', color: 'black', fontWeight: 700, fontSize: '0.9rem' }}>Create Event</button>
                    </div>
                </div>
            </form>
        </div>

        {/* RIGHT COLUMN: SCHEDULE LIST */}
        <div className="panel-card" style={{ minHeight: '600px', background: 'var(--bg-surface)', borderRadius: '24px', padding: '32px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Schedule</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {dayBlocks.length === 0 && (
                    <div style={{ 
                        height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        border: '2px dashed var(--border-subtle)', borderRadius: '16px', color: 'var(--text-muted)'
                    }}>
                        <Clock size={32} style={{ marginBottom: '16px', opacity: 0.3 }} />
                        <p>No events scheduled.</p>
                    </div>
                )}
                
                {dayBlocks.map(block => (
                    <div key={block.id} className="animate-fade-in" style={{ 
                        position: 'relative', padding: '20px', 
                        background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border-subtle)',
                        display: 'grid', gridTemplateColumns: '80px 1fr 40px', alignItems: 'center', gap: '16px'
                    }}>
                        {/* Time Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '1rem', fontWeight: 700 }}>{block.start}</span>
                            <div style={{ width: '1px', height: '12px', background: 'var(--border-subtle)', margin: '4px 0' }} />
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{block.end}</span>
                        </div>

                        {/* Content Column */}
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>{block.title}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
                                {block.category}
                            </div>
                        </div>

                        {/* Action Column */}
                        <button onClick={() => removeBlock(block.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.6 }} title="Remove">
                            <X size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}
