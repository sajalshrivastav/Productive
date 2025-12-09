import React from 'react'
import Card from '../UI/Card.jsx'
import Button from '../UI/Button.jsx'

const COLOR_CLASS = {
  pink: 'habit-pink',
  blue: 'habit-blue',
  amber: 'habit-amber',
  green: 'habit-green',
}

export default function HabitCard({
  habit,
  days,
  onToggleDay,
  onCompleteToday,
  onDelete,
}) {
  const colorClass = COLOR_CLASS[habit.color] || 'habit-pink'

  return (
    <Card className={`habit-card ${colorClass}`}>
      <div className="habit-card-header">
        <div className="habit-title-row">
          <div className="habit-icon-chip">{habit.icon || '⭐'}</div>
          <div>
            <div className="habit-name">{habit.name}</div>
            {habit.description && (
              <div className="habit-description">{habit.description}</div>
            )}
          </div>
        </div>
        <button className="habit-delete-btn" onClick={() => onDelete(habit.id)}>
          ✕
        </button>
      </div>

      {/* Grid */}
      <div className="habit-grid">
        {days.map((d) => {
          const done = !!habit.history[d.key]
          return (
            <button
              key={d.key}
              className={'habit-dot' + (done ? ' done' : '')}
              title={`${d.label} – ${done ? 'Done' : 'Missed'}`}
              onClick={() => onToggleDay(habit.id, d.key)}
            />
          )
        })}
      </div>

      {/* Footer actions */}
      <div className="habit-card-footer">
        <Button
          variant="primary"
          className="habit-complete-btn"
          onClick={() => onCompleteToday(habit.id)}
        >
          Complete today
        </Button>

        <div className="habit-stats">
          <span>Streak: {habit.streak || 0} days</span>
          <span>Total: {habit.total || 0}</span>
        </div>
      </div>
    </Card>
  )
}
