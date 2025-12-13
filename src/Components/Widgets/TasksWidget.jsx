import React from 'react'
import '../../Styles/WigggleWidgets.css'
import { Check, List } from 'lucide-react'
import { useTasks } from '../../Context/TaskContext.jsx'

export default function TasksWidget() {
    const { tasks, toggleTask } = useTasks()
    
    // Filter for today's tasks or priority tasks
    // For this UI, we just take the first 3 active or completed
    const displayTasks = tasks.slice(0, 3) 
    const doneCount = tasks.filter(t => t.done).length
    const totalCount = tasks.length

    return (
        <div className="wigggle-card" style={{ padding: '32px' }}>
            <div className="wigggle-tasks-header">
                <List size={28} style={{ opacity: 0.8 }} />
            </div>

            <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                <div style={{ minWidth: '100px' }}>
                    <div className="wigggle-big-stat">{doneCount}/{totalCount}</div>
                    <div className="wigggle-stat-label">tasks done</div>
                </div>

                <div className="wigggle-task-list" style={{ flex: 1 }}>
                    {displayTasks.map(task => (
                        <div key={task.id} className="wigggle-task-item" onClick={() => toggleTask(task.id)}>
                            <div className={`wigggle-task-check ${task.done ? 'checked' : ''}`}>
                                {task.done && <Check size={14} strokeWidth={3} />}
                            </div>
                            <div className="wigggle-task-content">
                                <span className="wigggle-task-title" style={{ textDecoration: task.done ? 'line-through' : 'none', color: task.done ? 'var(--wigggle-text-sub)' : 'var(--wigggle-text-main)' }}>
                                    {task.title}
                                </span>
                                {/* Mock time for UI matching */}
                                <span className="wigggle-task-time">9:00 AM to 9:30 AM</span> 
                            </div>
                        </div>
                    ))}
                    {displayTasks.length === 0 && (
                        <div style={{ color: 'var(--wigggle-text-sub)', fontStyle: 'italic' }}>No tasks found</div>
                    )}
                </div>
            </div>
        </div>
    )
}
