import React, { useState, useEffect } from 'react'
import './Dashboard.css'

export default function TodayInfo() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      )
    }
    tick() // initial run
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  const now = new Date()
  const weekday = now.toLocaleDateString([], { weekday: 'short' }) // Mon
  const date = now.toLocaleDateString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="today-info-pill">
      <div className="today-info-top"></div>
      <span className="today-weekday">{weekday}</span>
      <span className="today-date">{date}</span>
      <div className="today-time">{time}</div>
    </div>
  )
}
