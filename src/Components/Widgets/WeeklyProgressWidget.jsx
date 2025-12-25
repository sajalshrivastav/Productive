import React, { useMemo } from 'react'
import '../../Styles/WigggleWidgets.css'
import { BarChart3 } from 'lucide-react'
import { useTasks } from '../../hooks/useTasks'
import { useHabits } from '../../hooks/useHabits'
import { useFocusSessions } from '../../hooks/useFocusSessions'

export default function WeeklyProgressWidget() {
    const { tasks } = useTasks()
    const { habits } = useHabits()
    const { getSessionsByDate } = useFocusSessions()

    // Calculate weekly metrics from real data
    const weeklyStats = useMemo(() => {
        // Get last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const y = d.getFullYear()
            const m = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            return `${y}-${m}-${day}`
        })

        // Count completed tasks this week
        const weekTasks = tasks.filter(t =>
            last7Days.includes(t.dateKey) && t.done
        ).length

        // Count habit completions this week
        const weekHabitChecks = habits.reduce((sum, habit) => {
            return sum + last7Days.filter(day => habit.history && habit.history[day]).length
        }, 0)

        // Calculate total focus hours this week
        const weekFocusMinutes = last7Days.reduce((sum, day) => {
            const daySessions = getSessionsByDate(day)
            const dayFocusMinutes = daySessions
                .filter(s => s.type === 'focus')
                .reduce((acc, s) => acc + (s.duration || 0) / 60, 0)
            return sum + dayFocusMinutes
        }, 0)
        const weekFocusHours = Math.round(weekFocusMinutes / 60)

        // Calculate dynamic targets based on actual data
        // For tasks: use total tasks this week (completed + incomplete)
        const totalWeekTasks = tasks.filter(t => last7Days.includes(t.dateKey)).length
        const taskTarget = Math.max(totalWeekTasks, 1) // At least 1 to avoid division by zero

        // For habits: use actual habits × 7 days
        const habitTarget = Math.max(habits.length, 1)

        // For focus: keep 28 hours as a reasonable weekly goal
        const focusTarget = 8

        return [
            {
                label: 'Tasks Completed',
                val: weekTasks,
                max: taskTarget,
                percent: Math.min(100, Math.round((weekTasks / taskTarget) * 100)),
                color: '#22c55e'
            },
            {
                label: 'Habits Maintained',
                val: weekHabitChecks,
                max: habitTarget,
                percent: Math.min(100, Math.round((weekHabitChecks / habitTarget) * 100)),
                color: '#eab308'
            },
            {
                label: 'Focus Hours',
                val: weekFocusHours,
                max: focusTarget,
                percent: Math.min(100, Math.round((weekFocusHours / focusTarget) * 100)),
                color: '#ef4444'
            }
        ]
    }, [tasks, habits, getSessionsByDate])

    return (
        <div className="wigggle-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <BarChart3 size={24} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Weekly Progress</h3>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                {/* Concentric Circles SVG */}
                <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                    <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                        {/* Circle 1 - Outer (Red) */}
                        <circle cx="70" cy="70" r="60" fill="none" stroke="#333" strokeWidth="10" />
                        <circle cx="70" cy="70" r="60" fill="none" stroke="#ef4444" strokeWidth="10"
                            strokeDasharray={`${(weeklyStats[2].percent / 100) * (2 * Math.PI * 60)} ${2 * Math.PI * 60}`} strokeLinecap="round" />

                        {/* Circle 2 - Middle (Yellow) */}
                        <circle cx="70" cy="70" r="45" fill="none" stroke="#333" strokeWidth="10" />
                        <circle cx="70" cy="70" r="45" fill="none" stroke="#eab308" strokeWidth="10"
                            strokeDasharray={`${(weeklyStats[1].percent / 100) * (2 * Math.PI * 45)} ${2 * Math.PI * 45}`} strokeLinecap="round" />

                        {/* Circle 3 - Inner (Green) */}
                        <circle cx="70" cy="70" r="30" fill="none" stroke="#333" strokeWidth="10" />
                        <circle cx="70" cy="70" r="30" fill="none" stroke="#22c55e" strokeWidth="10"
                            strokeDasharray={`${(weeklyStats[0].percent / 100) * (2 * Math.PI * 30)} ${2 * Math.PI * 30}`} strokeLinecap="round" />
                    </svg>
                </div>

                <div className="wigggle-weekly-legend">
                    {weeklyStats.map((s, i) => (
                        <div key={i} className="wigggle-legend-item">
                            <div className="wigggle-legend-box" style={{ background: s.color }}></div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.val}/{s.max}</div>
                                <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
