import React, { useEffect, useRef, useState } from 'react'

/**
 * EventModal
 *
 * Props:
 * - open: boolean
 * - onClose: fn()
 * - onCreate: fn(eventPayload)
 * - defaultDateKey: "YYYY-MM-DD"
 *
 * The modal returns an object compatible with createEvent({ title, dateKey, startTime, duration, color, notes })
 */
export default function EventModal({
  open,
  onClose,
  onCreate,
  defaultDateKey,
  initialData, // New prop
}) {
  const [type, setType] = useState('Event') // Event | Task | Appointment
  const [title, setTitle] = useState('')
  const [dateKey, setDateKey] = useState(defaultDateKey || '')
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration] = useState('')
  const [color, setColor] = useState('#ff7ab6')
  const [notes, setNotes] = useState('')
  const [reminder, setReminder] = useState('30') // minutes
  const modalRef = useRef()

  useEffect(() => {
    setDateKey(defaultDateKey || '')
    if (open) {
      if (initialData) {
        // Edit Mode
        setTitle(initialData.title || '')
        setType(initialData.type || 'Event')
        setDateKey(initialData.dateKey || defaultDateKey || '')
        setStartTime(initialData.startTime || '')
        setDuration(initialData.duration || '')
        setColor(initialData.color || '#ff7ab6')
        setNotes(initialData.notes || '')
        setReminder(initialData.reminder || '30')
      } else {
        // Create Mode
        setTitle('')
        setStartTime('')
        setDuration('')
        setNotes('')
        setColor('#ff7ab6')
        setReminder('30')
        setType('Event')
      }
    }
  }, [open, defaultDateKey, initialData])

  // close on ESC
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose && onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, open])

  // simple focus trap: focus first input on open
  useEffect(() => {
    if (open) {
      modalRef.current?.querySelector('input, textarea, select')?.focus()
    }
  }, [open])

  const handleCreate = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      // small UI hint could be added
      alert('Please add a title for the event.')
      return
    }

    const payload = {
      title: title.trim(),
      dateKey,
      startTime,
      duration,
      color,
      notes,
      type,
      reminder: reminder ? Number(reminder) : null,
    }

    onCreate && onCreate(payload)
    onClose && onClose()
  }

  if (!open) return null

  return (
    <div
      className="ev-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Create event"
    >
      <div className="ev-modal" ref={modalRef}>
        <div className="ev-modal-header">
          <h3>{initialData ? 'Edit event' : 'Create a new event'}</h3>
          <button
            className="ev-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="ev-modal-body" onSubmit={handleCreate}>
          <div className="ev-row types">
            <button
              type="button"
              className={`type-pill ${type === 'Event' ? 'active' : ''}`}
              onClick={() => setType('Event')}
            >
              Event
            </button>
            <button
              type="button"
              className={`type-pill ${type === 'Task' ? 'active' : ''}`}
              onClick={() => setType('Task')}
            >
              Task
            </button>
            <button
              type="button"
              className={`type-pill ${type === 'Appointment' ? 'active' : ''}`}
              onClick={() => setType('Appointment')}
            >
              Appointment
            </button>
          </div>

          <div className="ev-row">
            <input
              className="ev-input title"
              placeholder="Write a title here"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="ev-grid">
            <div>
              <label className="ev-label">Date</label>
              <input
                type="date"
                className="ev-input"
                value={dateKey}
                onChange={(e) => setDateKey(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="ev-label">Time</label>
              <input
                type="time"
                className="ev-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div>
              <label className="ev-label">Duration</label>
              <input
                className="ev-input"
                placeholder="e.g. 60m"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div>
              <label className="ev-label">Reminder</label>
              <select
                className="ev-input"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
              >
                <option value="0">No reminder</option>
                <option value="5">5 minutes before</option>
                <option value="10">10 minutes before</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
              </select>
            </div>
          </div>

          <div className="ev-row">
            <label className="ev-label">Event color</label>
            <input
              className="ev-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <div className="ev-row">
            <label className="ev-label">Notes</label>
            <textarea
              className="ev-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add description, links, or attachments (notes only)..."
            />
          </div>

          <div className="ev-footer">
            <button type="submit" className="ev-btn ev-btn-primary">
              {initialData ? 'Save Changes' : 'Create'}
            </button>
            <button
              type="button"
              className="ev-btn ev-btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
