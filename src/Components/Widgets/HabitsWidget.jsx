import React from 'react'
import '../../Styles/WigggleWidgets.css'
import { BookOpen, Check, Moon, Dumbbell } from 'lucide-react'
import { useHabits } from '../../Context/HabitContext.jsx'

// Helper to map icons string to components
const iconMap = {
    'Moon': Moon,
    'Dumbbell': Dumbbell,
    'Book': BookOpen
    // Fallback handled in generic render if needed
}

export default function HabitsWidget() {
    const { habits, toggleDay } = useHabits()
    
    // For demo/UI match, we'll try to find specific habits or default to the first few
    // We want a "Read 10 Mins" large card, and "Sleep early" / "Workout" small cards
    
    const todayKey = new Date().toISOString().split('T')[0]

    // Separate habits purely for visual layout if they exist
    const readingHabit = habits.find(h => h.title.toLowerCase().includes('read')) || habits[0]
    const otherHabits = habits.filter(h => h.id !== readingHabit?.id).slice(0, 2)

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {/* Left Column: Single Streak Card (Reading) */}
            {readingHabit && (
                <div className="wigggle-streak-card">
                   <div>
                       <h3 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 8px 0' }}>{readingHabit.title}</h3>
                       <p style={{ color: '#a1a1aa', margin: 0, fontSize: '1rem' }}>Streak: {Object.keys(readingHabit.history).length} days</p>
                   </div>
                   
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                       <BookOpen size={48} color="#ef4444" strokeWidth={1.5} />
                       
                       <div 
                           onClick={() => toggleDay(readingHabit.id, todayKey)}
                           style={{ 
                               width: '48px', height: '48px', borderRadius: '16px', 
                               background: '#1a1a1a', border: '1px solid #333',
                               display: 'flex', alignItems: 'center', justifyContent: 'center',
                               cursor: 'pointer',
                               color: readingHabit.history[todayKey] ? '#ef4444' : '#555'
                           }}
                        >
                           <Check size={24} />
                       </div>
                   </div>
                </div>
            )}

            {/* Right Column: List of other habits */}
            <div className="wigggle-habit-grid">
                {otherHabits.map(habit => {
                    const done = !!habit.history[todayKey]
                    return (
                        <div key={habit.id} className="wigggle-habit-card" onClick={() => toggleDay(habit.id, todayKey)}>
                             {/* Icon placeholder logic */}
                             <div className="wigggle-habit-icon" style={{ color: done ? '#eab308' : '#555' }}>
                                 {/* Just using Dumbbell/Sun as generic icons if map fails for now */}
                                 {habit.title.toLowerCase().includes('workout') ? <Dumbbell /> : <Moon />}
                             </div>
                             <div className="wigggle-habit-info">
                                 <div className="wigggle-habit-name">{habit.title}</div>
                                 <div className="wigggle-habit-streak">{Object.keys(habit.history).length} days</div>
                             </div>
                        </div>
                    )
                })}
                {/* Fallback Static Cards if no habits match, just to show UI */}
                {otherHabits.length === 0 && (
                    <>
                         <div className="wigggle-habit-card">
                             <div className="wigggle-habit-icon" style={{ color: '#eab308' }}><Moon /></div>
                             <div className="wigggle-habit-info">
                                 <div className="wigggle-habit-name">Sleep early</div>
                                 <div className="wigggle-habit-streak">13 days</div>
                             </div>
                         </div>
                         <div className="wigggle-habit-card">
                             <div className="wigggle-habit-icon" style={{ color: '#ea580c' }}><Dumbbell /></div>
                             <div className="wigggle-habit-info">
                                 <div className="wigggle-habit-name">Workout</div>
                                 <div className="wigggle-habit-streak">6 days</div>
                             </div>
                         </div>
                    </>
                )}
            </div>
        </div>
    )
}
