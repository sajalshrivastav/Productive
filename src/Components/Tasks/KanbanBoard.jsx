import React, { useState } from 'react'
import { useTasks } from '../../hooks/useTasks'

import { Briefcase, Heart, BookOpen, Layers } from 'lucide-react'

const COLUMNS = [
    { id: 'todo', title: 'To Do', color: '#a1a1aa' },
    { id: 'in-progress', title: 'In Progress', color: '#eab308' },
    { id: 'done', title: 'Done', color: '#22d3ee' }
]

export default function KanbanBoard() {
    const { todayTasks, updateTaskStatus } = useTasks()
    const [draggedTaskId, setDraggedTaskId] = useState(null)

    // Filter tasks into columns
    const getTasksByStatus = (status) => {
        return todayTasks.filter(t => {
            // Backward compat: if no status, infer from done
            const st = t.status || (t.done ? 'done' : 'todo')
            return st === status
        })
    }

    const onDragStart = (e, taskId) => {
        setDraggedTaskId(taskId)
        e.dataTransfer.effectAllowed = 'move'
    }

    const onDragOver = (e) => {
        e.preventDefault() // Allow drop
    }

    const onDrop = (e, status) => {
        e.preventDefault()
        if (draggedTaskId) {
            updateTaskStatus(draggedTaskId, status)
            setDraggedTaskId(null)
        }
    }

    const getCategoryIcon = (cat) => {
        if (cat === 'Work') return <Briefcase size={12} />
        if (cat === 'Health') return <Heart size={12} />
        if (cat === 'Learning') return <BookOpen size={12} />
        return <Layers size={12} />
    }

    const getPriorityColor = (p) => {
        if (p === 'P1') return 'var(--danger)' // High
        if (p === 'P2') return 'var(--warning)' // Med
        return 'var(--success)' // Low (P3)
    }

    return (
        <div className="animate-fade-in" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
            height: '100%', alignItems: 'start'
        }}>
            {COLUMNS.map(col => {
                const tasks = getTasksByStatus(col.id)

                return (
                    <div
                        key={col.id}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, col.id)}
                        style={{
                            background: 'var(--bg-panel)',
                            borderRadius: '16px',
                            padding: '16px',
                            border: '1px solid var(--border-subtle)',
                            minHeight: '400px',
                            display: 'flex', flexDirection: 'column', gap: '12px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                                {col.title}
                            </h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{tasks.length}</span>
                        </div>

                        {tasks.map(t => {
                            const taskId = t.id || t._id
                            return (
                                <div
                                    key={taskId}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, taskId)}
                                    style={{
                                        padding: '12px', background: 'var(--bg-surface)',
                                        borderRadius: '12px', border: '1px solid var(--border-subtle)',
                                        cursor: 'grab', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                        opacity: draggedTaskId === taskId ? 0.5 : 1
                                    }}
                                >
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '8px' }}>{t.title}</div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {getCategoryIcon(t.category)}
                                            <span>{t.category}</span>
                                        </div>
                                        {!t.done && (
                                            <div style={{
                                                fontSize: '0.65rem', fontWeight: 700,
                                                padding: '2px 6px', borderRadius: '4px',
                                                border: `1px solid ${getPriorityColor(t.priority)}`,
                                                color: getPriorityColor(t.priority)
                                            }}>
                                                {t.priority}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {tasks.length === 0 && (
                            <div style={{
                                padding: '20px', textAlign: 'center', fontSize: '0.8rem',
                                color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)', borderRadius: '12px'
                            }}>
                                Drop tasks here
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
