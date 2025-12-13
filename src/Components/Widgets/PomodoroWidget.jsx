import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, SkipForward, Settings, Briefcase, Coffee } from 'lucide-react'

export default function PomodoroWidget() {
  const [mode, setMode] = useState('focus') // 'focus' | 'break'
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) 

  const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60

  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  const toggleTimer = () => setIsActive(!isActive)
  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60)
  }

  const setFocus = () => {
      setMode('focus')
      setIsActive(false)
      setTimeLeft(25*60)
  }
  const setBreak = () => {
      setMode('break')
      setIsActive(false)
      setTimeLeft(5*60)
  }

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0')
  const seconds = (timeLeft % 60).toString().padStart(2, '0')

  // SVG Config
  const size = 180
  const center = size / 2
  const outerRadius = 80
  const innerRadius = 55
  const outerCircumference = 2 * Math.PI * outerRadius
  const progress = timeLeft / totalTime
  const outerDashoffset = outerCircumference * (1 - progress)

  // Colors
  const theme = {
      bg: '#052e16', // Deep forest green
      accent: '#4ade80', // Bright green
      accentDim: '#22c55e', 
      text: '#ffffff',
      track: '#14532d' // Darker green for track
  }

  return (
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-around', // Side by side layout
        height: '100%', 
        background: theme.bg,
        color: 'white',
        borderRadius: '16px', // Inner radius to match container
        padding: '0 20px',
        position: 'relative',
        overflow: 'hidden'
    }}>
        
        {/* Left: Rings */}
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Outer Track */}
                <circle cx={center} cy={center} r={outerRadius} fill="transparent" stroke={theme.track} strokeWidth="16" />
                {/* Outer Progress Segment */}
                <circle 
                    cx={center} cy={center} r={outerRadius} 
                    fill="transparent" 
                    stroke={theme.accentDim} 
                    strokeWidth="16" 
                    strokeDasharray={outerCircumference}
                    strokeDashoffset={outerDashoffset}
                    strokeLinecap="butt"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
                
                {/* Inner Decorative Ring */}
                <circle cx={center} cy={center} r={innerRadius} fill="transparent" stroke="#bef264" strokeWidth="6" opacity="0.8" />
            </svg>
            
            {/* Center Icon */}
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '50%', marginBottom: '4px' }}>
                    {mode === 'focus' ? <Briefcase size={20} color="#bef264" /> : <Coffee size={20} color="#bef264" />}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#bef264', fontWeight: 600 }}>{mode === 'focus' ? 'Work' : 'Break'}</span>
            </div>
        </div>

        {/* Right: Controls & Time */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            
            {/* Toggles */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button onClick={setFocus} style={{ 
                    padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                    background: mode === 'focus' ? theme.accentDim : 'transparent',
                    color: mode === 'focus' ? 'white' : '#86efac',
                    border: mode === 'focus' ? 'none' : '1px solid #14532d'
                }}>Focus</button>
                <button onClick={setBreak} style={{ 
                    padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                    background: mode === 'break' ? theme.accentDim : 'transparent',
                    color: mode === 'break' ? 'white' : '#86efac',
                    border: mode === 'break' ? 'none' : '1px solid #14532d'
                }}>Break</button>
            </div>

            {/* Time Display */}
            <div style={{ fontSize: '4.5rem', fontWeight: 700, lineHeight: 1, fontFamily: 'monospace', letterSpacing: '-2px' }}>
                {minutes}:{seconds}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                 {/* Pause/Play Main */}
                 <button onClick={toggleTimer} style={{ 
                    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '48px', height: '48px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer',
                    transition: 'background 0.2s'
                }}>
                    {isActive ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" style={{ marginLeft: '3px' }} />}
                </button>

                {/* Reset */}
                <button onClick={resetTimer} style={{ 
                    background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '48px', height: '48px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86efac', cursor: 'pointer'
                }}>
                    <RotateCcw size={18} />
                </button>

                 {/* Skip */}
                 <button style={{ 
                    background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '48px', height: '48px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86efac', cursor: 'pointer'
                }}>
                    <SkipForward size={18} />
                </button>
            </div>

            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                <Settings size={20} color="#86efac" style={{ opacity: 0.7, cursor: 'pointer' }} />
            </div>
        </div>

    </div>
  )
}
