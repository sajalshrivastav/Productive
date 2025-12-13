import React, { useState, useEffect } from 'react'
import { X, Clock, CheckSquare, StickyNote, Play, Pause, RotateCcw } from 'lucide-react'
import { useTasks } from '../../Context/TaskContext.jsx'
import { useGamification } from '../../Context/GamificationContext.jsx'

export default function GlobalDrawer({ isOpen, onClose }) {
  const { addTask } = useTasks()
  const { addXP } = useGamification()
  
  // -- TABS --
  const [activeTab, setActiveTab] = useState('focus') // 'focus' | 'todo' | 'jots'

  // -- FOCUS TIMER STATE --
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState('focus') // 'focus' | 'break'

  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      addXP(mode === 'focus' ? 50 : 10)
      new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(e=>{})
      alert(mode === 'focus' ? 'Focus Session Complete!' : 'Break Over!')
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, mode])

  const toggleTimer = () => setIsActive(!isActive)
  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60)
  }
  const formatTime = (s) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${min}:${sec}`
  }

  // -- QUICK TODO STATE --
  const [quickTask, setQuickTask] = useState('')
  const handleAddTask = (e) => {
    if (e.key === 'Enter' && quickTask.trim()) {
      addTask({ title: quickTask, status: 'todo' })
      setQuickTask('')
      addXP(10)
    }
  }

  // -- JOTS STATE --
  const [note, setNote] = useState(localStorage.getItem('cb_jots') || '')
  useEffect(() => {
    localStorage.setItem('cb_jots', note)
  }, [note])


  if (!isOpen) return null

  return (
    <>
      <div 
        onClick={onClose}
        style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
          backdropFilter: 'blur(4px)', zIndex: 9998 
        }} 
      />
      <div className="animate-slide-in-right" style={{ 
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', 
        background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)',
        zIndex: 9999, padding: '32px', display: 'flex', flexDirection: 'column',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.5)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Today's Focus</h2>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
            </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
            {[
                { id: 'focus', icon: <Clock size={16} />, label: 'Timer' },
                { id: 'todo', icon: <CheckSquare size={16} />, label: 'Tasks' },
                { id: 'jots', icon: <StickyNote size={16} />, label: 'Jots' },
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{ 
                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                        background: activeTab === tab.id ? 'var(--bg-panel)' : 'transparent',
                        color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer'
                    }}
                >
                    {tab.icon} {tab.label}
                </button>
            ))}
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
            
            {activeTab === 'focus' && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ marginBottom: '24px', fontFamily: 'JetBrains Mono', fontSize: '4rem', fontWeight: 700, letterSpacing: '-2px' }}>
                        {formatTime(timeLeft)}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
                         <button onClick={() => { setMode('focus'); setTimeLeft(25*60); setIsActive(false) }} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border-subtle)', background: mode === 'focus' ? 'white' : 'transparent', color: mode === 'focus' ? 'black' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>Focus</button>
                         <button onClick={() => { setMode('break'); setTimeLeft(5*60); setIsActive(false) }} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border-subtle)', background: mode === 'break' ? 'white' : 'transparent', color: mode === 'break' ? 'black' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>Break</button>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <button 
                            onClick={toggleTimer}
                            className="btn-primary"
                            style={{ 
                                width: '64px', height: '64px', borderRadius: '50%', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.2rem'
                            }}
                        >
                            {isActive ? <Pause fill="black" /> : <Play fill="black" />}
                        </button>
                         <button 
                            onClick={resetTimer}
                            style={{ 
                                width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-panel)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'
                            }}
                        >
                            <RotateCcw size={20} />
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'todo' && (
                <div>
                    <input 
                        value={quickTask}
                        onChange={e => setQuickTask(e.target.value)}
                        onKeyDown={handleAddTask}
                        placeholder="Add a task & press Enter..."
                        style={{ 
                            width: '100%', padding: '16px', background: 'var(--bg-panel)', 
                            border: '1px solid var(--border-subtle)', borderRadius: '12px',
                            color: 'white', marginBottom: '24px', outline: 'none'
                        }}
                        autoFocus
                    />
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                        Type above to check in tasks quickly. <br/>Check the full Task Board for management.
                    </div>
                </div>
            )}

            {activeTab === 'jots' && (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                     <textarea 
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="Scratchpad for your thoughts..."
                        style={{ 
                            flex: 1, background: 'var(--bg-panel)', border: 'none', borderRadius: '12px',
                            padding: '16px', color: 'white', fontSize: '1rem', lineHeight: '1.6', resize: 'none', outline: 'none'
                        }}
                     />
                </div>
            )}

        </div>

      </div>
    </>
  )
}
