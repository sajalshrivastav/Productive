import React, { useState } from 'react'
import { useTasks } from '../hooks/useTasks'

import { useProjects } from '../hooks/useProjects'

import Card from '../Components/UI/Card.jsx'
import CustomSelect from '../Components/UI/CustomSelect.jsx'
import TaskPlanner from '../Components/Tasks/TaskPlanner.jsx'
import KanbanBoard from '../Components/Tasks/KanbanBoard.jsx'
import { Plus, Repeat, Trash2, Calendar, Flag, Tag, ChevronDown, ChevronUp, Archive, RotateCcw, CheckSquare, Briefcase, Heart, BookOpen, Layers, Edit2 } from 'lucide-react'

// Option Definitions
const PRIORITY_OPTIONS = [
    { value: 'P1', label: 'High', icon: '🔥', color: '#ef4444' }, // Red
    { value: 'P2', label: 'Med', icon: '⚡', color: '#f59e0b' }, // Amber
    { value: 'P3', label: 'Low', icon: '☕', color: '#10b981' }  // Green
]

const CATEGORY_OPTIONS = [
    { value: 'General', label: 'General', icon: Layers },
    { value: 'Work', label: 'Work', icon: Briefcase, color: '#3b82f6' },
    { value: 'Health', label: 'Health', icon: Heart, color: '#ec4899' },
    { value: 'Learning', label: 'Learning', icon: BookOpen, color: '#8b5cf6' }
]

const RECURRENCE_OPTIONS = [
    { value: 'none', label: 'One-off', icon: '📅' },
    { value: 'daily', label: 'Daily', icon: '🔁' },
    { value: 'weekly', label: 'Weekly', icon: '📆' },
    { value: 'monthly', label: 'Monthly', icon: '🗓️' }
]

