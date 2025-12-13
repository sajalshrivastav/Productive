// src/Pages/Calendar.jsx
import { useMemo, useState, useEffect, useRef } from 'react'
import { useTasks } from '../Context/TaskContext.jsx'
import EventModal from '../Components/calendar/EventModal.jsx'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react'
import '../Styles/Calendar.css'

const EVENT_STORAGE_KEY = 'cb-events-v1'

function getTodayKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Generate time slots from 6 AM to 11 PM
function generateTimeSlots() {
  const slots = []
  for (let hour = 6; hour <= 23; hour++) {
    slots.push({
      hour,
      label: `${hour === 12 ? 12 : hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`,
      time24: `${String(hour).padStart(2, '0')}:00`,
    })
  }
  return slots
}

// Get the week days starting from a given date
function getWeekDays(startDate) {
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    days.push({
      date,
      key: getTodayKey(date),
      dayNumber: date.getDate(),
      weekday: date.toLocaleDateString(undefined, { weekday: 'short' }),
      monthDay: date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
      isToday: getTodayKey(date) === getTodayKey(),
    })
  }
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

// Parse time string to get hour and minute
function parseTime(timeStr) {
  if (!timeStr) return null
  const [hour, minute] = timeStr.split(':').map(Number)
  return { hour, minute }
}

// Calculate event position and height
function calculateEventPosition(startTime, duration) {
  const parsed = parseTime(startTime)
  if (!parsed) return null

  const startMinutes = parsed.hour * 60 + parsed.minute
  const baseMinutes = 6 * 60 // 6 AM start

  // Parse duration (e.g., "60m", "1.5h", "90")
  let durationMinutes = 60 // default
  if (duration) {
    const match = duration.match(/(\d+\.?\d*)\s*(m|h)?/)
    if (match) {
      const value = parseFloat(match[1])
      const unit = match[2] || 'm'
      durationMinutes = unit === 'h' ? value * 60 : value
    }
  }

  const top = ((startMinutes - baseMinutes) / 60) * 80 // 80px per hour
  const height = (durationMinutes / 60) * 80

  return { top, height }
}

