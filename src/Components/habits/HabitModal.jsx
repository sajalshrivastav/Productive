import React, { useState } from 'react'
import { X, Sparkles, Zap, Heart, Target, Coffee, Book, Dumbbell, Bed } from 'lucide-react'
import '../../Styles/HabitModal.css'

const ICONS = [
    { name: 'Sparkles', component: Sparkles, color: '#f59e0b' },
    { name: 'Zap', component: Zap, color: '#eab308' },
    { name: 'Heart', component: Heart, color: '#ec4899' },
    { name: 'Target', component: Target, color: '#6366f1' },
    { name: 'Coffee', component: Coffee, color: '#a855f7' },
    { name: 'Book', component: Book, color: '#06b6d4' },
    { name: 'Dumbbell', component: Dumbbell, color: '#ef4444' },
    { name: 'Bed', component: Bed, color: '#8b5cf6' },
]

const COLORS = [
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Indigo', value: '#6366f1' },
]

export default function HabitModal({ isOpen, onClose, onAdd }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: 'Sparkles',
        color: '#8b5cf6'
    })
    const [activeTab, setActiveTab] = useState('icon') // 'icon' or 'color'

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.title.trim()) return

        onAdd(formData)
        // Reset form
        setFormData({
            title: '',
            description: '',
            icon: 'Sparkles',
            color: '#8b5cf6'
        })
        onClose()
    }

    if (!isOpen) return null

    const SelectedIcon = ICONS.find(i => i.name === formData.icon)?.component || Sparkles

    return (
        <div className="habit-modal-backdrop" onClick={onClose}>
            <div className="habit-modal animate-modal-pop" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="habit-modal-header">
                    <div className="habit-modal-icon-preview">
                        <SelectedIcon size={24} style={{ color: formData.color }} />
                    </div>
                    <div>
                        <h2 className="habit-modal-title">Create New Habit</h2>
                        <p className="habit-modal-subtitle">Build consistency, one day at a time</p>
                    </div>
                    <button className="habit-modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="habit-modal-form">
                    {/* Title Input */}
                    <div className="habit-form-group">
                        <label className="habit-label">Habit Name</label>
                        <input
                            type="text"
                            className="habit-input habit-input-large"
                            placeholder="e.g., Morning meditation, Read 30 pages..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>

                    {/* Description Input */}
                    <div className="habit-form-group">
                        <label className="habit-label">Description (Optional)</label>
                        <textarea
                            className="habit-textarea"
                            placeholder="Why is this habit important to you?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>

                    {/* Customization */}
                    <div className="habit-form-group">
                        <label className="habit-label">Customize</label>

                        {/* Tabs */}
                        <div className="habit-tabs">
                            <button
                                type="button"
                                className={`habit-tab ${activeTab === 'icon' ? 'active' : ''}`}
                                onClick={() => setActiveTab('icon')}
                            >
                                Choose Icon
                            </button>
                            <button
                                type="button"
                                className={`habit-tab ${activeTab === 'color' ? 'active' : ''}`}
                                onClick={() => setActiveTab('color')}
                            >
                                Choose Color
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="habit-tab-content">
                            {activeTab === 'icon' && (
                                <div className="habit-icon-grid">
                                    {ICONS.map(({ name, component: Icon }) => (
                                        <button
                                            key={name}
                                            type="button"
                                            className={`habit-icon-option ${formData.icon === name ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, icon: name })}
                                        >
                                            <Icon size={24} />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'color' && (
                                <div className="habit-color-grid">
                                    {COLORS.map(({ name, value }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            className={`habit-color-option ${formData.color === value ? 'selected' : ''}`}
                                            style={{ backgroundColor: value }}
                                            onClick={() => setFormData({ ...formData, color: value })}
                                            title={name}
                                        >
                                            {formData.color === value && (
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 16 16"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M13.5 4.5L6 12L2.5 8.5"
                                                        stroke="white"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="habit-modal-actions">
                        <button
                            type="button"
                            className="habit-button habit-button-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="habit-button habit-button-primary"
                        >
                            <Sparkles size={18} />
                            Create Habit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
