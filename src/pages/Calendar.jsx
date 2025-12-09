// src/Pages/Calendar.jsx
import React, { useMemo, useState, useEffect } from 'react'
import Card from '../Components/UI/Card.jsx'
import SectionTitle from '../Components/UI/SectionTitle.jsx'
import { useTasks } from '../Context/TaskContext.jsx'
import EventModal from '../Components/calendar/EventModal.jsx'

const EVENT_STORAGE_KEY = 'cb-events-v1'

function getTodayKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildMonthDays(year, monthIndex) {
  const first = new Date(year, monthIndex, 1)
  const firstWeekday = first.getDay() // 0-6 Sunday-Sat
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  const days = []

  // leading empty cells
  for (let i = 0; i < firstWeekday; i++) days.push(null)

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, monthIndex, d)
    const key = getTodayKey(date)
    days.push({
      date,
      key,
      dayNumber: d,
      isToday: key === getTodayKey(),
      weekday: date.toLocaleDateString(undefined, { weekday: 'short' }),
      label: date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
    })
  }

  // trailing empties to fill last row
  while (days.length % 7 !== 0) days.push(null)

  return days
}

function loadEvents() {
  try {
    const raw = localStorage.getItem(EVENT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Failed to load events', e)
    return []
  }
}

function saveEvents(events) {
  try {
    localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events))
  } catch (e) {
    console.error('Failed to save events', e)
  }
}

