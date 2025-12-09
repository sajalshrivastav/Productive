import React, { useEffect, useState } from 'react'

const PRESETS = [
  { id: 'focus25', label: 'Focus 25', minutes: 25 },
  { id: 'deep50', label: 'Deep 50', minutes: 50 },
  { id: 'break5', label: 'Break 5', minutes: 5 },
]

export default function FocusTimer() {
  const [presetIndex, setPresetIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(PRESETS[0].minutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsDone, setSessionsDone] = useState(0)

  const currentPreset = PRESETS[presetIndex]
  const totalSeconds = currentPreset.minutes * 60

  // When preset changes, reset timer
  useEffect(() => {
    setSecondsLeft(currentPreset.minutes * 60)
    setIsRunning(false)
  }, [presetIndex])

  // Tick logic
  useEffect(() => {
    if (!isRunning) return

    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          setIsRunning(false)
          setSessionsDone((prevDone) => prevDone + 1)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(id)
  }, [isRunning])

  const handleStartPause = () => {
    if (secondsLeft === 0) {
      // restart current preset
      setSecondsLeft(totalSeconds)
    }
    setIsRunning((prev) => !prev)
  }

  const handleReset = () => {
    setIsRunning(false)
    setSecondsLeft(totalSeconds)
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')
  const progress = 1 - secondsLeft / totalSeconds || 0 // 0..1
  const progressDeg = Math.round(progress * 360)

  return (
    <div className="focus-timer">
      {/* Preset buttons */}
      <div className="focus-timer-modes">
        {PRESETS.map((p, idx) => (
          <button
            key={p.id}
            className={
              'focus-mode-btn' + (idx === presetIndex ? ' active' : '')
            }
            onClick={() => setPresetIndex(idx)}
            disabled={isRunning}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Circle timer */}
      <div
        className="focus-timer-circle"
        style={{
          background: `conic-gradient(var(--accent-pink) ${progressDeg}deg, rgba(255,255,255,0.06) 0deg)`,
        }}
      >
        <div className="focus-timer-circle-inner">
          <div className="focus-timer-time">
            {minutes}:{seconds}
          </div>
          <div className="focus-timer-label">
            {isRunning ? 'Focus in progress' : 'Ready to start'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="focus-timer-controls">
        <button
          className="focus-control-btn primary"
          onClick={handleStartPause}
        >
          {isRunning ? 'Pause' : secondsLeft === 0 ? 'Restart' : 'Start'}
        </button>
        <button className="focus-control-btn ghost" onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className="focus-timer-footer">
        <span>Preset: {currentPreset.label}</span>
        <span>Sessions today: {sessionsDone}</span>
      </div>
    </div>
  )
}
