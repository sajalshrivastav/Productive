import React, { useEffect, useMemo, useState } from 'react'
import HabitCard from '../Components/habits/HabitCard.jsx'
import Card from '../Components/UI/Card.jsx'
import SectionTitle from '../Components/UI/SectionTitle.jsx'
import Button from '../Components/UI/Button.jsx'

const STORAGE_KEY = 'cb-habits'

const defaultHabits = [
  {
    id: 'h1',
    name: 'Coding',
    description: 'Solve at least 3 DSA questions.',
    color: 'pink',
    icon: '💻',
    history: {},
    streak: 0,
    total: 0,
  },
  {
    id: 'h2',
    name: 'Workout',
    description: 'Move your body for 30 minutes.',
    color: 'green',
    icon: '🏃',
    history: {},
    streak: 0,
    total: 0,
  },
]

function getDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildLastDays(n = 56) {
  const out = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = getDateKey(d)
    const label = d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
    out.push({ key, label })
  }
  return out
}

export default function Habits() {
  const [habits, setHabits] = useState(defaultHabits)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('✨')
  const [color, setColor] = useState('pink')

  const days = useMemo(() => buildLastDays(56), [])

  // Load from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setHabits(parsed)
      } catch (e) {
        console.error('Failed to parse habits from storage', e)
      }
    }
  }, [])

  // Save whenever habits change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
  }, [habits])

  const recalcStats = (habit) => {
    // compute streak from history and total completions
    const keys = Object.keys(habit.history || {}).filter(
      (k) => habit.history[k],
    )
    const total = keys.length

    // streak (consecutive days ending today)
    let streak = 0
    const today = new Date()
    const historySet = new Set(keys)
    while (true) {
      const key = getDateKey(today)
      if (!historySet.has(key)) break
      streak += 1
      today.setDate(today.getDate() - 1)
    }

    return { ...habit, streak, total }
  }

  const updateHabit = (id, updater) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h
        const updated = updater(h)
        return recalcStats(updated)
      }),
    )
  }

  const handleToggleDay = (habitId, dateKey) => {
    updateHabit(habitId, (h) => {
      const history = { ...(h.history || {}) }
      if (history[dateKey]) {
        delete history[dateKey]
      } else {
        history[dateKey] = true
      }
      return { ...h, history }
    })
  }

  const handleCompleteToday = (habitId) => {
    const todayKey = getDateKey()
    handleToggleDay(habitId, todayKey)
  }

  const handleDelete = (habitId) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId))
  }

  const handleAddHabit = () => {
    if (!name.trim()) return
    const newHabit = recalcStats({
      id: 'h' + Date.now(),
      name: name.trim(),
      description: description.trim(),
      color,
      icon: icon || '✨',
      history: {},
      streak: 0,
      total: 0,
    })
    setHabits((prev) => [...prev, newHabit])
    setName('')
    setDescription('')
    setIcon('✨')
    setColor('pink')
  }

  return (
    <div className="habits-page">
      <Card>
        <SectionTitle
          title="Habit tracker"
          subtitle="Build streaks with HabitKit-style cards."
        />
        <div className="habit-add-form">
          <div className="habit-add-row">
            <div className="habit-add-field">
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. DSA practice"
              />
            </div>
            <div className="habit-add-field">
              <label>Icon</label>
              <input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={2}
                placeholder="💻"
              />
            </div>
            <div className="habit-add-field">
              <label>Color</label>
              <select value={color} onChange={(e) => setColor(e.target.value)}>
                <option value="pink">Pink</option>
                <option value="blue">Blue</option>
                <option value="amber">Amber</option>
                <option value="green">Green</option>
              </select>
            </div>
          </div>
          <div className="habit-add-field">
            <label>Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description like 'Solve 3 DSA questions'"
            />
          </div>
          <div style={{ marginTop: 6 }}>
            <Button variant="primary" onClick={handleAddHabit}>
              Add habit
            </Button>
          </div>
        </div>
      </Card>

      <div className="habit-list">
        {habits.length === 0 && (
          <p className="habit-empty-text">
            No habits yet. Add one above to get started.
          </p>
        )}

        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            days={days}
            onToggleDay={handleToggleDay}
            onCompleteToday={handleCompleteToday}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}
