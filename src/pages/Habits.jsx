import React, { useMemo, useState } from 'react'
import HabitCreator from '../Components/habits/HabitCreator.jsx'
import { useHabits } from '../hooks/useHabits'
import HabitWeeklyGrid from '../Components/habits/HabitWeeklyGrid.jsx'
import HabitModal from '../Components/habits/HabitModal.jsx'

import { Check, Trash2, Edit2, Grid3x3, LayoutGrid, Plus } from 'lucide-react'
import { getIconComponent, getColorStyle, getColorValue } from '../utils/iconHelpers.jsx'


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
    const [viewMode, setViewMode] = useState('cards') // 'cards' or 'grid'
    const [showModal, setShowModal] = useState(false)

    const handleEditStart = (habit) => {

        const habitId = habit.id || habit._id
        setEditingId(habitId)
        setEditData({ title: habit.title, description: habit.description, icon: habit.icon, color: habit.color })
    }

    const saveEdit = (id) => {
        if (!editData.title.trim()) return
        updateHabit(id, editData)
        setEditingId(null)
    }

    return (
        <div className="animate-fade-in" style={{
            paddingBottom: '40px', maxWidth: '1400px', margin: '0 auto'
        }}>
            {/* Floating Create Button */}
            <button
                onClick={() => setShowModal(true)}
                style={{
                    position: 'fixed',
                    bottom: '32px',
                    right: '32px',
                    padding: '16px 24px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none',
                    borderRadius: '20px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.5)',
                    zIndex: 100,
                    transition: 'all 0.3s',
                }}
                className="create-habit-btn"
            >
                <Plus size={20} />
                Create Habit
            </button>

            {/* Habit Modal */}
            <HabitModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onAdd={addHabit}
            />

            {/* RIGHT COLUMN: HABIT LIST */}
            <div className="panel-card" style={{
                background: 'var(--bg-elevated)', borderRadius: '20px', padding: '28px',
                border: '1px solid var(--border-subtle)', minHeight: '500px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', margin: 0 }}>
                        🔥 Your Habits
                    </h2>

                    {/* View Toggle */}
                    <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                        <button
                            onClick={() => setViewMode('cards')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: viewMode === 'cards' ? 'var(--gradient-primary)' : 'transparent',
                                color: viewMode === 'cards' ? '#000' : 'var(--text-soft)',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <LayoutGrid size={16} />
                            Cards View
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: viewMode === 'grid' ? 'var(--gradient-primary)' : 'transparent',
                                color: viewMode === 'grid' ? '#000' : 'var(--text-soft)',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Grid3x3 size={16} />
                            Grid View
                        </button>
                    </div>
                </div>


                {/* Conditional View Rendering */}
                {viewMode === 'grid' ? (
                    <HabitWeeklyGrid habits={habits} toggleDay={toggleDay} />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {habits.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-soft)', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🌱</div>
                                <p style={{ fontSize: '0.9rem', margin: 0 }}>No habits yet. Create your first habit to get started!</p>
                            </div>
                        )}

                        {habits.map(habit => {
                            const habitId = habit.id || habit._id
                            const isCompletedToday = !!habit.history[todayKey]
                            return (
                                <div key={habitId} className="animate-fade-in" style={{
                                    background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-subtle)',
                                    transition: 'all 0.2s ease'
                                }}>
                                    {editingId === habitId ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div>
                                                <input
                                                    value={editData.title}
                                                    onChange={e => setEditData({ ...editData, title: e.target.value })}
                                                    placeholder="Habit Name"
                                                    style={{ width: '100%', padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white', fontWeight: 600, fontSize: '0.95rem' }}
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    value={editData.description}
                                                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                                                    placeholder="Description"
                                                    style={{ width: '100%', padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <div style={{
                                                    width: '44px', height: '44px', borderRadius: '12px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    border: '1px solid var(--border-subtle)', color: 'white',
                                                    ...getColorStyle(editData.color)
                                                }}>
                                                    {getIconComponent(editData.icon, 20)}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                                                    Icon: {editData.icon} • Color: {editData.color}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button onClick={() => saveEdit(habitId)} style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: '6px', padding: '6px 12px', color: 'black', fontWeight: 600 }}>Save</button>
                                                <button onClick={() => setEditingId(null)} style={{ background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '6px 12px', color: 'white' }}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: '44px',
                                                        height: '44px',
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '1px solid var(--border-subtle)',
                                                        color: 'white',
                                                        ...getColorStyle(habit.color)
                                                    }}>
                                                        {getIconComponent(habit.icon, 20)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '2px' }}>{habit.title}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>{habit.description}</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button onClick={() => handleEditStart(habit)} style={{ background: 'transparent', border: 'none', color: 'var(--text-soft)', cursor: 'pointer', padding: '4px', borderRadius: '6px' }} title="Edit"><Edit2 size={14} /></button>
                                                    <button onClick={() => deleteHabit(habitId)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', borderRadius: '6px' }} title="Delete"><Trash2 size={14} /></button>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'space-between', marginBottom: '24px', padding: '0 4px' }}>
                                                {days.map(d => {
                                                    const done = habit.history[d.key]
                                                    const isToday = d.key === todayKey
                                                    return (
                                                        <div key={d.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                                            <div
                                                                onClick={() => toggleDay(habitId, d.key)}
                                                                style={{
                                                                    width: '24px', height: '24px', borderRadius: '6px', cursor: 'pointer',
                                                                    background: done ? getColorValue(habit.color) : 'var(--bg-panel)',
                                                                    border: isToday ? '2px solid var(--text-main)' : '1px solid var(--border-subtle)',
                                                                    transition: 'all 0.2s ease',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                {done && <Check size={12} color="white" />}
                                                            </div>
                                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-soft)', fontWeight: '500' }}>{d.label}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
                                                <div style={{ display: 'flex', gap: '20px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-soft)' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🔥 {habit.streak} Day Streak</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✅ {habit.total} Total</span>
                                                </div>

                                                <button
                                                    onClick={() => toggleDay(habitId, todayKey)}
                                                    style={{
                                                        padding: '10px 20px', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem',
                                                        display: 'flex', alignItems: 'center', gap: '6px', border: 'none', cursor: 'pointer',
                                                        background: isCompletedToday ? 'var(--bg-panel)' : 'var(--gradient-primary)',
                                                        color: isCompletedToday ? 'var(--text-soft)' : '#000000',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    {isCompletedToday ? '✓ Completed' : 'Check In'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        })}

                    </div>
                )}
            </div>

        </div>
    )
}