export default function CalendarPage() {
  const { tasks, getTasksForDate, addTask, toggleTask } = useTasks()
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth()) // 0-11
  const [year, setYear] = useState(today.getFullYear())
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayKey())
  const [events, setEvents] = useState(() => loadEvents())
  const [showEventModal, setShowEventModal] = useState(false)

  // load events on mount (keeps current state if already set)
  useEffect(() => {
    setEvents(loadEvents())
  }, [])

  // persist events when changed
  useEffect(() => {
    saveEvents(events)
  }, [events])

  const days = useMemo(() => buildMonthDays(year, month), [year, month])

  const monthLabel = useMemo(
    () =>
      new Date(year, month, 1).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    [year, month],
  )

  const eventsByDate = useMemo(() => {
    const map = new Map()
    events.forEach((e) => {
      if (!map.has(e.dateKey)) map.set(e.dateKey, [])
      map.get(e.dateKey).push(e)
    })
    // sort events by startTime if present
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => {
        if (a.startTime && b.startTime)
          return a.startTime.localeCompare(b.startTime)
        return 0
      })
    }
    return map
  }, [events])

  const selectedTasks = useMemo(
    () => getTasksForDate(selectedDateKey),
    [getTasksForDate, selectedDateKey],
  )

  // selected date events
  const selectedEvents = eventsByDate.get(selectedDateKey) || []

  // navigation
  const handlePrevMonth = () => {
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1)
        return 11
      }
      return m - 1
    })
  }
  const handleNextMonth = () => {
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1)
        return 0
      }
      return m + 1
    })
  }

  // keyboard nav left/right (month)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') handlePrevMonth()
      if (e.key === 'ArrowRight') handleNextMonth()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleSelectDay = (day) => {
    if (!day) return
    setSelectedDateKey(day.key)
  }

  // create / update events
  const createEvent = ({
    title,
    dateKey,
    startTime = '',
    duration = '',
    color = '#ff7ab6',
    notes = '',
  }) => {
    if (!title || !dateKey) return
    const e = {
      id: 'ev' + Date.now().toString(36),
      title,
      dateKey,
      startTime,
      duration,
      color,
      notes,
      createdAt: new Date().toISOString(),
    }
    setEvents((prev) => [e, ...prev])
    // also ensure the selected day is the event day
    setSelectedDateKey(dateKey)
  }

  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const eventCountFor = (dateKey) => {
    const arr = eventsByDate.get(dateKey) || []
    return arr.length
  }

  const todayKey = getTodayKey()

  // quick create: create a task linked to event
  const addTaskFromEvent = (ev) => {
    addTask({
      title: ev.title,
      type: 'event',
      sourceId: ev.id,
      dateKey: ev.dateKey,
      notes: ev.notes || '',
    })
    alert('Task created for event.')
  }

  // small helper to format day aria label
  const dayAriaLabel = (day) => {
    if (!day) return 'Empty'
    return `${day.weekday} ${day.label}`
  }

  // day cell renderer helper
  const renderEventIndicators = (dateKey) => {
    const arr = eventsByDate.get(dateKey) || []
    if (!arr.length) return null
    const max = 3 // show up to 3 dots
    return (
      <div className="cal-event-indicators" aria-hidden>
        {arr.slice(0, max).map((ev) => (
          <span
            key={ev.id}
            className="cal-event-dot"
            style={{ background: ev.color || 'var(--accent-pink)' }}
            title={ev.title}
          />
        ))}
        {arr.length > max && (
          <span className="cal-event-more">+{arr.length - max}</span>
        )}
      </div>
    )
  }

  // quick new event form state (for right-side panel)
  const [form, setForm] = useState({
    title: '',
    startTime: '',
    duration: '',
    color: '#ff7ab6',
    notes: '',
  })

  useEffect(() => {
    // reset form when date changes
    setForm({
      title: '',
      startTime: '',
      duration: '',
      color: '#ff7ab6',
      notes: '',
    })
  }, [selectedDateKey])

  const submitForm = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      alert('Please enter an event title')
      return
    }
    createEvent({
      title: form.title.trim(),
      dateKey: selectedDateKey,
      startTime: form.startTime,
      duration: form.duration,
      color: form.color,
      notes: form.notes,
    })
    setForm({
      title: '',
      startTime: '',
      duration: '',
      color: form.color || '#ff7ab6',
      notes: '',
    })
  }

  return (
    <div className="calendar-page">
      {/* Calendar panel */}
      <Card>
        <SectionTitle
          title="Calendar"
          subtitle="See your tasks & events across the month."
        />
        <div className="calendar-header">
          <button
            className="cal-nav-btn"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            ‹
          </button>
          <div className="cal-month-label">{monthLabel}</div>
          <button
            className="cal-nav-btn"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <div className="calendar-grid" role="grid" aria-label="Month calendar">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
            <div key={w} className="calendar-weekday">
              {w}
            </div>
          ))}

          {days.map((day, idx) => {
            if (!day)
              return (
                <div key={`empty-${idx}`} className="calendar-cell empty" />
              )

            const dayTasks = (tasks || []).filter((t) => t.dateKey === day.key)
            const hasTasks = dayTasks.length > 0
            const evCount = eventCountFor(day.key)
            const isSelected = selectedDateKey === day.key
            const isToday = day.isToday

            return (
              <button
                key={day.key}
                className={
                  'calendar-cell' +
                  (isToday ? ' today' : '') +
                  (hasTasks ? ' has-tasks' : '') +
                  (isSelected ? ' selected' : '')
                }
                onClick={() => handleSelectDay(day)}
                aria-label={dayAriaLabel(day)}
                title={`${day.label} — ${evCount} events, ${dayTasks.length} tasks`}
              >
                <span className="cal-day-number">{day.dayNumber}</span>

                {/* show a small count or event indicators */}
                <div className="cal-mini-row">
                  {renderEventIndicators(day.key)}
                  {hasTasks && (
                    <div
                      className="cal-task-dot"
                      title={`${dayTasks.length} tasks`}
                    >
                      ●
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Event modal (opens when showEventModal is true) */}
      <EventModal
        open={showEventModal}
        onClose={() => setShowEventModal(false)}
        defaultDateKey={selectedDateKey}
        onCreate={(payload) => {
          // createEvent expects: { title, dateKey, startTime, duration, color, notes }
          createEvent(payload)
          // optionally: also create a Task if user selected "Task" type
          if (payload.type === 'Task') {
            addTask({
              title: payload.title,
              type: 'event',
              sourceId: 'ev-sync',
              dateKey: payload.dateKey,
              notes: payload.notes || '',
            })
          }
        }}
      />

      {/* Right side: day details and event creation */}
      <Card>
        <SectionTitle
          title="Day details"
          subtitle={
            selectedDateKey
              ? new Date(selectedDateKey).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Select a day'
          }
        />
        <div className="calendar-day-panel">
          <div className="day-events-list">
            {selectedEvents.length === 0 && (
              <p className="cal-empty">
                No events for this day. Create one below.
              </p>
            )}

            {selectedEvents.map((ev) => (
              <div key={ev.id} className="day-event-row">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div
                    className="event-color"
                    style={{ background: ev.color }}
                  />
                  <div>
                    <div className="event-title">{ev.title}</div>
                    <div className="event-meta">
                      {ev.startTime
                        ? ev.startTime +
                          (ev.duration ? ' • ' + ev.duration : '')
                        : 'All day'}{' '}
                      • {ev.notes || '—'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    className="btn-small"
                    onClick={() => addTaskFromEvent(ev)}
                  >
                    Create Task
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => deleteEvent(ev.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <button
              className="btn-primary"
              onClick={() => setShowEventModal(true)}
            >
              Add event
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                /* quick clear placeholder */
              }}
            >
              Clear
            </button>
          </div>

          <div style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-soft)',
                marginBottom: 6,
              }}
            >
              Tasks for this day
            </div>
            {selectedTasks.length === 0 && (
              <div className="cal-empty">No tasks scheduled for this day.</div>
            )}
            {selectedTasks.map((t) => (
              <label key={t.id} className="cal-task-row">
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
              </label>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
