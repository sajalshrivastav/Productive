import React, { useState } from 'react'
import { CheckSquare, ChevronDown, ChevronUp, Archive, RotateCcw, Trash2, Plus } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'


export default function TaskItem({ task, isArchived = false, showDragHandle = false, onDragStart, onDragOver, onDrop, isDragging = false }) {
    const { toggleTask, deleteTask, archiveTask, restoreTask, addSubtask, toggleSubtask } = useTasks()
    const [expanded, setExpanded] = useState(false)
    const [newSubtask, setNewSubtask] = useState('')

    const handleAddSub = () => {
        if (!newSubtask.trim()) return
        addSubtask(task.id, newSubtask)
        setNewSubtask('')
    }

    const getPriorityColor = (p) => {
        if (p === 'P1') return 'var(--danger)'
        if (p === 'P2') return 'var(--warning)'
        return 'var(--success)'
    }

    const doneSubtasks = (task.subtasks || []).filter(s => s.done).length
    const totalSubtasks = (task.subtasks || []).length

    return (
        <div
            className="task-item"
            draggable={showDragHandle}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            style={{
                flexDirection: 'column',
                alignItems: 'stretch',
                cursor: showDragHandle ? 'grab' : 'default',
                opacity: isDragging ? 0.5 : 1,
                border: isDragging ? '1px dashed var(--accent-primary)' : '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)', // Ensure background for widget context
                marginTop: '8px'
            }}
        >
            {/* Main Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Checkbox */}
                <div
                    className="task-checkbox"
                    onClick={(e) => { e.stopPropagation(); toggleTask(task.id) }}
                    style={{
                        background: task.done ? 'var(--gradient-green)' : 'transparent',
                        borderColor: task.done ? 'transparent' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        flexShrink: 0
                    }}
                >
                    {task.done && <CheckSquare size={14} color="black" />}
                </div>

                {/* Title & Info */}
                <div style={{ flex: 1, cursor: 'pointer', minWidth: 0 }} onClick={() => setExpanded(!expanded)}>
                    <div style={{
                        fontWeight: 500,
                        textDecoration: task.done ? 'line-through' : 'none',
                        color: task.done ? 'var(--text-muted)' : 'var(--text-primary)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                        {task.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--accent-primary)' }}>{task.category || 'General'}</span>
                        {totalSubtasks > 0 && (
                            <span>
                                {doneSubtasks}/{totalSubtasks} subtasks
                            </span>
                        )}
                    </div>
                </div>

                {/* Priority Badge */}
                {!task.done && task.priority && (
                    <div style={{
                        padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700,
                        border: `1px solid ${getPriorityColor(task.priority)}`, color: getPriorityColor(task.priority),
                        flexShrink: 0
                    }}>
                        {task.priority}
                    </div>
                )}

                {/* Expand Toggle */}
                <button onClick={() => setExpanded(!expanded)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Actions */}
                {!isArchived ? (
                    <button onClick={() => archiveTask(task.id)} title="Archive" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                        <Archive size={16} />
                    </button>
                ) : (
                    <button onClick={() => restoreTask(task.id)} title="Restore" style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: 4 }}>
                        <RotateCcw size={16} />
                    </button>
                )}
            </div>

            {/* Expanded Subtasks */}
            {expanded && (
                <div style={{ marginTop: '12px', paddingLeft: '34px', borderLeft: '2px solid var(--border-subtle)' }}>
                    {(task.subtasks || []).map(s => (
                        <div key={s.id} onClick={() => toggleSubtask(task.id, s.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                            <div style={{ width: 14, height: 14, border: '1px solid var(--text-muted)', borderRadius: 3, background: s.done ? 'var(--text-muted)' : 'transparent', flexShrink: 0 }}></div>
                            <div style={{ fontSize: '0.9rem', color: s.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: s.done ? 'line-through' : 'none', wordBreak: 'break-word' }}>{s.title}</div>
                        </div>
                    ))}

                    {!isArchived && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <input
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSub()}
                                placeholder="Add subtask..."
                                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-subtle)', padding: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)', width: '100%' }}
                            />
                            <button onClick={handleAddSub} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.8rem' }}>Add</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
