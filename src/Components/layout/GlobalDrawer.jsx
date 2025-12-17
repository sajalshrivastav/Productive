import React, { useState, useEffect } from 'react'
import { X, Clock, CheckSquare, StickyNote, Play, Pause, RotateCcw, Settings, BarChart3, Target, Zap, Coffee, Volume2, VolumeX, Palette } from 'lucide-react'
import { useTasks } from '../../Context/TaskContext.jsx'
import { useGamification } from '../../Context/GamificationContext.jsx'
import { useFocusSessions } from '../../Context/FocusSessionContext.jsx'
import "../../Styles/GlobalDrawer.css";
export default function GlobalDrawer({ isOpen, onClose }) {
  const { addTask, tasks } = useTasks()
  const { addXP } = useGamification()
  const { addSession, getTodaySessions } = useFocusSessions()

  // -- TABS --
  const [activeTab, setActiveTab] = useState('todo') // 'todo' | 'jots' | 'stats'

  // -- FOCUS TIMER STATE --
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState('focus') // 'focus' | 'break'
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [completedSessions, setCompletedSessions] = useState(0)
  
  // -- CUSTOMIZATION STATE --
  const [focusDuration, setFocusDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [theme, setTheme] = useState('default')
  const [showSettings, setShowSettings] = useState(false)

  // -- PRESET TIMERS --
  const presets = [
    { name: 'Pomodoro', focus: 25, break: 5, icon: '🍅' },
    { name: 'Deep Work', focus: 90, break: 20, icon: '🧠' },
    { name: 'Quick Sprint', focus: 15, break: 3, icon: '⚡' },
    { name: 'Study Session', focus: 50, break: 10, icon: '📚' }
  ]

  // -- THEMES --
  const themes = [
    { name: 'default', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#667eea' },
    { name: 'forest', bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', accent: '#11998e' },
    { name: 'sunset', bg: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)', accent: '#ff7e5f' },
    { name: 'ocean', bg: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)', accent: '#2196F3' },
    { name: 'dark', bg: 'linear-gradient(135deg, #434343 0%, #000000 100%)', accent: '#666666' }
  ]

  const currentTheme = themes.find(t => t.name === theme) || themes[0]

  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      
      // Save completed session
      const sessionData = {
        startTime: sessionStartTime,
        endTime: Date.now(),
        type: mode,
        duration: mode === 'focus' ? focusDuration * 60 : breakDuration * 60,
        taskId: selectedTask?._id || null
      }
      addSession(sessionData)
      
      // Add XP and play sound
      addXP(mode === 'focus' ? 50 : 10)
      if (soundEnabled) {
        new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(e => { })
      }
      
      // Update completed sessions count
      if (mode === 'focus') {
        setCompletedSessions(prev => prev + 1)
      }
      
      // Show completion notification
      const message = mode === 'focus' 
        ? `🎉 Focus Session Complete! ${selectedTask ? `Task: ${selectedTask.title}` : ''}`
        : '☕ Break Over! Ready for another session?'
      
      // Custom notification instead of alert
      showNotification(message, mode)
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, mode, sessionStartTime, focusDuration, breakDuration, selectedTask, soundEnabled, addSession, addXP])

  const showNotification = (message, type) => {
    // Create a custom notification element
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'focus' ? '#10b981' : '#f59e0b'};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideInRight 0.3s ease-out;
    `
    notification.textContent = message
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in'
      setTimeout(() => document.body.removeChild(notification), 300)
    }, 3000)
  }

  const toggleTimer = () => {
    if (!isActive) {
      setSessionStartTime(Date.now())
    }
    setIsActive(!isActive)
  }
  
  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(mode === 'focus' ? focusDuration * 60 : breakDuration * 60)
    setSessionStartTime(null)
  }
  
  const formatTime = (s) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${min}:${sec}`
  }

  const applyPreset = (preset) => {
    setFocusDuration(preset.focus)
    setBreakDuration(preset.break)
    setTimeLeft(mode === 'focus' ? preset.focus * 60 : preset.break * 60)
    setIsActive(false)
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setTimeLeft(newMode === 'focus' ? focusDuration * 60 : breakDuration * 60)
    setIsActive(false)
    setSessionStartTime(null)
  }

  // Get today's stats
  const todaySessions = getTodaySessions()
  const todayFocusTime = todaySessions
    .filter(s => s.type === 'focus')
    .reduce((sum, s) => sum + (s.duration || 0), 0)
  const todayBreakTime = todaySessions
    .filter(s => s.type === 'break')
    .reduce((sum, s) => sum + (s.duration || 0), 0)

  // Progress calculation
  const totalTime = mode === 'focus' ? focusDuration * 60 : breakDuration * 60
  const progress = ((totalTime - timeLeft) / totalTime) * 100
  
  // Available tasks for selection
  const availableTasks = tasks.filter(t => !t.done && !t.isArchived).slice(0, 5)

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
        className="global-drawer-overlay"
      />
      <div className="animate-slide-in-right global-drawer-container">

        {/* Header */}
        <div className="global-header-container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <h2 className="global-header-title">Today's Focus</h2>
            
            {/* Timer Controls Row */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              fontSize: '0.85rem'
            }}>
              {/* Timer Display */}
              <div style={{ 
                fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                minWidth: '50px'
              }}>
                {formatTime(timeLeft)}
              </div>
              
              {/* Focus/Break Toggle with Gradients */}
              <div style={{ 
                display: 'flex', 
                background: 'var(--bg-surface)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                gap: '2px'
              }}>
                <button 
                  onClick={() => switchMode('focus')} 
                  style={{ 
                    padding: '4px 10px', 
                    borderRadius: '5px', 
                    border: 'none', 
                    background: mode === 'focus' 
                      ? 'linear-gradient(135deg, #facc15 0%, #3b82f6 50%, #10b981 100%)' 
                      : 'transparent', 
                    color: mode === 'focus' ? 'white' : 'var(--text-secondary)', 
                    fontWeight: 500, 
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    transition: 'all 0.3s ease',
                    textShadow: mode === 'focus' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                    minWidth: '45px'
                  }}
                >
                  Focus
                </button>
                <button 
                  onClick={() => switchMode('break')} 
                  style={{ 
                    padding: '4px 10px', 
                    borderRadius: '5px', 
                    border: 'none', 
                    background: mode === 'break' 
                      ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%)' 
                      : 'transparent', 
                    color: mode === 'break' ? 'white' : 'var(--text-secondary)', 
                    fontWeight: 500, 
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    transition: 'all 0.3s ease',
                    textShadow: mode === 'break' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                    minWidth: '45px'
                  }}
                >
                  Break
                </button>
              </div>

              {/* Play/Pause Button */}
              <button
                onClick={toggleTimer}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isActive 
                    ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' 
                    : 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                {isActive ? <Pause size={14} color="white" /> : <Play size={14} color="white" />}
              </button>

              {/* Reset Button */}
              <button
                onClick={resetTimer}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                <RotateCcw size={11} />
              </button>
            </div>


          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '8px',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <Settings size={16} />
            </button>
            <button onClick={onClose} className="global-header-close-button">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="global-tabs-container">
          {[
            { id: 'todo', icon: <CheckSquare size={16} />, label: 'Tasks' },
            { id: 'stats', icon: <BarChart3 size={16} />, label: 'Stats' },
            { id: 'jots', icon: <StickyNote size={16} />, label: 'Jots' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`global-tabs-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div style={{ 
            background: 'var(--bg-panel)', 
            borderRadius: '16px', 
            padding: '20px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Timer Settings</h3>
            
            {/* Presets */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Presets</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {presets.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '12px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      textAlign: 'left'
                    }}
                  >
                    <div>{preset.icon} {preset.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{preset.focus}m / {preset.break}m</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Durations */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Focus (min)</label>
                <input
                  type="number"
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Break (min)</label>
                <input
                  type="number"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            {/* Sound Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                style={{
                  background: soundEnabled ? 'linear-gradient(135deg, #facc15 0%, #3b82f6 50%, #10b981 100%)' : 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px',
                  color: soundEnabled ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sound Notifications</span>
            </div>
          </div>
        )}

        {/* CONTENT */}
        <div className="global-content-container">



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
                Type above to check in tasks quickly. <br />Check the full Task Board for management.
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div style={{ color: 'white' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', textAlign: 'center' }}>📊 Focus Statistics</h3>
              
              {/* Today's Stats */}
              <div style={{ 
                background: 'var(--bg-elevated)', 
                borderRadius: '12px', 
                padding: '16px', 
                marginBottom: '16px',
                border: '1px solid var(--border-subtle)'
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-soft)' }}>Today</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="stat-number" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                      {todaySessions.filter(s => s.type === 'focus').length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>Sessions</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="stat-number" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>
                      {Math.round(todayFocusTime / 60)}m
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>Focused</div>
                  </div>
                </div>
              </div>

              {/* Weekly Goal Progress */}
              <div style={{ 
                background: 'var(--bg-elevated)', 
                borderRadius: '12px', 
                padding: '16px', 
                marginBottom: '16px',
                border: '1px solid var(--border-subtle)'
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-soft)' }}>Weekly Goal</h4>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span>Focus Time</span>
                    <span>{Math.round(todayFocusTime / 60)} / 300 min</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    background: 'var(--bg-surface)', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${Math.min((todayFocusTime / 60 / 300) * 100, 100)}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>

              {/* Recent Sessions */}
              <div style={{ 
                background: 'var(--bg-elevated)', 
                borderRadius: '12px', 
                padding: '16px',
                border: '1px solid var(--border-subtle)'
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-soft)' }}>Recent Sessions</h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {todaySessions.slice(0, 5).map((session, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: index < 4 ? '1px solid var(--border-subtle)' : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: session.type === 'focus' ? '#10b981' : '#f59e0b' 
                        }} />
                        <span style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>
                          {session.type}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                        {Math.round((session.duration || 0) / 60)}m
                      </div>
                    </div>
                  ))}
                  {todaySessions.length === 0 && (
                    <div style={{ 
                      textAlign: 'center', 
                      color: 'var(--text-soft)', 
                      fontSize: '0.85rem',
                      padding: '20px 0'
                    }}>
                      No sessions today yet. Start your first focus session! 🚀
                    </div>
                  )}
                </div>
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
