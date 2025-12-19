import React from 'react'
import { Target, CheckCircle, BarChart3, Calendar, Plus, Settings, Trash2 } from 'lucide-react'
import { useProjects } from '../../Context/ProjectContext'
import { useTasks } from '../../Context/TaskContext'
import Button from '../UI/Button'

export default function ProjectHeader({ onAddTask, onSettings, onDelete }) {
    const { activeProject } = useProjects()
    const { tasks } = useTasks()

    if (!activeProject) return null

    // Calculate Stats
    const projectTasks = tasks.filter(t => t.project === activeProject._id)
    const doneTasks = projectTasks.filter(t => t.status === 'done')
    const completionRate = projectTasks.length > 0 ? Math.round((doneTasks.length / projectTasks.length) * 100) : 0

    return (
        <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '24px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                            {activeProject.name}
                        </h1>
                        {activeProject.priority && (
                            <span style={{
                                background: activeProject.priority === 'high' ? '#ef4444' : activeProject.priority === 'medium' ? '#f59e0b' : '#10b981',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600
                            }}>
                                {activeProject.priority.toUpperCase()}
                            </span>
                        )}
                    </div>
                    {activeProject.description && (
                        <p style={{ color: 'var(--text-soft)', margin: '0 0 12px 0', fontSize: '0.95rem' }}>
                            {activeProject.description}
                        </p>
                    )}
                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: 'var(--text-soft)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Target size={14} />
                            {projectTasks.length} tasks
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={14} />
                            {doneTasks.length} completed
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <BarChart3 size={14} />
                            {completionRate}% progress
                        </span>
                        {activeProject.deadline && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={14} />
                                Due {new Date(activeProject.deadline).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        onClick={onAddTask}
                        style={{
                            background: 'var(--gradient-primary)',
                            color: '#000',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Plus size={16} />
                        Add Task
                    </Button>
                    <Button
                        onClick={onSettings}
                        style={{
                            background: 'var(--bg-surface)',
                            color: 'var(--text-soft)',
                            padding: '8px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)'
                        }}
                    >
                        <Settings size={16} />
                    </Button>
                    <Button
                        onClick={onDelete}
                        style={{
                            background: 'transparent',
                            color: '#ef4444',
                            padding: '8px',
                            borderRadius: '8px',
                            border: '1px solid #ef4444'
                        }}
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{
                width: '100%',
                height: '8px',
                background: 'var(--bg-surface)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '16px'
            }}>
                <div style={{
                    width: `${completionRate}%`,
                    height: '100%',
                    background: activeProject.color,
                    transition: 'width 0.3s ease'
                }} />
            </div>
        </div>
    )
}
