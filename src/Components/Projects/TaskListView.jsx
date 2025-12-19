import React from 'react'
import { CheckCircle, Trash2, Target } from 'lucide-react'

export default function TaskListView({ tasks, toggleTask, deleteTask, updateTaskStatus }) {
    return (
        <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '20px',
            flex: 1
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tasks.map(task => {
                    const taskId = task._id || task.id
                    return (
                        <div
                            key={taskId}
                            style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '12px',
                                padding: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <button
                                onClick={() => toggleTask(taskId)}
                                aria-label={task.status === 'done' ? "Mark as incomplete" : "Mark as complete"}
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    border: `2px solid ${task.status === 'done' ? '#10b981' : 'var(--border-subtle)'}`,
                                    background: task.status === 'done' ? '#10b981' : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0
                                }}
                            >
                                {task.status === 'done' && <CheckCircle size={12} color="white" />}
                            </button>

                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontWeight: 600,
                                    color: 'var(--text-main)',
                                    marginBottom: '4px',
                                    textDecoration: task.status === 'done' ? 'line-through' : 'none'
                                }}>
                                    {task.title}
                                </div>
                                {task.description && (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>
                                        {task.description}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                {task.priority && (
                                    <span style={{
                                        background: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}>
                                        {task.priority.toUpperCase()}
                                    </span>
                                )}

                                <select
                                    value={task.status}
                                    onChange={(e) => updateTaskStatus(taskId, e.target.value)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-subtle)',
                                        background: 'var(--bg-panel)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    <option value="backlog">Backlog</option>
                                    <option value="todo">To Do</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>

                                <button
                                    onClick={() => deleteTask(taskId)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        padding: '6px',
                                        borderRadius: '6px'
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    )
                })}

                {tasks.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: 'var(--text-soft)'
                    }}>
                        <Target size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>No tasks found</h3>
                        <p>Try adjusting your filters or create a new task</p>
                    </div>
                )}
            </div>
        </div>
    )
}
