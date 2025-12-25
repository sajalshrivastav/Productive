import React from 'react'
import { Plus, CheckCircle, Folder } from 'lucide-react'
import { useProjects } from '../../hooks/useProjects'
import { useTasks } from '../../hooks/useTasks'
import Button from '../UI/Button'

export default function ProjectSidebar({ onNewProjectClick }) {
    const { projects, activeProject, setActiveProject } = useProjects()
    const { tasks } = useTasks()

    return (
        <div style={{
            width: '320px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Projects</h2>
                <Button
                    onClick={onNewProjectClick}
                    style={{
                        background: 'var(--gradient-primary)',
                        color: '#000',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <Plus size={16} />
                    New
                </Button>
            </div>

            {/* Project Stats Summary */}
            <div style={{
                background: 'var(--bg-surface)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid var(--border-subtle)'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 600, fontSize: '1.2rem', color: 'var(--text-main)' }}>{projects.length}</div>
                        <div style={{ color: 'var(--text-soft)' }}>Total Projects</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 600, fontSize: '1.2rem', color: '#10b981' }}>
                            {projects.filter(p => p.status === 'completed').length}
                        </div>
                        <div style={{ color: 'var(--text-soft)' }}>Completed</div>
                    </div>
                </div>
            </div>

            {/* Project List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
                {projects.map(project => {
                    const projectTaskCount = tasks.filter(t => t.project === project._id).length
                    const completedTaskCount = tasks.filter(t => t.project === project._id && t.status === 'done').length
                    const progress = projectTaskCount > 0 ? (completedTaskCount / projectTaskCount) * 100 : 0

                    return (
                        <div
                            key={project._id}
                            onClick={() => setActiveProject(project)}
                            role="button"
                            tabIndex={0}
                            style={{
                                padding: '16px',
                                borderRadius: '12px',
                                background: activeProject?._id === project._id ? 'var(--bg-surface)' : 'transparent',
                                border: `1px solid ${activeProject?._id === project._id ? project.color : 'var(--border-subtle)'}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: project.color,
                                    marginTop: '4px'
                                }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                                        {project.name}
                                    </div>
                                    {project.description && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginBottom: '8px' }}>
                                            {project.description.length > 50 ? project.description.substring(0, 50) + '...' : project.description}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-soft)' }}>
                                        <span>{projectTaskCount} tasks</span>
                                        <span>{Math.round(progress)}% complete</span>
                                        {project.priority && (
                                            <span style={{
                                                background: project.priority === 'high' ? '#ef4444' : project.priority === 'medium' ? '#f59e0b' : '#10b981',
                                                color: 'white',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem'
                                            }}>
                                                {project.priority}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {project.status === 'completed' && (
                                    <CheckCircle size={16} style={{ color: '#10b981' }} />
                                )}
                            </div>

                            {/* Progress Bar */}
                            <div style={{
                                width: '100%',
                                height: '4px',
                                background: 'var(--bg-panel)',
                                borderRadius: '2px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${progress}%`,
                                    height: '100%',
                                    background: project.color,
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>
                        </div>
                    )
                })}
                {projects.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-soft)' }}>
                        <Folder size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                        <p>No projects yet</p>
                        <p style={{ fontSize: '0.85rem' }}>Create one to get started</p>
                    </div>
                )}
            </div>
        </div>
    )
}
