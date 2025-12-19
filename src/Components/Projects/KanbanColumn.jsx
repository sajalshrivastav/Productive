import React from 'react'
import { Clock, CheckCircle, Trash2 } from 'lucide-react'

export default function KanbanColumn({ title, tasks, color, status, onDrop, onDragOver, onDragStart, toggleTask, deleteTask }) {
    return (
        <div
            style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '400px'
            }}
            onDrop={(e) => onDrop(e, status)}
            onDragOver={onDragOver}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                <h3 style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--text-main)'
                }}>
                    {title}
                </h3>
                <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.85rem',
                    color: 'var(--text-soft)',
                    background: 'var(--bg-surface)',
                    padding: '2px 8px',
                    borderRadius: '12px'
                }}>
                    {tasks.length}
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
                {tasks.map(task => {
                    const taskId = task._id || task.id
                    return (
                        <div
                            key={taskId}
                            draggable
                            onDragStart={(e) => onDragStart(e, taskId)}
                            style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '12px',
                                padding: '16px',
                                cursor: 'grab',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)'
                                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)'
                                e.target.style.boxShadow = 'none'
                            }}
                        >
                            <div style={{
                                fontWeight: 600,
                                marginBottom: '8px',
                                color: 'var(--text-main)',
                                fontSize: '0.95rem'
                            }}>
                                {task.title}
                            </div>

                            {task.description && (
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--text-soft)',
                                    marginBottom: '12px',
                                    lineHeight: '1.4'
                                }}>
                                    {task.description.length > 80 ? task.description.substring(0, 80) + '...' : task.description}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {task.priority && (
                                        <span style={{
                                            background: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981',
                                            color: 'white',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            fontWeight: 600
                                        }}>
                                            {task.priority.toUpperCase()}
                                        </span>
                                    )}
                                    {task.dueDate && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--text-soft)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <Clock size={12} />
                                            {new Date(task.dueDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleTask(taskId)
                                        }}
                                        aria-label="Mark as complete"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#10b981',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            borderRadius: '4px'
                                        }}
                                        title="Mark as complete"
                                    >
                                        <CheckCircle size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteTask(taskId)
                                        }}
                                        aria-label="Delete task"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            borderRadius: '4px'
                                        }}
                                        title="Delete task"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
                {/* Empty State for Column can be added here if needed */}
            </div>
        </div>
    )
}
