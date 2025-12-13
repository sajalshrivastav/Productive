import React from 'react'
import { Check, Flame, BookOpen, Moon, Dumbbell, Droplets, Sun, Briefcase } from 'lucide-react'
import { useHabits } from '../../Context/HabitContext.jsx'

const getIconForHabit = (habit) => {
    const title = habit.title?.toLowerCase() || habit.name?.toLowerCase() || ''
    if (title.includes('read') || title.includes('book')) return <BookOpen size={24} />
    if (title.includes('workout') || title.includes('gym') || title.includes('exercise')) return <Dumbbell size={24} />
    if (title.includes('water') || title.includes('drink')) return <Droplets size={24} />
    if (title.includes('sleep') || title.includes('bed')) return <Moon size={24} />
    if (title.includes('morning') || title.includes('wake')) return <Sun size={24} />
    if (title.includes('work') || title.includes('code')) return <Briefcase size={24} />
    return <Flame size={24} />
}

export default function HabitCarouselWidget() {
    const { habits, toggleDay } = useHabits()

    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    const todayKey = `${y}-${m}-${d}`

    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '24px'
    }

    if (habits.length === 0) {
        return (
            <div style={glassStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Habits</h3>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                    <p>No habits tracked yet.</p>
                </div>
            </div>
        )
    }

    return (
        <div style={glassStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Habits</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px' }}>
                    {habits.filter(h => h.history && h.history[todayKey]).length}/{habits.length} Done
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                {habits.map(habit => {
                    const isCompleted = habit.history && habit.history[todayKey]
                    const streak = habit.streak || Object.keys(habit.history || {}).length || 0
                    
                    return (
                        <div 
                            key={habit.id || habit._id}
                            onClick={() => toggleDay(habit.id || habit._id, todayKey)}
                            style={{
                                background: isCompleted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.03)',
                                border: isCompleted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '20px',
                                padding: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                minHeight: '130px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            className="hover:bg-white/5 active:scale-95 translation-all duration-200"
                        >
                            {/* Top Section: Title & Streak */}
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px', lineHeight: '1.2' }}>
                                    {habit.title || habit.name}
                                </h4>
                                <div style={{ fontSize: '0.75rem', color: isCompleted ? '#4ade80' : 'var(--text-secondary)', fontWeight: 500 }}>
                                    Streak: {streak} days
                                </div>
                            </div>

                            {/* Bottom Section: Icon & Check Button */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                                <div style={{ 
                                    color: isCompleted ? '#4ade80' : 'var(--accent-primary)',
                                    opacity: isCompleted ? 1 : 0.8
                                }}>
                                    {getIconForHabit(habit)}
                                </div>

                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '10px',
                                    background: isCompleted ? '#4ade80' : 'rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: isCompleted ? '#000' : 'var(--text-secondary)',
                                    transition: 'background 0.2s'
                                }}>
                                    <Check size={18} strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
