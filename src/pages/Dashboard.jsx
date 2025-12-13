import React, { useState, useEffect } from 'react'
import { useChallenge } from '../Context/ChallengeContext.jsx'
import { useTasks } from '../Context/TaskContext.jsx'
import { useHabits } from '../Context/HabitContext.jsx'
import { useGamification } from '../Context/GamificationContext.jsx'
import { Trophy, Bell, CloudSun, Flame, Moon, Sun } from 'lucide-react'
import { useTheme } from '../Context/ThemeContext.jsx'

// Wigggle Widgets
import TasksWidget from '../Components/Widgets/TasksWidget.jsx'
import WeeklyProgressWidget from '../Components/Widgets/WeeklyProgressWidget.jsx'
import DailyStatsWidget from '../Components/Widgets/DailyStatsWidget.jsx'
import HabitsWidget from '../Components/Widgets/HabitsWidget.jsx'

// Helper to get formatted date
const getTodayString = () => new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
}

export default function Dashboard() { 
  const { activeChallenge, completedDays, activeDay } = useChallenge()
  const { tasks } = useTasks()
  const { habits, toggleDay } = useHabits()

  const { xp, level, getLevelProgress, title: userTitle } = useGamification()
  const { theme, toggleTheme } = useTheme()
  
  const [plannerEvents, setPlannerEvents] = useState([])
  useEffect(() => {
      try {
        const raw = localStorage.getItem('cb-planner-custom-v1')
        if (raw) {
            const data = JSON.parse(raw)
            const d = new Date()
            const y = d.getFullYear()
            const m = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            const key = `${y}-${m}-${day}`
            setPlannerEvents(data[key] || [])
        }
      } catch (e) {}
  }, [])

  const todoTasks = tasks.filter(t => !t.done).slice(0, 5) // Show top 5
  
  // Habits for today
  const todayKey = (() => {
      const d = new Date()
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
  })()

  // GLASSMORPHISM STYLE
  const glassStyle = {
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '24px',
      padding: '24px'
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
        
        {/* HEADER: Right aligned pills (Level, Weather, Bell) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
            
            {/* 3.2 LEVEL PILL (Refactored) */}
            <div style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', 
                padding: '8px 16px', borderRadius: '50px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer'
            }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'white' }}>
                    {level}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{userTitle}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '10px', marginLeft: '5px' }}>
                     {Math.round(xp)} XP
                </span>
            </div>

            {/* UI TOGGLE PILL */}
            <div 
                onClick={toggleTheme}
                style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    padding: '8px 12px', borderRadius: '50px',
                    background: 'var(--wigggle-bg-inner)', border: '1px solid var(--wigggle-border)',
                    cursor: 'pointer', color: 'var(--text-secondary)'
                }}>
                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </div>

            {/* 3.1 PILL SHAPE WEATHER */}
            <div style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', 
                padding: '8px 16px', borderRadius: '50px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer'
            }}>
                <CloudSun size={18} />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>24°C Cloudy</span>
            </div>
            
            {/* NOTIFICATION BELL */}
            <div style={{ position: 'relative', cursor: 'pointer', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={20} />
                <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: 'var(--accent-primary)', borderRadius: '50%', border: '1px solid #0f0f0f' }} />
            </div>
        </div>

        {/* MAIN WIDGET GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1.3fr) 1fr', gap: '32px' }}>
            
            {/* LEFT COLUMN: Challenge & Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {activeChallenge ? (
                    <div style={{ ...glassStyle, position: 'relative', overflow: 'hidden', padding: 0 }}>
                         {/* Header Image / Gradient */}
                         <div style={{ height: '100px', background: 'linear-gradient(135deg, rgba(34,197,94,0.4), rgba(34,197,94,0.0))' }} />
                         <div style={{ padding: '24px' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-50px' }}>
                                 <div>
                                     <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.7, marginBottom: '4px' }}>ACTIVE CHALLENGE</div>
                                     <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{activeChallenge.title}</h2>
                                 </div>
                                 <div style={{ textAlign: 'right' }}>
                                     <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{activeDay}</div>
                                     <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>/ {activeChallenge.duration} Days</div>
                                 </div>
                             </div>

                             <div style={{ marginTop: '24px' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                     <span>Progress</span>
                                     <span>{Math.round((completedDays.length / activeChallenge.duration) * 100)}%</span>
                                 </div>
                                 <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                     <div style={{ width: `${(completedDays.length / activeChallenge.duration) * 100}%`, height: '100%', background: '#4ade80', borderRadius: '4px' }} />
                                 </div>
                             </div>
                         </div>
                    </div>
                ) : (
                    <div style={{ ...glassStyle, textAlign: 'center', padding: '48px 24px' }}>
                        <Flame size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <h3>No Active Challenge</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Time to step up? Go to Challenges tab.</p>
                    </div>
                )}

                {/* WIGGGLE UI: Extra Stats moved to Left Column for balance */}
                <DailyStatsWidget />
                <WeeklyProgressWidget />

            </div>

            {/* RIGHT COLUMN: Tasks & Habits */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* WIGGGLE UI: Tasks Widget */}
                <TasksWidget />

                {/* WIGGGLE UI: Habits Widget */}
                <HabitsWidget />

            </div>
        </div>

    </div>
  )
}
