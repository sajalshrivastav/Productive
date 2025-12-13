import React, { useMemo, useState } from 'react'
import HabitCreator from '../Components/habits/HabitCreator.jsx'
import { useHabits } from '../Context/HabitContext.jsx'
import { Check, Trash2, Flame, Edit2 } from 'lucide-react'

function getDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildLastDays(n = 14) {
  const out = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = getDateKey(d)
    const label = d.toLocaleDateString(undefined, { weekday: 'narrow' }) 
    out.push({ key, label, fullDate: d })
  }
  return out
}

export default function Habits() {
  const { habits, addHabit, deleteHabit, toggleDay, updateHabit } = useHabits()
  const days = useMemo(() => buildLastDays(14), [])
  const todayKey = getDateKey()

  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})

  const handleEditStart = (habit) => {
      setEditingId(habit.id)
      setEditData({ title: habit.title, description: habit.description, icon: habit.icon, color: habit.color })
  }

  const saveEdit = (id) => {
      if(!editData.title.trim()) return
      updateHabit(id, editData)
      setEditingId(null)
  }

  return (
    <div className="animate-fade-in" style={{ 
        display: 'grid', gridTemplateColumns: 'minmax(400px, 1.3fr) 1fr', gap: '40px', alignItems: 'start',
        paddingBottom: '40px'
    }}>
        {/* LEFT COLUMN: CREATOR FORM */}
        <div>
           <HabitCreator onAdd={addHabit} />
        </div>

        {/* RIGHT COLUMN: HABIT LIST */}
        <div className="panel-card" style={{ 
            background: 'var(--bg-surface)', borderRadius: '24px', padding: '32px',
            border: '1px solid var(--border-subtle)', minHeight: '600px'
        }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Flame className="text-accent" /> Your Habits
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {habits.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', border: '2px dashed var(--border-subtle)', borderRadius: '16px' }}>
                        <p>No habits tracked yet.</p>
                    </div>
                )}

                {habits.map(habit => {
                    const isCompletedToday = !!habit.history[todayKey]
                    return (
                        <div key={habit.id} className="animate-fade-in" style={{ 
                            background: 'var(--bg-panel)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-subtle)'
                        }}>
                             {editingId === habit.id ? (
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                     <div style={{ display: 'flex', gap: '12px' }}>
                                         <input 
                                            value={editData.icon} 
                                            onChange={e => setEditData({...editData, icon: e.target.value})}
                                            style={{ width: '50px', fontSize: '1.5rem', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white' }}
                                         />
                                         <div style={{ flex: 1 }}>
                                             <input 
                                                value={editData.title} 
                                                onChange={e => setEditData({...editData, title: e.target.value})}
                                                placeholder="Habit Name"
                                                style={{ width: '100%', padding: '8px', marginBottom: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white', fontWeight: 700 }}
                                             />
                                             <input 
                                                value={editData.description} 
                                                onChange={e => setEditData({...editData, description: e.target.value})}
                                                placeholder="Description"
                                                style={{ width: '100%', padding: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}
                                             />
                                         </div>
                                     </div>
                                     <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                         <button onClick={() => saveEdit(habit.id)} style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: '6px', padding: '6px 12px', color: 'black', fontWeight: 600 }}>Save</button>
                                         <button onClick={() => setEditingId(null)} style={{ background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '6px 12px', color: 'white' }}>Cancel</button>
                                     </div>
                                 </div>
                             ) : (
                                 <>
                                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                         <div style={{ display: 'flex', gap: '12px' }}>
                                             <div style={{ fontSize: '24px' }}>{habit.icon}</div>
                                             <div>
                                                 <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{habit.title}</div>
                                                 <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{habit.description}</div>
                                             </div>
                                         </div>
                                         <div style={{ display: 'flex', gap: '8px' }}>
                                             <button onClick={() => handleEditStart(habit)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit2 size={16}/></button>
                                             <button onClick={() => deleteHabit(habit.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', opacity: 0.5, cursor: 'pointer' }}><Trash2 size={16}/></button>
                                         </div>
                                     </div>

                                     <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between', marginBottom: '20px' }}>
                                         {days.map(d => {
                                             const done = habit.history[d.key]
                                             const isToday = d.key === todayKey
                                             return (
                                                 <div key={d.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                     <div 
                                                        onClick={() => toggleDay(habit.id, d.key)}
                                                        style={{ 
                                                            width: '20px', height: '24px', borderRadius: '4px', cursor: 'pointer',
                                                            background: done ? (habit.color === 'pink' ? '#ec4899' : habit.color === 'blue' ? '#3b82f6' : '#22c55e') : 'rgba(255,255,255,0.05)',
                                                            border: isToday ? '1px solid var(--text-muted)' : 'none',
                                                            transition: 'all 0.2s'
                                                        }}
                                                     />
                                                     <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{d.label}</span>
                                                 </div>
                                             )
                                         })}
                                     </div>

                                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                                         <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                             <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Flame size={14} className="text-accent" /> {habit.streak} Day Streak</span>
                                             <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> {habit.total} Total</span>
                                         </div>
                                         
                                         <button 
                                            onClick={() => toggleDay(habit.id, todayKey)}
                                            className={isCompletedToday ? "btn-secondary" : "btn-primary"}
                                            style={{ 
                                                padding: '8px 16px', borderRadius: '10px', fontWeight: 600, fontSize: '0.85rem',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                background: isCompletedToday ? 'transparent' : 'white',
                                                color: isCompletedToday ? 'var(--text-secondary)' : 'black',
                                                border: isCompletedToday ? '1px solid var(--border-subtle)' : 'none'
                                            }}
                                         >
                                             {isCompletedToday ? 'Completed' : 'Check In'}
                                         </button>
                                     </div>
                                 </>
                             )}
                        </div>
                    )
                })}
            </div>
        </div>
    </div>
  )
}
