import React, { useMemo } from 'react'
import '../../Styles/WigggleWidgets.css'
import { useFocusSessions } from '../../hooks/useFocusSessions'
import { useTasks } from '../../hooks/useTasks'

export default function DailyStatsWidget() {
    const { getTodaySessions } = useFocusSessions()
    const { todayTasks } = useTasks()

    // Calculate metrics from real data
    const metrics = useMemo(() => {
        const sessions = getTodaySessions()

        // Calculate total time in hours
        const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
        const totalHours = Math.floor(totalSeconds / 3600)

        // Calculate focus and break time
        const focusSeconds = sessions.filter(s => s.type === 'focus').reduce((sum, s) => sum + (s.duration || 0), 0)
        const breakSeconds = sessions.filter(s => s.type === 'break').reduce((sum, s) => sum + (s.duration || 0), 0)

        // Calculate percentages for circles
        const focusPercent = totalSeconds > 0 ? Math.round((focusSeconds / totalSeconds) * 100) : 0
        const breakPercent = totalSeconds > 0 ? Math.round((breakSeconds / totalSeconds) * 100) : 0
        const othersPercent = Math.max(0, 100 - focusPercent - breakPercent)

        // Work day percentage (assuming 8 hour = 28800 seconds workday)
        const workDayPercent = Math.min(100, Math.round((totalSeconds / 28800) * 100))

        // Task count
        const taskCount = todayTasks?.length || 0

        return {
            totalHours,
            taskCount,
            workDayPercent,
            breakdown: [
                { label: 'Focus', val: focusPercent, color: '#eab308' },
                { label: 'Breaks', val: breakPercent, color: '#22c55e' },
                { label: 'Others', val: othersPercent, color: '#ef4444' }
            ]
        }
    }, [getTodaySessions, todayTasks])

    return (
        <div className="wigggle-card" style={{ padding: '32px' }}>
            <div className="wigggle-stats-row">
                <div>
                    <div className="wigggle-stat-title">Time</div>
                    <div className="wigggle-stat-val">{metrics.totalHours}h</div>
                </div>
                <div>
                    <div className="wigggle-stat-title">Tasks</div>
                    <div className="wigggle-stat-val">{metrics.taskCount}</div>
                </div>
                <div>
                    <div className="wigggle-stat-title">Work day</div>
                    <div className="wigggle-stat-val">{metrics.workDayPercent}%</div>
                </div>
            </div>

            <div className="wigggle-circles-row">
                {metrics.breakdown.map((m, i) => (
                    <div key={i} className="wigggle-circle-stat">
                        <div className="circle-progress-container">
                            <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                                <circle cx="30" cy="30" r="26" fill="none" stroke="#333" strokeWidth="4" />
                                <circle cx="30" cy="30" r="26" fill="none" stroke={m.color} strokeWidth="4"
                                    strokeDasharray={`${(m.val / 100) * (2 * Math.PI * 26)} ${2 * Math.PI * 26}`} strokeLinecap="round" />
                            </svg>
                            <span className="circle-val">{m.val}%</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{m.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
