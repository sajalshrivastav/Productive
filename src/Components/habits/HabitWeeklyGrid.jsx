import React from 'react'
import { Check } from 'lucide-react'
import { getIconComponent } from '../../utils/iconHelpers'

function getDateKey(date = new Date()) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function getWeekDays() {
    const days = []
    const today = new Date()
    const currentDay = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1))

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday)
        date.setDate(monday.getDate() + i)
        const key = getDateKey(date)
        const label = date.toLocaleDateString('en-US', { weekday: 'long' })
        days.push({ key, label, date })
    }
    return days
}

export default function HabitWeeklyGrid({ habits, toggleDay }) {
    const weekDays = getWeekDays()
    const todayKey = getDateKey()

    const getCompletionPercentage = (dayKey) => {
        if (habits.length === 0) return 0
        const completed = habits.filter(h => h.history && h.history[dayKey]).length
        return Math.round((completed / habits.length) * 100)
    }

    return (
        <div style={{
            background: 'var(--bg-elevated)',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid var(--border-subtle)'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                    Daily Habits
                </h2>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-soft)' }}>
                    <span style={{
                        padding: '4px 12px',
                        background: 'var(--bg-surface)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        📊 Daily Wins, Weekly Overview
                    </span>
                    <span style={{
                        padding: '4px 12px',
                        background: 'var(--bg-surface)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        📅 Daily Wins, Day Overview
                    </span>
                </div>
            </div>

            {/* Grid Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: '0 8px'
                }}>
                    <thead>
                        <tr>
                            <th style={{
                                textAlign: 'left',
                                padding: '12px 16px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: 'var(--text-soft)',
                                borderBottom: '1px solid var(--border-subtle)'
                            }}>
                                ☑️ Habit
                            </th>
                            {weekDays.map(day => (
                                <th key={day.key} style={{
                                    textAlign: 'center',
                                    padding: '12px 8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: day.key === todayKey ? 'var(--accent-primary)' : 'var(--text-soft)',
                                    borderBottom: '1px solid var(--border-subtle)',
                                    minWidth: '80px'
                                }}>
                                    <div>{day.label}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {habits.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-soft)' }}>
                                    No habits yet. Create your first habit above!
                                </td>
                            </tr>
                        ) : (
                            habits.map(habit => {
                                const habitId = habit.id || habit._id
                                return (
                                    <tr key={habitId} style={{
                                        background: 'var(--bg-surface)',
                                        transition: 'all 0.2s'
                                    }}>
                                        <td style={{
                                            padding: '16px',
                                            borderRadius: '12px 0 0 12px',
                                            borderTop: '1px solid var(--border-subtle)',
                                            borderBottom: '1px solid var(--border-subtle)',
                                            borderLeft: '1px solid var(--border-subtle)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ fontSize: '1.2rem' }}>
                                                    {getIconComponent(habit.icon, 18)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                                        {habit.title}
                                                    </div>
                                                    {habit.description && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginTop: '2px' }}>
                                                            {habit.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        {weekDays.map(day => {
                                            const isChecked = habit.history && habit.history[day.key]
                                            const isToday = day.key === todayKey
                                            return (
                                                <td key={day.key} style={{
                                                    textAlign: 'center',
                                                    padding: '16px 8px',
                                                    borderTop: '1px solid var(--border-subtle)',
                                                    borderBottom: '1px solid var(--border-subtle)',
                                                    borderRight: day === weekDays[weekDays.length - 1] ? '1px solid var(--border-subtle)' : 'none',
                                                    borderRadius: day === weekDays[weekDays.length - 1] ? '0 12px 12px 0' : '0',
                                                    background: isToday ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-surface)'
                                                }}>
                                                    <div
                                                        onClick={() => toggleDay(habitId, day.key)}
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            margin: '0 auto',
                                                            borderRadius: '8px',
                                                            border: isChecked ? 'none' : '2px solid var(--border-subtle)',
                                                            background: isChecked ? 'var(--gradient-primary)' : 'transparent',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            color: isChecked ? '#000' : 'var(--text-soft)'
                                                        }}
                                                        className="hover:scale-110"
                                                    >
                                                        {isChecked && <Check size={18} strokeWidth={3} />}
                                                    </div>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Daily Completion Footer */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border-subtle)'
            }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-soft)' }}>
                    Daily Completion
                </div>
                <div style={{ display: 'flex', gap: '24px' }}>
                    {weekDays.map(day => {
                        const percentage = getCompletionPercentage(day.key)
                        const isToday = day.key === todayKey
                        return (
                            <div key={day.key} style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: isToday ? 'var(--accent-primary)' : 'var(--text-soft)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.7rem', marginBottom: '4px', opacity: 0.7 }}>
                                    CHECKED
                                </div>
                                <div>{percentage}%</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
