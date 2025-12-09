import React, { useEffect, useState } from 'react'
import Card from '../Components/UI/Card.jsx'
import SectionTitle from '../Components/UI/SectionTitle.jsx'
import Button from '../Components/UI/Button.jsx'
import { useTasks } from '../Context/TaskContext.jsx'

const STORAGE_KEY = 'cb-challenges-v1'

function getTodayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function Challenges() {
  const [challenges, setChallenges] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('pink')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dailyTask, setDailyTask] = useState('')

  const { addTask } = useTasks()

  // load from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setChallenges(JSON.parse(raw))
      } catch (e) {
        console.error('Failed to parse challenges', e)
      }
    }
  }, [])

  // save on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges))
  }, [challenges])

  const handleAddChallenge = () => {
    if (!name.trim()) return
    const todayKey = getTodayKey()
    const challenge = {
      id: 'c' + Date.now(),
      name: name.trim(),
      description: description.trim(),
      color,
      startDate: startDate || todayKey,
      endDate: endDate || '',
      dailyTask: dailyTask.trim(),
      createdAt: new Date().toISOString(),
      active: true,
    }
    setChallenges((prev) => [...prev, challenge])
    setName('')
    setDescription('')
    setColor('pink')
    setStartDate('')
    setEndDate('')
    setDailyTask('')
  }

  const handleToggleActive = (id) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
    )
  }

  const handleDelete = (id) => {
    setChallenges((prev) => prev.filter((c) => c.id !== id))
  }

  const handleAddTodayTask = (challenge) => {
    if (!challenge.dailyTask) return
    addTask({
      title: challenge.dailyTask,
      type: 'challenge',
      sourceId: challenge.id,
      dateKey: getTodayKey(),
    })
  }

  return (
    <div className="challenges-page">
      <Card>
        <SectionTitle
          title="Challenge system"
          subtitle="Create 30-day, 75-hard, or custom challenges that feed your daily tasks."
        />
        <div className="challenge-form">
          <div className="challenge-form-row">
            <div className="challenge-field">
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="30 days of DSA"
              />
            </div>
            <div className="challenge-field">
              <label>Color</label>
              <select value={color} onChange={(e) => setColor(e.target.value)}>
                <option value="pink">Pink</option>
                <option value="blue">Blue</option>
                <option value="amber">Amber</option>
                <option value="green">Green</option>
              </select>
            </div>
          </div>

          <div className="challenge-form-row">
            <div className="challenge-field">
              <label>Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="challenge-field">
              <label>End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="challenge-field">
            <label>Daily task text</label>
            <input
              value={dailyTask}
              onChange={(e) => setDailyTask(e.target.value)}
              placeholder="Solve 3 DSA questions"
            />
          </div>

          <div className="challenge-field">
            <label>Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of the challenge"
            />
          </div>

          <div style={{ marginTop: 8 }}>
            <Button variant="primary" onClick={handleAddChallenge}>
              Add challenge
            </Button>
          </div>
        </div>
      </Card>

      <div className="challenges-list">
        {challenges.length === 0 && (
          <p className="ch-empty-text">
            No challenges yet. Create one above to start.
          </p>
        )}

        {challenges.map((c) => (
          <Card key={c.id} className={`challenge-card challenge-${c.color}`}>
            <div className="challenge-card-header">
              <div className="challenge-title-block">
                <div className="challenge-dot" />
                <div>
                  <div className="challenge-name">{c.name}</div>
                  {c.description && (
                    <div className="challenge-description">{c.description}</div>
                  )}
                  <div className="challenge-meta">
                    {c.startDate || 'No start'} → {c.endDate || 'No end'}
                  </div>
                </div>
              </div>

              <button
                className="challenge-delete-btn"
                onClick={() => handleDelete(c.id)}
              >
                ✕
              </button>
            </div>

            <div className="challenge-body">
              <div className="challenge-body-row">
                <span className="challenge-label">Daily task</span>
                <span className="challenge-daily-text">
                  {c.dailyTask || '—'}
                </span>
              </div>
              <div className="challenge-body-row">
                <span className="challenge-label">Status</span>
                <span className="challenge-status">
                  {c.active ? 'Active' : 'Paused'}
                </span>
              </div>
            </div>

            <div className="challenge-footer">
              <div className="challenge-footer-left">
                <Button
                  variant="primary"
                  className="challenge-btn-small"
                  onClick={() => handleAddTodayTask(c)}
                >
                  Add today&apos;s task
                </Button>
                <Button
                  variant="ghost"
                  className="challenge-btn-small"
                  onClick={() => handleToggleActive(c.id)}
                >
                  {c.active ? 'Pause' : 'Activate'}
                </Button>
              </div>
              <div className="challenge-footer-right">
                <span>Type: challenge</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