export default function Tasks() {
    const { tasks, recurring, addTask, toggleTask, deleteTask, deleteRecurring, addSubtask, toggleSubtask, archiveTask, restoreTask, moveTask } = useTasks()
    const { projects } = useProjects() // Get projects
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [recurrence, setRecurrence] = useState('none')
    const [priority, setPriority] = useState('P2')
    const [category, setCategory] = useState('General')
    const [selectedProject, setSelectedProject] = useState('') // Project State

    const [view, setView] = useState('active') // 'active' | 'history'
    const [expandedTask, setExpandedTask] = useState(null) // ID of expanded task
    const [newSubtask, setNewSubtask] = useState('')

    // Drag State
    const [dragId, setDragId] = useState(null)

    // Edit State
    const [editingTaskId, setEditingTaskId] = useState(null)
    const [editTitle, setEditTitle] = useState('')


    const handleSaveEdit = (id) => {
        if (!editTitle.trim()) return
        updateTask(id, { title: editTitle })
        setEditingTaskId(null)
        setEditTitle('')
    }

    const handleDragStart = (e, id) => {
        setDragId(id)
        e.dataTransfer.effectAllowed = "move"
        // Transparent ghost image if needed, or default
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
    }

    const handleDrop = (e, targetId) => {
        e.preventDefault()
        if (!dragId || dragId === targetId) return

        // Move task logic
        moveTask(dragId, targetId)
        setDragId(null)
    }

    const handleAdd = () => {
        if (!newTaskTitle.trim()) return
        addTask({
            title: newTaskTitle,
            recurrence: recurrence,
            priority,
            category,
            project: selectedProject // Pass project
        })
        setNewTaskTitle('')
        setRecurrence('none')
        setPriority('P2')
        setSelectedProject('') // Reset
    }

    const handleAddSub = (taskId) => {
        if (!newSubtask.trim()) return
        addSubtask(taskId, newSubtask)
        setNewSubtask('')
    }

    // NOTE: Drag & Drop relies on the source array order.
    // We should render the tasks in the order they appear in the array (filtered).
    // If we sort them by priority first, reordering manually becomes weird (it snaps back).
    // So for "Active Tasks", we will trust the Manual Order (array order) primarily, maybe allow filter.
    // For now, removing the .sort() by priority/done to allow manual DnD.

    const activeTasks = tasks.filter(t => !t.isArchived)
    // .sort(...) <-- REMOVED to enable Manual Reordering

    const archivedTasks = tasks.filter(t => t.isArchived).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const getPriorityColor = (p) => {
        if (p === 'P1') return 'var(--danger)' // High
        if (p === 'P2') return 'var(--warning)' // Med
        return 'var(--success)' // Low (P3)
    }

    // Project Options
    const projectOptions = [
        { value: '', label: 'No Project', icon: '📂' },
        ...(projects || []).map(p => ({
            value: p._id,
            label: p.name,
            icon: p.icon || '📁',
            color: p.color
        }))
    ]

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', animation: 'fadeIn 0.5s ease-out', marginTop: '20px' }}>

            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Creation Panel */}
                {view === 'active' && (
                    <div className="panel-card">
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px' }}>Create New Task</h2>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <input
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                style={{ flex: 1, minWidth: '200px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'white' }}
                            />

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <CustomSelect
                                    value={priority}
                                    onChange={setPriority}
                                    options={PRIORITY_OPTIONS}
                                    width="110px"
                                />

                                <CustomSelect
                                    value={category}
                                    onChange={setCategory}
                                    options={CATEGORY_OPTIONS}
                                    width="130px"
                                />

                                <CustomSelect
                                    value={selectedProject}
                                    onChange={setSelectedProject}
                                    options={projectOptions}
                                    placeholder="Project"
                                    width="140px"
                                />

                                <CustomSelect
                                    value={recurrence}
                                    onChange={setRecurrence}
                                    options={RECURRENCE_OPTIONS}
                                    width="130px"
                                />

                                <button onClick={handleAdd} className="btn-gradient-green" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 16px' }}>
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Task View Tabs */}
                <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
                        <button onClick={() => setView('active')} style={{ flex: 1, padding: '16px', background: view === 'active' ? 'var(--bg-card-hover)' : 'transparent', color: view === 'active' ? 'white' : 'var(--text-muted)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>List</button>
                        <button onClick={() => setView('kanban')} style={{ flex: 1, padding: '16px', background: view === 'kanban' ? 'var(--bg-card-hover)' : 'transparent', color: view === 'kanban' ? 'white' : 'var(--text-muted)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Kanban</button>
                        <button onClick={() => setView('planner')} style={{ flex: 1, padding: '16px', background: view === 'planner' ? 'var(--bg-card-hover)' : 'transparent', color: view === 'planner' ? 'white' : 'var(--text-muted)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Time Blocking</button>
                        <button onClick={() => setView('history')} style={{ flex: 1, padding: '16px', background: view === 'history' ? 'var(--bg-card-hover)' : 'transparent', color: view === 'history' ? 'white' : 'var(--text-muted)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Archive</button>
                    </div>

                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {view === 'planner' && <TaskPlanner />}
                        {view === 'kanban' && <KanbanBoard />}

                        {view === 'active' && activeTasks.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                                No active tasks. Time to relax! 🌴
                            </div>
                        )}

                        {(view === 'active' || view === 'history') && (view === 'active' ? activeTasks : archivedTasks).map(t => {
                            const taskId = t.id || t._id
                            return (
                                <div
                                    key={taskId}
                                    className="task-item"
                                    draggable={view === 'active'}
                                    onDragStart={(e) => handleDragStart(e, taskId)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, taskId)}
                                    style={{
                                        flexDirection: 'column', alignItems: 'stretch', cursor: view === 'active' ? 'grab' : 'default',
                                        opacity: dragId === taskId ? 0.5 : 1,
                                        border: dragId === taskId ? '1px dashed var(--accent-primary)' : '1px solid var(--border-subtle)'
                                    }}
                                >

                                    {/* Main Row */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="task-checkbox" onClick={() => toggleTask(taskId)} style={{ background: t.done ? 'var(--gradient-green)' : 'transparent', borderColor: t.done ? 'transparent' : 'var(--text-secondary)', cursor: 'pointer' }}>
                                            {t.done && <CheckSquare size={14} color="black" />}
                                        </div>

                                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setExpandedTask(expandedTask === taskId ? null : taskId)}>
                                            <div style={{ fontWeight: 500, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--text-muted)' : 'var(--text-primary)' }}>{t.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                                                <span style={{ color: 'var(--accent-primary)' }}>{t.category}</span>
                                                {t.subtasks && t.subtasks.length > 0 && <span>{t.subtasks.filter(s => s.done).length}/{t.subtasks.length} subtasks</span>}
                                            </div>
                                        </div>

                                        {/* Priority Badge */}
                                        {!t.done && (
                                            <div style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, border: `1px solid ${getPriorityColor(t.priority)}`, color: getPriorityColor(t.priority) }}>
                                                {t.priority}
                                            </div>
                                        )}

                                        {/* Expand Chevron */}
                                        <button onClick={() => setExpandedTask(expandedTask === taskId ? null : taskId)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                            {expandedTask === taskId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>

                                        {/* Archive/Restore Action */}
                                        {view === 'active' ? (
                                            <button onClick={() => archiveTask(taskId)} title="Archive" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                                <Archive size={16} />
                                            </button>
                                        ) : (
                                            <button onClick={() => restoreTask(taskId)} title="Restore" style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>
                                                <RotateCcw size={16} />
                                            </button>
                                        )}

                                        {/* Edit Button */}
                                        <button onClick={(e) => { e.stopPropagation(); setEditingTaskId(taskId); setEditTitle(t.title); }} title="Edit" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                            <Edit2 size={16} />
                                        </button>

                                        {/* Delete Button */}
                                        <button onClick={(e) => { e.stopPropagation(); deleteTask(taskId); }} title="Delete" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Edit Mode Input */}
                                    {editingTaskId === taskId && (
                                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                                            <input
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                autoFocus
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(taskId)}
                                                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--accent-primary)', background: 'var(--bg-surface)', color: 'white' }}
                                            />
                                            <button onClick={() => handleSaveEdit(taskId)} style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: '6px', padding: '0 12px', color: 'black', fontWeight: 600 }}>Save</button>
                                            <button onClick={() => setEditingTaskId(null)} style={{ background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0 12px', color: 'white' }}>Cancel</button>
                                        </div>
                                    )}

                                    {/* Expanded Subtasks */}
                                    {expandedTask === taskId && (
                                        <div style={{ marginTop: '12px', paddingLeft: '34px', borderLeft: '2px solid var(--border-subtle)' }}>
                                            {t.subtasks && t.subtasks.map(s => {
                                                const subTaskId = s.id || s._id
                                                return (
                                                    <div key={subTaskId} onClick={() => toggleSubtask(taskId, subTaskId)} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                                                        <div style={{ width: 14, height: 14, border: '1px solid var(--text-muted)', borderRadius: 3, background: s.done ? 'var(--text-muted)' : 'transparent' }}></div>
                                                        <div style={{ fontSize: '0.9rem', color: s.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: s.done ? 'line-through' : 'none' }}>{s.title}</div>
                                                    </div>
                                                )
                                            })}

                                            {view === 'active' && (
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                    <input
                                                        value={newSubtask}
                                                        onChange={(e) => setNewSubtask(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSub(taskId)}
                                                        placeholder="Add subtask..."
                                                        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-subtle)', padding: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)', width: '100%' }}
                                                    />
                                                    <button onClick={() => handleAddSub(taskId)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.8rem' }}>Add</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* RIGHT: Stats & Recurring */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="panel-card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Status</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Active</span>
                        <span style={{ fontWeight: 700 }}>{activeTasks.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Archived</span>
                        <span style={{ fontWeight: 700 }}>{archivedTasks.length}</span>
                    </div>
                </div>

                <div className="panel-card" style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Repeat size={18} color="#e879f9" /> Recurring
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {recurring.map(r => (
                            <div key={r.id} style={{ fontSize: '0.9rem', padding: '8px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{r.title}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{r.frequency}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
