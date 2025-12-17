import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import IconSelector from './IconSelector.jsx'
import { getIconComponent, getColorStyle } from '../../utils/iconHelpers.jsx'

export default function HabitCreator({ onAdd }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('Star')
  const [selectedColor, setSelectedColor] = useState('pink')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ title: name, description, icon, color: selectedColor })
    setName('')
    setDescription('')
    setIcon('Star')
    setSelectedColor('pink')
  }

  return (
    <div className="panel-card" style={{ 
        background: 'var(--bg-elevated)', borderRadius: '20px', padding: '28px',
        border: '1px solid var(--border-subtle)', position: 'sticky', top: '20px'
    }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>New Habit</h2>
        <p style={{ color: 'var(--text-soft)', fontSize: '0.85rem', marginBottom: '28px' }}>
            Build consistency. Small steps every day.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Name */}
            <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-soft)', marginBottom: '8px', display: 'block' }}>Habit Name</label>
                <input 
                    value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Morning Run"
                    style={{ 
                        width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', 
                        color: 'var(--text-main)', padding: '14px 16px', borderRadius: '12px', fontSize: '0.95rem', outline: 'none',
                        transition: 'border-color 0.2s ease'
                    }}
                />
            </div>

            {/* Icon & Color Selector */}
            <IconSelector 
                selectedIcon={icon}
                selectedColor={selectedColor}
                onIconChange={setIcon}
                onColorChange={setSelectedColor}
            />

            {/* Description */}
            <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-soft)', marginBottom: '8px', display: 'block' }}>Description (Optional)</label>
                <input 
                    value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. 5km around the park"
                    style={{ 
                        width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', 
                        color: 'var(--text-main)', padding: '14px 16px', borderRadius: '12px', fontSize: '0.85rem', outline: 'none',
                        transition: 'border-color 0.2s ease'
                    }}
                />
            </div>

            <button type="submit" style={{ 
                padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                gap: '8px', fontSize: '0.95rem', fontWeight: 600, marginTop: '8px', border: 'none', cursor: 'pointer',
                background: 'var(--gradient-primary)', color: '#000000', transition: 'all 0.2s ease'
            }}>
                Create Habit <ArrowRight size={18} />
            </button>
        </form>
    </div>
  )
}
