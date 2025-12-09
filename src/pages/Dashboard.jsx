import React, { useMemo, useState } from 'react'
import Card from '../Components/UI/Card.jsx'
import SectionTitle from '../Components/UI/SectionTitle.jsx'
import Button from '../Components/UI/Button.jsx'
import FocusTimer from '../Components/dashboard/FocusTimer.jsx'
import { useTasks } from '../Context/TaskContext.jsx'

export default function Dashboard() {
  const [focus, setFocus] = useState('DSA + Frontend + Health')
  const [mood, setMood] = useState(3)

  const { tasks, todayKey, todayTasks, todayCounts, addTask, toggleTask } =
    useTasks()
  const [newTodo, setNewTodo] = useState('')

  const completed = todayCounts.completed
  const totalToday = todayCounts.total
  const score =
    totalToday === 0 ? 0 : Math.round((completed / totalToday) * 100)

  const handleAddTodo = () => {
    if (!newTodo.trim()) return
    addTask({ title: newTodo, type: 'manual' })
    setNewTodo('')
  }

  // --- LAST 7 DAYS ANALYTICS ---
  const last7 = useMemo(() => {
    const out = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)

      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const key = `${y}-${m}-${day}`

      const dayTasks = tasks.filter((t) => t.dateKey === key)
      const total = dayTasks.length
      const done = dayTasks.filter((t) => t.done).length
      const percent = total === 0 ? 0 : Math.round((done / total) * 100)

      out.push({
        key,
        label: d.toLocaleDateString(undefined, { day: 'numeric' }),
        weekday: d.toLocaleDateString(undefined, { weekday: 'short' }),
        total,
        done,
        percent,
      })
    }

    return out
  }, [tasks])

  const totalTasks7 = last7.reduce((sum, d) => sum + d.total, 0)
  const totalDone7 = last7.reduce((sum, d) => sum + d.done, 0)

  const avgCompletion7 =
    last7.length === 0
      ? 0
      : Math.round(last7.reduce((sum, d) => sum + d.percent, 0) / last7.length)

  const bestDay =
    last7.length === 0
      ? null
      : last7.reduce((best, d) => (d.percent > best.percent ? d : best))

  const fullCompletionStreak = (() => {
    let streak = 0
    for (let i = last7.length - 1; i >= 0; i--) {
      const d = last7[i]
      if (d.total > 0 && d.done === d.total) streak++
      else break
    }
    return streak
  })()

  return (
    <div className="dashboard-grid">
      {/* Left column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card>
          <SectionTitle
            title="Today overview"
            subtitle="Set your focus and mood for the day."
          />
          <div
            style={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <label style={{ fontSize: '0.8rem' }}>
              Focus of the day
              <input
                style={{
                  marginTop: 4,
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(9,11,16,0.9)',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
              />
            </label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem' }}>
                Mood (1–5)
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={mood}
                  onChange={(e) => setMood(Number(e.target.value || 0))}
                  style={{
                    marginLeft: 6,
                    width: 40,
                    padding: '4px 6px',
                    borderRadius: 8,
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(9,11,16,0.9)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                  }}
                />
              </label>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                <div>
                  ✅ Tasks: <strong>{completed}</strong> / {totalToday}
                </div>
                <div>
                  ⭐ Score: <strong>{score}</strong>/100
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle
            title="Today tasks"
            subtitle="Your most important actions today."
          />
          <div
            style={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {todayTasks.map((t) => (
              <label
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(9,11,16,0.9)',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => toggleTask(t.id)}
                  />
                  <span
                    style={{
                      textDecoration: t.done ? 'line-through' : 'none',
                      color: t.done ? 'var(--text-faint)' : 'var(--text-main)',
                    }}
                  >
                    {t.title}
                  </span>
                </div>
              </label>
            ))}

            <div
              style={{
                display: 'flex',
                gap: 6,
                marginTop: 4,
              }}
            >
              <input
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(9,11,16,0.9)',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
                placeholder="Add a new task..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTodo()
                }}
              />
              <Button variant="primary" onClick={handleAddTodo}>
                Add
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Right column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card>
          <SectionTitle
            title="Focus timer"
            subtitle="Deep work sessions with a simple timer."
          />
          <FocusTimer />
        </Card>

        <Card>
          <SectionTitle
            title="Last 7 days"
            subtitle="Task completion trend for the past week."
          />
          <div className="analytics-card">
            <div className="analytics-stats-row">
              <div className="analytics-stat">
                <div className="label">Avg completion</div>
                <div className="value">{avgCompletion7}%</div>
              </div>
              <div className="analytics-stat">
                <div className="label">Tasks done</div>
                <div className="value">
                  {totalDone7}/{totalTasks7}
                </div>
              </div>
              <div className="analytics-stat">
                <div className="label">Full-complete streak</div>
                <div className="value">{fullCompletionStreak}d</div>
              </div>
            </div>

            <div className="analytics-bars">
              {last7.map((d) => {
                const barHeight = 18 + d.percent * 0.7 // min height + scale
                return (
                  <div key={d.key} className="analytics-bar-wrapper">
                    <div
                      className={
                        'analytics-bar' +
                        (d.percent === 0 ? ' empty' : '') +
                        (d.key === todayKey ? ' today' : '')
                      }
                      style={{ height: `${barHeight}px` }}
                      title={`${d.weekday} ${d.key} • ${d.done}/${d.total} tasks (${d.percent}%)`}
                    />
                    <div className="analytics-bar-day">{d.label}</div>
                  </div>
                )
              })}
            </div>

            {bestDay && (
              <div className="analytics-footer">
                <span>
                  Best: {bestDay.weekday} ({bestDay.percent}%)
                </span>
                <span>
                  Days with tasks: {last7.filter((d) => d.total > 0).length}/
                  {last7.length}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
