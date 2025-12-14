// src/pages/Calendar.jsx
import { useMemo, useState, useEffect, useRef } from 'react'
import { useTasks } from '../Context/TaskContext.jsx'
import WaveWidget from '../Components/Widgets/WaveWidget.jsx'
import EventModal from '../Components/calendar/EventModal.jsx'
import ConfirmationModal from '../Components/UI/ConfirmationModal.jsx'
import { ChevronLeft, ChevronRight, Plus, ChevronDown, Check } from 'lucide-react'
import '../Styles/Calendar.css'

const EVENT_STORAGE_KEY = 'cb-events-v1'

function getTodayKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function generateTimeSlots() {
  const slots = []
  for (let hour = 0; hour <= 23; hour++) {
    slots.push({
      hour,
      label: `${hour === 12 ? 12 : hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`,
      time24: `${String(hour).padStart(2, '0')}:00`,
    })
  }
  return slots
}

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
    return []
  }
}

const dispatchUpdate = () => {
  window.dispatchEvent(new Event('cb-events-updated'))
}

function saveEvents(events) {
  try {
    localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events))
    dispatchUpdate()
  } catch (e) {
    console.error('Failed to save events', e)
  }
}

function parseTime(timeStr) {
  if (!timeStr) return null
  const [hour, minute] = timeStr.split(':').map(Number)
  return { hour, minute }
}

function calculateEventPosition(startTime, duration) {
  const parsed = parseTime(startTime)
  if (!parsed) return null
  const startMinutes = parsed.hour * 60 + parsed.minute
  const top = (startMinutes / 60) * 80

  let durationMinutes = 60
  if (duration) {
    const match = duration.match(/(\d+\.?\d*)\s*(m|h)?/)
    if (match) {
      const value = parseFloat(match[1])
      const unit = match[2] || 'm'
      durationMinutes = unit === 'h' ? value * 60 : value
    }
  }
  const height = (durationMinutes / 60) * 80
  return { top, height }
}

// --- WIDGETS ---

function MiniCalendarWidget({ selectedDateKey, onSelectDate }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const days = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1)
    const startingDay = firstDayOfMonth.getDay()
    const startOffset = startingDay === 0 ? 6 : startingDay - 1
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const prevMonthDays = []
    const prevMonthLastDate = new Date(year, month, 0).getDate()
    for (let i = 0; i < startOffset; i++) {
      prevMonthDays.unshift({ day: prevMonthLastDate - i, other: true })
    }

    const currentDays = []
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i)
      currentDays.push({ day: i, key: getTodayKey(d), other: false })
    }

    const totalSlots = 42
    const nextMonthDays = []
    for (let i = 1; i <= totalSlots - (prevMonthDays.length + currentDays.length); i++) {
      nextMonthDays.push({ day: i, other: true })
    }
    return [...prevMonthDays, ...currentDays, ...nextMonthDays]
  }, [year, month])

  return (
    <div className="mini-calendar-widget">
      <div className="mini-cal-header">
        <h3 className="mini-cal-title">{monthLabel}</h3>
        <div className="mini-cal-nav">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="mini-cal-btn"><ChevronLeft size={16} /></button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="mini-cal-btn"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="mini-cal-grid">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <div key={d} className="mini-cal-day-label">{d}</div>)}
        {days.map((d, i) => (
          <div key={i} className={`mini-cal-day ${d.other ? 'other-month' : ''} ${d.key === getTodayKey() ? 'today' : ''}`}
            onClick={() => d.key && onSelectDate(d.key)}>
            {d.day}
          </div>
        ))}
      </div>
    </div>
  )
}

