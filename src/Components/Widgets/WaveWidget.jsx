import { useMemo } from 'react'
import '../../Styles/WigggleWidgets.css'
import { useTasks } from '../../hooks/useTasks'
import { useHabits } from '../../hooks/useHabits'
import { useFocusSessions } from '../../hooks/useFocusSessions'

export default function WaveWidget() {
    const { tasks } = useTasks()
    const { habits } = useHabits()
    const { sessions } = useFocusSessions()

    // Calculate monthly productivity data
    const { monthlyData, currentProductivity, trend } = useMemo(() => {
        const now = new Date()
        const data = []

        // Get last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const monthKey = `${year}-${month}`
            const monthLabel = date.toLocaleDateString('en-US', { month: 'short' })

            // Get days in month
            const daysInMonth = new Date(year, date.getMonth() + 1, 0).getDate()

            // Calculate task completion rate
            const monthTasks = tasks.filter(t => t.dateKey && t.dateKey.startsWith(monthKey))
            const taskScore = monthTasks.length > 0
                ? (monthTasks.filter(t => t.done).length / monthTasks.length) * 100
                : 0

            // Calculate habit consistency
            let habitScore = 0
            if (habits.length > 0) {
                const totalPossibleChecks = habits.length * daysInMonth
                const actualChecks = habits.reduce((sum, habit) => {
                    if (!habit.history) return sum
                    return sum + Object.keys(habit.history).filter(d => d.startsWith(monthKey) && habit.history[d]).length
                }, 0)
                habitScore = totalPossibleChecks > 0 ? (actualChecks / totalPossibleChecks) * 100 : 0
            }

            // Calculate focus time score (target: 4 hours/day)
            const monthSessions = sessions.filter(s => {
                if (!s.startTime) return false
                const sessionMonth = new Date(s.startTime).toISOString().slice(0, 7)
                return sessionMonth === monthKey
            })

            const totalFocusHours = monthSessions
                .filter(s => s.type === 'focus')
                .reduce((sum, s) => sum + (s.duration || 0) / 3600, 0)

            const targetHours = daysInMonth * 4
            const focusScore = targetHours > 0 ? Math.min(100, (totalFocusHours / targetHours) * 100) : 0

            // Average all scores for overall productivity
            const productivity = Math.round((taskScore + habitScore + focusScore) / 3)

            data.push({
                label: monthLabel,
                value: productivity
            })
        }

        // Current month is the last one
        const current = data[data.length - 1]?.value || 0
        const previous = data[data.length - 2]?.value || 0
        const trendValue = current - previous

        return {
            monthlyData: data,
            currentProductivity: current,
            trend: trendValue
        }
    }, [tasks, habits, sessions])

    // Calculate SVG path for a smooth curve
    const pathData = useMemo(() => {
        const width = 300
        const height = 100
        const maxVal = 100

        // Normalize points
        const points = monthlyData.map((d, i) => {
            const x = (i / (monthlyData.length - 1)) * width
            const y = height - (d.value / maxVal) * height
            return { x, y }
        })

        // Generate smooth bezier curve
        let path = `M ${points[0].x} ${points[0].y}`

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i]
            const p1 = points[i + 1]

            // Control points
            const cp1x = p0.x + (p1.x - p0.x) * 0.5
            const cp1y = p0.y
            const cp2x = p1.x - (p1.x - p0.x) * 0.5
            const cp2y = p1.y

            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`
        }

        // Close the path for the gradient fill
        const fillPath = `${path} L ${width} ${height} L 0 ${height} Z`

        return { stroke: path, fill: fillPath }
    }, [monthlyData])

    return (
        <div className="wave-widget">
            <div className="widget-header">
                <div>
                    <h3 className="widget-title">Productivity Flow</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                        {currentProductivity}%
                    </div>
                    <div style={{
                        fontSize: '0.8rem',
                        color: trend >= 0 ? '#22c55e' : '#ef4444',
                        marginTop: '4px'
                    }}>
                        {trend >= 0 ? '+' : ''}{trend}% vs last month
                    </div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                    {new Date().getFullYear()}
                </div>
            </div>

            <div className="wave-chart-container">
                <svg viewBox="0 0 300 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                    <defs>
                        <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={pathData.fill} fill="url(#waveGradient)" />
                    <path d={pathData.stroke} fill="none" stroke="#22c55e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            <div className="wave-labels">
                {monthlyData.map((d, i) => (
                    <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', color: '#71717a' }}>{d.label}</span>
                ))}
            </div>
        </div>
    )
}
