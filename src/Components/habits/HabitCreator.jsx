import React, { useState } from 'react'
import { Plus, Check, ArrowRight, Smile } from 'lucide-react'

const COLORS = [
    { name: 'pink', to: '#ec4899', from: '#be185d' },
    { name: 'blue', to: '#60a5fa', from: '#2563eb' },
    { name: 'amber', to: '#f59e0b', from: '#d97706' },
    { name: 'green', to: '#4ade80', from: '#16a34a' },
    { name: 'emerald', to: '#34d399', from: '#059669' },
    { name: 'indigo', to: '#818cf8', from: '#4f46e5' },
]

export default function HabitCreator({ onAdd }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('✨')
  const [selectedColor, setSelectedColor] = useState('pink')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ title: name, description, icon, color: selectedColor })
    setName('')
    setDescription('')
    setIcon('✨')
    setSelectedColor('pink')
  }

  return (
    <div className="panel-card" style={{ 
        background: 'var(--bg-surface)', borderRadius: '24px', padding: '32px',
        border: '1px solid var(--border-subtle)', position: 'sticky', top: '20px'
    }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>New Habit</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '32px' }}>
            Build consistency. Small steps every day.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Name */}
            <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Habit Name</label>
                <input 
                    value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Morning Run"
                    style={{ 
                        width: '100%', background: 'var(--bg-panel)', border: 'none', 
                        color: 'white', padding: '16px', borderRadius: '12px', fontSize: '1rem', outline: 'none' 
                    }}
                />
            </div>

            {/* Icon & Color Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '16px' }}>
                <div>
                     <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Icon</label>
                     <div style={{ position: 'relative' }}>
                        <input 
                            value={icon} onChange={e => setIcon(e.target.value)}
                            maxLength={2}
                            style={{ 
                                width: '100%', background: 'var(--bg-panel)', border: 'none', textAlign: 'center',
                                color: 'white', padding: '16px', borderRadius: '12px', fontSize: '1.2rem', outline: 'none' 
                            }}
                        />
                     </div>
                </div>
                <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Color</label>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {COLORS.map(c => (
                            <button
                                type="button" key={c.name}
                                onClick={() => setSelectedColor(c.name)}
                                style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${c.to}, ${c.from})`,
                                    border: selectedColor === c.name ? '3px solid white' : 'none',
                                    flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {selectedColor === c.name && <Check size={16} color="white" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Description */}
            <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Description (Optional)</label>
                <input 
                    value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. 5km around the park"
                    style={{ 
                        width: '100%', background: 'var(--bg-panel)', border: 'none', 
                        color: 'white', padding: '16px', borderRadius: '12px', fontSize: '0.9rem', outline: 'none' 
                    }}
                />
            </div>

            <button type="submit" className="btn-gradient-green" style={{ padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700, marginTop: '8px' }}>
                Create Habit <ArrowRight size={20} />
            </button>
        </form>
    </div>
  )
}