function UpcomingEventsWidget({ events }) {
  const upcoming = useMemo(() => {
    const today = getTodayKey()
    return events.filter(e => e.dateKey >= today)
      .sort((a, b) => (a.dateKey + a.startTime).localeCompare(b.dateKey + b.startTime)).slice(0, 4)
  }, [events])

  return (
    <div className="upcoming-widget">
      <div className="widget-header">
        <h3 className="widget-title">Upcoming events today</h3>
        <span className="view-all-link">View all</span>
      </div>
      <div className="upcoming-list">
        {upcoming.length === 0 && <p style={{ color: '#666', fontSize: '0.85rem' }}>No upcoming events</p>}
        {upcoming.map(e => (
          <div key={e.id} className="upcoming-item">
            <div className={`upcoming-checkbox ${false ? 'checked' : ''}`} />
            <div className="upcoming-info">
              <span className="upcoming-name">{e.title}</span>
              <span className="upcoming-time">{e.startTime} - {parseInt(e.startTime) + 1}:00</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}



// --- SUB VIEWS ---

function MonthView({ events, eventsByDate, onAddEvent }) {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const monthDays = useMemo(() => {
    const first = new Date(year, month, 1)
    const firstWeekday = first.getDay()
    const getGridCol = (d) => d === 0 ? 7 : d
    const startCol = getGridCol(firstWeekday)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const key = getTodayKey(date)
      days.push({ date, key, dayNumber: d, isToday: key === getTodayKey(), style: d === 1 ? { gridColumnStart: startCol } : {} })
    }
    return days
  }, [year, month])

  return (
    <div className="calendar-month-split-view">
      <div className="month-calendar-panel" style={{ flex: 1 }}>
        <div className="month-calendar-header">
          <button className="month-nav-btn" onClick={() => setMonth(m => m - 1)}><ChevronLeft size={20} /></button>
          <h2 className="month-calendar-title">{new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
          <button className="month-nav-btn" onClick={() => setMonth(m => m + 1)}><ChevronRight size={20} /></button>
        </div>
        <div className="month-calendar-grid">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day} className="month-calendar-weekday">{day}</div>)}
          {monthDays.map((day, idx) => {
            const dayEvents = eventsByDate.get(day.key) || []
            return (
              <button key={idx} className={`month-calendar-day ${day.isToday ? 'today' : ''}`}
                onClick={() => onAddEvent(day.key)} style={day.style}>
                <span className="day-num">{day.dayNumber}</span>
                <div className="day-event-dots">
                  {dayEvents.slice(0, 3).map((e, i) => <span key={i} className="event-dot" style={{ background: e.color }} />)}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function DayView({ date, events, onAddEvent, onDeleteEvent, onEditEvent }) {
  const timeSlots = useMemo(() => generateTimeSlots(), [])
  const dateKey = getTodayKey(date)
  const dayEvents = events.filter(e => e.dateKey === dateKey)
  const gridRef = useRef(null)
  useEffect(() => { if (gridRef.current) gridRef.current.scrollTop = 640 }, [])

  return (
    <div className="calendar-week-view">
      <div className="calendar-day-headers" style={{ gridTemplateColumns: '80px 1fr' }}>
        <div className="gmt-label">GMT +5</div>
        <div className="calendar-day-header-cell">
          <div className={`calendar-day-pill ${dateKey === getTodayKey() ? 'today' : ''}`}>
            <span className="day-weekday">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span className="day-number">{date.getDate()}</span>
          </div>
        </div>
      </div>
      <div className="calendar-grid-container" style={{ gridTemplateColumns: '80px 1fr' }} ref={gridRef}>
        <div className="calendar-time-column" style={{ gridRow: '1 / -1', gridColumn: 1 }}>
          {timeSlots.map(slot => <div key={slot.hour} className="calendar-time-slot"><span className="time-label">{slot.label}</span></div>)}
        </div>
        <div className="calendar-grid-lines" style={{ gridRow: '1 / -1', gridColumn: '2 / -1' }}>
          {timeSlots.map(slot => <div key={slot.hour} className="grid-hour-line" />)}
        </div>
        <div className="calendar-day-column" style={{ gridColumn: 2, gridRow: '1 / -1' }} onClick={() => onAddEvent(dateKey)}>
          {dayEvents.map(event => {
            const pos = calculateEventPosition(event.startTime, event.duration)
            if (!pos) return null
            return (
              <div key={event.id} className="calendar-event-card"
                style={{ top: `${pos.top}px`, height: `${Math.max(pos.height, 40)}px`, borderLeft: `3px solid ${event.color}`, left: '10px', right: '10px' }}
                onClick={(e) => { e.stopPropagation(); onEditEvent(event) }}>
                <div className="event-card-content">
                  <div className="event-card-title">{event.title}</div>
                  <div className="event-card-time">{event.startTime}</div>
                </div>
                <button className="event-card-delete" onClick={(e) => { e.stopPropagation(); onDeleteEvent(event.id) }}>×</button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// --- MAIN COMPONENT ---

export default function CalendarPage() {
  const { addTask } = useTasks()
  const [viewMode, setViewMode] = useState('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const currentWeekStart = useMemo(() => {
    const d = new Date(currentDate)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }, [currentDate])

  const [events, setEvents] = useState(() => loadEvents())
  const [showModal, setShowModal] = useState(false)
  const [modalDate, setModalDate] = useState(getTodayKey())
  const [editingEvent, setEditingEvent] = useState(null)

  // Custom Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  useEffect(() => { setEvents(loadEvents()) }, [])
  useEffect(() => { saveEvents(events) }, [events])

  const handleSaveEvent = (payload) => {
    if (!payload.title || !payload.dateKey) return
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...payload } : e))
    } else {
      const e = { id: 'ev' + Date.now().toString(36), ...payload, createdAt: new Date().toISOString() }
      setEvents(prev => [...prev, e])
      if (payload.type === 'Task') addTask({ title: payload.title, type: 'event', sourceId: 'ev-sync', dateKey: payload.dateKey, notes: payload.notes || '' })
    }
    setShowModal(false); setEditingEvent(null)
  }

  // Called when clicking the X button
  const handleDeleteRequest = (id) => {
    setItemToDelete(id)
    setShowDeleteModal(true)
  }

  // Called by ConfirmationModal
  const confirmDelete = () => {
    if (itemToDelete) {
      setEvents((prev) => prev.filter((e) => e.id !== itemToDelete))
      setItemToDelete(null)
    }
  }

  const openAddModal = (dateKey) => { setEditingEvent(null); setModalDate(dateKey); setShowModal(true) }
  const openEditModal = (event) => { setEditingEvent(event); setModalDate(event.dateKey); setShowModal(true) }

  const handlePrev = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7)
    if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1)
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }
  const handleNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7)
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1)
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart])
  const timeSlots = useMemo(() => generateTimeSlots(), [])
  const eventsByDate = useMemo(() => {
    const map = new Map()
    events.forEach((e) => { if (!map.has(e.dateKey)) map.set(e.dateKey, []); map.get(e.dateKey).push(e) })
    return map
  }, [events])

  const gridContainerRef = useRef(null)
  const [currentTimePosition, setCurrentTimePosition] = useState(null)
  useEffect(() => {
    const now = new Date()
    const hours = now.getHours()
    if (hours >= 0 && hours <= 23) {
      const mins = hours * 60 + now.getMinutes()
      const pos = ((mins - 0) / 60) * 80
      setCurrentTimePosition(pos)
      if (gridContainerRef.current) {
        requestAnimationFrame(() => {
          gridContainerRef.current.scrollTop = Math.max(0, pos - 200)
        })
      }
    }
  }, [])

  return (
    <div className="calendar-page-new">

      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
        <div className="calendar-sidebar">
          <MiniCalendarWidget selectedDateKey={getTodayKey(currentDate)} onSelectDate={(key) => setCurrentDate(new Date(key))} />
          <UpcomingEventsWidget events={events} />
        </div>

        <div className="calendar-main" style={{ flex: 1 }}>
          <div className="calendar-main-header">
            <h2 className="main-month-title">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
            <div className="calendar-nav-controls">
              <button className="cal-nav-btn-new" onClick={handlePrev}><ChevronLeft size={18} /></button>
              <button className="cal-today-btn" onClick={() => setCurrentDate(new Date())}>Today</button>
              <button className="cal-nav-btn-new" onClick={handleNext}><ChevronRight size={18} /></button>
            </div>
            <div className="calendar-header-actions">
              <div className="main-view-toggles">
                <button className={`view-toggle-btn ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>Month</button>
                <button className={`view-toggle-btn ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>Week</button>
                <button className={`view-toggle-btn ${viewMode === 'day' ? 'active' : ''}`} onClick={() => setViewMode('day')}>Day</button>
              </div>
              <button className="cal-add-btn" onClick={() => openAddModal(getTodayKey(currentDate))}><Plus size={18} /> Add Event</button>
            </div>
          </div>

          {viewMode === 'month' && <MonthView events={events} eventsByDate={eventsByDate} onAddEvent={openAddModal} />}
          {viewMode === 'day' && <DayView date={currentDate} events={events} onAddEvent={openAddModal} onDeleteEvent={handleDeleteRequest} onEditEvent={openEditModal} />}

          {viewMode === 'week' && (
            <div className="calendar-week-view" style={{ borderRadius: 0, border: 'none', boxShadow: 'none' }}>
              <div className="calendar-day-headers" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
                <div className="gmt-label">GMT +5</div>
                {weekDays.map((day) => (
                  <div key={day.key} className="calendar-day-header-cell">
                    <div className={`calendar-day-pill ${day.isToday ? 'today' : ''}`}>
                      <span className="day-weekday">{day.weekday}</span>
                      <span className="day-number">{day.dayNumber}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="calendar-grid-container" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }} ref={gridContainerRef}>
                <div className="calendar-time-column" style={{ gridRow: '1 / -1', gridColumn: 1 }}>
                  {timeSlots.map(slot => <div key={slot.hour} className="calendar-time-slot"><span className="time-label">{slot.label}</span></div>)}
                </div>
                <div className="calendar-grid-lines" style={{ gridRow: '1 / -1', gridColumn: '2 / -1' }}>
                  {timeSlots.map(slot => <div key={slot.hour} className="grid-hour-line" />)}
                </div>
                {currentTimePosition !== null && <div className="current-time-indicator" style={{ top: `${currentTimePosition}px` }}><div className="time-indicator-dot" /><div className="time-indicator-line" /></div>}

                {weekDays.map((day, idx) => {
                  const dayEvents = (eventsByDate.get(day.key) || []).filter(e => e.startTime)
                  return (
                    <div key={day.key} className="calendar-day-column" style={{ gridColumn: idx + 2, gridRow: '1 / -1' }} onClick={() => openAddModal(day.key)}>
                      {dayEvents.map(event => {
                        const pos = calculateEventPosition(event.startTime, event.duration)
                        if (!pos) return null
                        return (
                          <div key={event.id} className="calendar-event-card"
                            style={{ top: `${pos.top}px`, height: `${Math.max(pos.height, 40)}px`, borderLeft: `3px solid ${event.color}` }}
                            onClick={(e) => { e.stopPropagation(); openEditModal(event) }}>
                            <div className="event-card-content">
                              <div className="event-card-title">{event.title}</div>
                              <div className="event-card-time">{event.startTime}</div>
                            </div>
                            <button className="event-card-delete" onClick={(e) => { e.stopPropagation(); handleDeleteRequest(event.id) }}>×</button>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <EventModal open={showModal} onClose={() => setShowModal(false)} defaultDateKey={modalDate} initialData={editingEvent} onCreate={handleSaveEvent} />

      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Event?"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}