// Month View Component
function MonthView({ events, eventsByDate, onAddEvent, onDeleteEvent }) {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState(getTodayKey())

  const monthDays = useMemo(() => {
    const first = new Date(year, month, 1)
    const firstWeekday = first.getDay() // 0 (Sun) - 6 (Sat)
    
    // Adjust for Monday start if needed? The UI shows Mon-Sun.
    // If headers are Mon-Sun, then Sun should be 7? 
    // Wait, standard JS getDay() is Sun=0.
    // The rendered headers are Mon, Tue, Wed...
    // So logic: Mon=1, Tue=2... Sun=7.
    // Normalized start: (firstWeekday + 6) % 7 + 1?
    // Let's assume standard grid (Col 1 = Mon)
    // JS: Sun=0, Mon=1...
    // If Mon is col 1, then Mon(1) -> 1.
    // Sun(0) -> 7.
    // Helper: const getGridCol = (d) => d === 0 ? 7 : d;
    
    const getGridCol = (d) => d === 0 ? 7 : d
    const startCol = getGridCol(firstWeekday)

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []

    // Current month days only
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const key = getTodayKey(date)
      days.push({
        date,
        key,
        dayNumber: d,
        isToday: key === getTodayKey(),
        isOtherMonth: false,
        // Only set startCol for the very first day
        style: d === 1 ? { gridColumnStart: startCol } : {}
      })
    }

    return days
  }, [year, month])

  const monthLabel = useMemo(
    () =>
      new Date(year, month, 1).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    [year, month],
  )

  // Get upcoming events (sorted by date and time)
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    const todayKey = getTodayKey()

    return events
      .filter((e) => e.dateKey >= todayKey)
      .sort((a, b) => {
        if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey)
        if (a.startTime && b.startTime)
          return a.startTime.localeCompare(b.startTime)
        return 0
      })
      .slice(0, 10) // Show next 10 events
  }, [events])

  const handlePrev = () => {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNext = () => {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const handleDayClick = (day) => {
    setSelectedDate(day.key)
    onAddEvent(day.key)
  }

  return (
    <div className="calendar-month-split-view">
      {/* Left: Compact Calendar */}
      <div className="month-calendar-panel">
        <div className="month-calendar-header">
          <button className="month-nav-btn" onClick={handlePrev}>
            <ChevronLeft size={20} />
          </button>
          <h2 className="month-calendar-title">{monthLabel}</h2>
          <button className="month-nav-btn" onClick={handleNext}>
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="month-calendar-grid">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="month-calendar-weekday">
              {day}
            </div>
          ))}

          {monthDays.map((day, idx) => {
            const dayEvents = eventsByDate.get(day.key) || []
            const hasEvents = dayEvents.length > 0

            return (
              <button
                key={`${day.key}-${idx}`}
                className={`month-calendar-day ${day.isToday ? 'today' : ''} ${
                  selectedDate === day.key ? 'selected' : ''
                } ${hasEvents ? 'has-events' : ''}`}
                onClick={() => handleDayClick(day)}
                style={day.style}
              >
                <span className="day-num">{day.dayNumber}</span>
                {hasEvents && (
                  <div className="day-event-dots">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <span
                        key={event.id}
                        className="event-dot"
                        style={{ background: event.color }}
                      />
                    ))}
                  </div>
                )}
              </button>
            )

          })}
        </div>
      </div>

      {/* Right: Upcoming Events */}
      <div className="month-events-panel">
        <div className="month-events-header">
          <h3 className="month-events-title">Upcoming Events</h3>
          <button className="month-add-event-btn" onClick={() => onAddEvent(getTodayKey())}>
            <Plus size={18} />
            Add Event
          </button>
        </div>

        <div className="month-events-list">
          {upcomingEvents.length === 0 ? (
            <div className="month-events-empty">
              <CalendarIcon size={48} opacity={0.3} />
              <p>No upcoming events</p>
              <span>Click on any date to add an event</span>
            </div>
          ) : (
            upcomingEvents.map((event) => {
              const eventDate = new Date(event.dateKey)
              const dateLabel = eventDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })

              return (
                <div key={event.id} className="month-event-card">
                  <div
                    className="month-event-color-bar"
                    style={{ background: event.color }}
                  />
                  <div className="month-event-content">
                    <div className="month-event-header-row">
                      <h4 className="month-event-card-title">{event.title}</h4>
                      <button
                        className="month-event-card-delete"
                        onClick={() => onDeleteEvent(event.id)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="month-event-meta">
                      <span className="month-event-date">{dateLabel}</span>
                      {event.startTime && (
                        <>
                          <span className="month-event-separator">•</span>
                          <span className="month-event-time">
                            {event.startTime}
                            {event.duration && ` (${event.duration})`}
                          </span>
                        </>
                      )}
                    </div>
                    {event.notes && (
                      <p className="month-event-notes">{event.notes}</p>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const { addTask } = useTasks()
  const [viewMode, setViewMode] = useState('week') // 'week' or 'month'
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  })
  const [events, setEvents] = useState(() => loadEvents())
  const [showEventModal, setShowEventModal] = useState(false)
  const [modalDefaultDate, setModalDefaultDate] = useState(getTodayKey())
  const gridContainerRef = useRef(null)

  // load events on mount (keeps current state if already set)
  useEffect(() => {
    setEvents(loadEvents())
  }, [])

  // persist events when changed
  useEffect(() => {
    saveEvents(events)
  }, [events])

  const eventsByDate = useMemo(() => {
    const map = new Map()
    events.forEach((e) => {
      if (!map.has(e.dateKey)) map.set(e.dateKey, [])
      map.get(e.dateKey).push(e)
    })
    // sort events by startTime if present
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        if (a.startTime && b.startTime)
          return a.startTime.localeCompare(b.startTime)
        return 0
      })
    }
    return map
  }, [events])

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
  }

  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const weekDays = useMemo(
    () => getWeekDays(currentWeekStart),
    [currentWeekStart],
  )
  const timeSlots = useMemo(() => generateTimeSlots(), [])

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() - 7)
      return newDate
    })
  }

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + 7)
      return newDate
    })
  }

  const handleToday = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day
    setCurrentWeekStart(new Date(d.setDate(diff)))
  }

  const weekLabel = useMemo(() => {
    const start = weekDays[0]?.date
    const end = weekDays[6]?.date
    if (!start || !end) return ''

    const startMonth = start.toLocaleDateString(undefined, { month: 'short' })
    const endMonth = end.toLocaleDateString(undefined, { month: 'short' })
    const year = start.getFullYear()

    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${year}`
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`
  }, [weekDays])

  const handleAddEvent = (dateKey) => {
    setModalDefaultDate(dateKey)
    setShowEventModal(true)
  }

  // Get current time indicator position - updates every minute
  const [currentTimePosition, setCurrentTimePosition] = useState(() => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    if (hours < 6 || hours > 23) return null

    const totalMinutes = hours * 60 + minutes
    const baseMinutes = 6 * 60
    return ((totalMinutes - baseMinutes) / 60) * 80
  })

  // Update time indicator every minute
  useEffect(() => {
    const updateTimeIndicator = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      if (hours < 6 || hours > 23) {
        setCurrentTimePosition(null)
        return
      }

      const totalMinutes = hours * 60 + minutes
      const baseMinutes = 6 * 60
      setCurrentTimePosition(((totalMinutes - baseMinutes) / 60) * 80)
    }

    const interval = setInterval(updateTimeIndicator, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (gridContainerRef.current && currentTimePosition !== null) {
      const scrollContainer = gridContainerRef.current.parentElement
      if (scrollContainer) {
        // Scroll to current time minus some offset to center it
        const scrollTo = Math.max(0, currentTimePosition - 200)
        scrollContainer.scrollTop = scrollTo
      }
    }
  }, [currentTimePosition])

  return (
    <div className="calendar-page-new">
      {/* Header */}
      <div className="calendar-header-new">
        <div className="calendar-header-left">
          <h1 className="calendar-title">Calendar</h1>
          <div className="calendar-nav-controls">
            <button className="cal-nav-btn-new" onClick={handlePrevWeek}>
              <ChevronLeft size={18} />
            </button>
            <button className="cal-today-btn" onClick={handleToday}>
              Today
            </button>
            <button className="cal-nav-btn-new" onClick={handleNextWeek}>
              <ChevronRight size={18} />
            </button>
            <span className="calendar-week-label">{weekLabel}</span>
          </div>
        </div>
        <div className="calendar-header-actions">
          <button
            className={`cal-view-toggle ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button
            className={`cal-view-toggle ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            <CalendarIcon size={16} />
            Month
          </button>
          <button
            className="cal-add-btn"
            onClick={() => handleAddEvent(getTodayKey())}
          >
            <Plus size={18} />
            Add Event
          </button>
        </div>
      </div>

      {/* Conditional View */}
      {viewMode === 'month' ? (
        <MonthView
          events={events}
          eventsByDate={eventsByDate}
          onAddEvent={handleAddEvent}
          onDeleteEvent={deleteEvent}
        />
      ) : (
        <div className="calendar-week-view">
        {/* Time column */}
        <div className="calendar-time-column">
          <div className="calendar-time-header">GMT +07</div>
          {timeSlots.map((slot) => (
            <div key={slot.hour} className="calendar-time-slot">
              <span className="time-label">{slot.label}</span>
            </div>
          ))}
        </div>

        {/* Days columns */}
        <div className="calendar-days-grid">
          {/* Day headers */}
          <div className="calendar-day-headers">
            {weekDays.map((day) => (
              <div
                key={day.key}
                className={`calendar-day-header ${day.isToday ? 'today' : ''}`}
              >
                <div className="day-weekday">{day.weekday}</div>
                <div className={`day-number ${day.isToday ? 'today' : ''}`}>
                  {day.dayNumber}
                </div>
              </div>
            ))}
          </div>

          {/* Grid lines and events */}
          <div className="calendar-grid-container" ref={gridContainerRef}>
            {/* Background grid */}
            <div className="calendar-grid-lines">
              {timeSlots.map((slot) => (
                <div key={slot.hour} className="grid-hour-line" />
              ))}
            </div>

            {/* Current time indicator */}
            {currentTimePosition !== null && (
              <div
                className="current-time-indicator"
                style={{ top: `${currentTimePosition}px` }}
              >
                <div className="time-indicator-dot" />
                <div className="time-indicator-line" />
              </div>
            )}

            {/* Day columns with events */}
            {weekDays.map((day) => {
              const dayEvents = (eventsByDate.get(day.key) || []).filter(
                (e) => e.startTime,
              )

              return (
                <div
                  key={day.key}
                  className="calendar-day-column"
                  onClick={() => handleAddEvent(day.key)}
                >
                  {dayEvents.map((event) => {
                    const position = calculateEventPosition(
                      event.startTime,
                      event.duration,
                    )
                    if (!position) return null

                    return (
                      <div
                        key={event.id}
                        className="calendar-event-card"
                        style={{
                          top: `${position.top}px`,
                          height: `${Math.max(position.height, 40)}px`,
                          borderLeft: `3px solid ${event.color}`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                      >
                        <div className="event-card-content">
                          <div className="event-card-title">{event.title}</div>
                          <div className="event-card-time">
                            {event.startTime}
                            {event.duration && ` • ${event.duration}`}
                          </div>
                          {event.notes && (
                            <div className="event-card-notes">{event.notes}</div>
                          )}
                        </div>
                        <button
                          className="event-card-delete"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteEvent(event.id)
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      )}

      {/* Event Modal */}
      <EventModal
        open={showEventModal}
        onClose={() => setShowEventModal(false)}
        defaultDateKey={modalDefaultDate}
        onCreate={(payload) => {
          createEvent(payload)
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
    </div>
  )
}
