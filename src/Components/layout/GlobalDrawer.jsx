import React, { useState, useEffect } from 'react'
import { X, Play, Pause, RotateCcw, Settings, CheckSquare, Zap, Clock, Maximize2, Minimize2, Plus, Volume2, VolumeX } from 'lucide-react'
import { useTasks } from '../../Context/TaskContext.jsx'
import { useGamification } from '../../Context/GamificationContext.jsx'
import { useFocusSessions } from '../../Context/FocusSessionContext.jsx'
import { useHabits } from '../../Context/HabitContext.jsx'
import "../../Styles/GlobalDrawer.css";

export default function GlobalDrawer({ isOpen, onClose }) {
  const { addTask, todayTasks, toggleTask, tasks } = useTasks()
  const { addXP } = useGamification()
  const { addSession, getTodaySessions } = useFocusSessions()
  const { habits, toggleDay } = useHabits()

  // -- FOCUS TIMER STATE --
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState('focus') // 'focus' | 'break'
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const [completedSessions, setCompletedSessions] = useState(0)

  // -- CUSTOMIZATION STATE --
  const [focusDuration, setFocusDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  // -- JOTS STATE --
  const [note, setNote] = useState(localStorage.getItem('cb_jots') || '')
  useEffect(() => {
    localStorage.setItem('cb_jots', note)
  }, [note])

  // -- QUICK TASK STATE --
  const [quickTask, setQuickTask] = useState('')

  // -- TIMER LOGIC --
  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)

      const sessionData = {
        startTime: sessionStartTime,
        endTime: Date.now(),
        type: mode,
        duration: mode === 'focus' ? focusDuration * 60 : breakDuration * 60,
      }
      addSession(sessionData)
      addXP(mode === 'focus' ? 50 : 10)

      if (soundEnabled) {
        new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(e => { })
      }

      if (mode === 'focus') setCompletedSessions(prev => prev + 1)

      showNotification(mode === 'focus' ? '🎉 Focus Complete!' : '☕ Break Over!', mode)
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, mode])

  const showNotification = (message, type) => {
    const notification = document.createElement('div')
    notification.className = `global-notification ${type}`
    notification.textContent = message
    document.body.appendChild(notification)
    setTimeout(() => {
      notification.classList.add('exit')
      setTimeout(() => document.body.removeChild(notification), 300)
    }, 3000)
  }

  const toggleTimer = () => {
    if (!isActive) setSessionStartTime(Date.now())
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

  const switchMode = (newMode) => {
    setMode(newMode)
    setTimeLeft(newMode === 'focus' ? focusDuration * 60 : breakDuration * 60)
    setIsActive(false)
  }

  const handleQuickAdd = (e) => {
    if (e.key === 'Enter' && quickTask.trim()) {
      addTask({ title: quickTask.trim(), status: 'todo' })
      setQuickTask('')
      addXP(10)
    }
  }

  // Get Today's Date Key
  const getTodayKey = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  const todayKey = getTodayKey()

  // Habits Logic (Top 3 unfinished)
  const todaysHabits = habits.filter(h => {
    const history = h.history || {}
    return !history[todayKey] // Not done today
  }).slice(0, 3)

  // Top Tasks Logic (Top 5 todo)
  const topTasks = todayTasks.filter(t => !t.done).slice(0, 5)

  if (!isOpen) return null

  return (
    <>
      <div onClick={onClose} className="global-drawer-overlay" />
      <div className="global-drawer-container animate-slide-in-right">

        {/* HEADER */}
        <div className="global-header">
          <h2 className="drawer-title">Cmd Center</h2>
          <div className="header-actions">
            <button onClick={() => setShowSettings(!showSettings)}><Settings size={18} /></button>
            <button onClick={onClose}><X size={22} /></button>
          </div>
        </div>

        <div className="drawer-scroll-content">

          {/* FOCUS TIMER WIDGET */}
          <div className={`focus-widget ${isActive ? 'timer-active-glow' : ''}`}>
            <div className="timer-display">
              <span className="time-text">{formatTime(timeLeft)}</span>
              <span className="mode-badge">{mode}</span>
            </div>

            <div className="timer-controls">
              <button onClick={toggleTimer} className={`play-btn ${isActive ? 'active' : ''}`}>
                {isActive ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
              </button>
              <button onClick={resetTimer} className="control-btn"><RotateCcw size={16} /></button>
            </div>

            {/* Quick Time Presets */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
              {[15, 25, 60].map(m => (
                <button
                  key={m}
                  onClick={() => {
                    setFocusDuration(m);
                    setMode('focus');
                    setTimeLeft(m * 60);
                    setIsActive(false);
                    setSessionStartTime(null);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-subtle)',
                    background: focusDuration === m ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  {m}m
                </button>
              ))}
            </div>

            {/* Settings Panel (Inline) */}
            {showSettings && (
              <div className="timer-settings-panel">
                <div className="setting-row">
                  <label>Focus</label>
                  <input type="number" value={focusDuration} onChange={e => setFocusDuration(Number(e.target.value))} />
                </div>
                <div className="setting-row">
                  <label>Break</label>
                  <input type="number" value={breakDuration} onChange={e => setBreakDuration(Number(e.target.value))} />
                </div>
              </div>
            )}
          </div>

          {/* QUICK HABITS */}
          {todaysHabits.length > 0 && (
            <div className="section-container">
              <h3 className="section-title"><Zap size={14} color="#F59E0B" /> Quick Habits</h3>
              <div className="habits-row">
                {todaysHabits.map(h => (
                  <button
                    key={h.id || h._id}
                    onClick={() => toggleDay(h.id || h._id, todayKey)}
                    className="habit-chip"
                  >
                    {h.icon || '🔹'} {h.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TASKS */}
          <div className="section-container">
            <h3 className="section-title"><CheckSquare size={14} color="#3B82F6" /> Tasks</h3>

            <div className="quick-input-wrapper">
              <input
                value={quickTask}
                onChange={e => setQuickTask(e.target.value)}
                onKeyDown={handleQuickAdd}
                placeholder="Add task..."
                className="quick-task-input"
              />
              <button onClick={() => { addTask({ title: quickTask, status: 'todo' }); setQuickTask('') }} className="quick-add-btn"><Plus size={16} /></button>
            </div>

            <div className="mini-task-list">
              {topTasks.length === 0 ? (
                <div className="empty-state">All caught up! 🎉</div>
              ) : (
                topTasks.map(t => {
                  const taskId = t.id || t._id;
                  return (
                    <div key={taskId} className="mini-task-item">
                      <div className="task-check" onClick={() => toggleTask(taskId)}></div>
                      <span className="task-title">{t.title}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* JOTS */}
          <div className="section-container flexible-height">
            <h3 className="section-title">📝 Jots</h3>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Capture thoughts..."
              className="jots-area"
            />
          </div>

        </div>
      </div>
    </>
  )
}
