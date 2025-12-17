import React from 'react'
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react'

export default function ProjectDashboard({ projects, tasks }) {
    // Calculate overall statistics
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'active').length
    const completedProjects = projects.filter(p => p.status === 'completed').length
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'done').length
    const overdueTasks = tasks.filter(t => {
        if (!t.dueDate) return false
        return new Date(t.dueDate) < new Date() && t.status !== 'done'
    }).length

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Get projects with upcoming deadlines
    const upcomingDeadlines = projects
        .filter(p => p.deadline && p.status !== 'completed')
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 3)

    // Get recent activity (recently created or updated projects)
    const recentActivity = projects
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 5)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Statistics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <StatCard
                    title="Total Projects"
                    value={totalProjects}
                    icon={<BarChart3 size={20} />}
                    color="#6366f1"
                />
                <StatCard
                    title="Active Projects"
                    value={activeProjects}
                    icon={<TrendingUp size={20} />}
                    color="#f59e0b"
                />
                <StatCard
                    title="Completed Projects"
                    value={completedProjects}
                    icon={<CheckCircle size={20} />}
                    color="#10b981"
                />
                <StatCard
                    title="Task Completion"
                    value={`${completionRate}%`}
                    icon={<CheckCircle size={20} />}
                    color="#8b5cf6"
                />
                <StatCard
                    title="Overdue Tasks"
                    value={overdueTasks}
                    icon={<AlertTriangle size={20} />}
                    color="#ef4444"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Upcoming Deadlines */}
                <div style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '20px'
                }}>
                    <h3 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 600, 
                        marginBottom: '16px',
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Calendar size={18} />
                        Upcoming Deadlines
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(project => {
                            const daysUntilDeadline = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                            const isOverdue = daysUntilDeadline < 0
                            const isUrgent = daysUntilDeadline <= 3 && daysUntilDeadline >= 0

                            return (
                                <div key={project._id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    background: 'var(--bg-surface)',
                                    borderRadius: '8px',
                                    border: `1px solid ${isOverdue ? '#ef4444' : isUrgent ? '#f59e0b' : 'var(--border-subtle)'}`
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                                            {project.name}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                                            {new Date(project.deadline).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: isOverdue ? '#ef4444' : isUrgent ? '#f59e0b' : '#10b981',
                                        color: 'white'
                                    }}>
                                        {isOverdue ? `${Math.abs(daysUntilDeadline)}d overdue` : 
                                         daysUntilDeadline === 0 ? 'Due today' :
                                         `${daysUntilDeadline}d left`}
                                    </div>
                                </div>
                            )
                        }) : (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-soft)' }}>
                                No upcoming deadlines
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '20px'
                }}>
                    <h3 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 600, 
                        marginBottom: '16px',
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Clock size={18} />
                        Recent Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {recentActivity.length > 0 ? recentActivity.map(project => {
                            const projectTasks = tasks.filter(t => t.project === project._id)
                            const completedTasks = projectTasks.filter(t => t.status === 'done')
                            const progress = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0

                            return (
                                <div key={project._id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    background: 'var(--bg-surface)',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: project.color
                                    }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                                            {project.name}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                                            {projectTasks.length} tasks • {progress}% complete
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        background: project.status === 'completed' ? '#10b981' : '#f59e0b',
                                        color: 'white'
                                    }}>
                                        {project.status}
                                    </div>
                                </div>
                            )
                        }) : (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-soft)' }}>
                                No recent activity
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, color }) {
    return (
        <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `${color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)', marginBottom: '4px' }}>
                    {title}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {value}
                </div>
            </div>
        </div>
    )
}