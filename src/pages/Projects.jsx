import React, { useState } from 'react'
import { useProjects } from '../Context/ProjectContext'
import { useTasks } from '../Context/TaskContext'
import { Plus, Folder, Calendar, MoreVertical, Trash2, Edit2, Users, Target, Clock, CheckCircle, AlertCircle, BarChart3, Settings, Filter, Search, Star, Archive } from 'lucide-react'
import Button from '../Components/UI/Button'

export default function Projects() {
    const { projects, activeProject, setActiveProject, createProject, deleteProject, updateProject } = useProjects()
    const { tasks, addTask, toggleTask, deleteTask, updateTaskStatus } = useTasks()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [showProjectSettings, setShowProjectSettings] = useState(false)
    const [newProjectName, setNewProjectName] = useState('')
    const [newProjectColor, setNewProjectColor] = useState('#6366f1')
    const [newProjectDescription, setNewProjectDescription] = useState('')
    const [newProjectDeadline, setNewProjectDeadline] = useState('')
    const [newProjectPriority, setNewProjectPriority] = useState('medium')
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newTaskDescription, setNewTaskDescription] = useState('')
    const [newTaskPriority, setNewTaskPriority] = useState('medium')
    const [newTaskAssignee, setNewTaskAssignee] = useState('')
    const [newTaskDueDate, setNewTaskDueDate] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('kanban') // 'kanban', 'list', 'timeline'

    // Filter tasks by active project
    const projectTasks = tasks.filter(t => t.project === activeProject?._id)
    
    // Apply search and status filters
    const filteredTasks = projectTasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus
        return matchesSearch && matchesStatus
    })
    
    const todoTasks = filteredTasks.filter(t => t.status === 'todo')
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress')
    const doneTasks = filteredTasks.filter(t => t.status === 'done')
    const backlogTasks = filteredTasks.filter(t => t.status === 'backlog')
    
    // Project statistics
    const projectStats = {
        total: projectTasks.length,
        completed: doneTasks.length,
        inProgress: inProgressTasks.length,
        todo: todoTasks.length,
        backlog: backlogTasks.length,
        completionRate: projectTasks.length > 0 ? Math.round((doneTasks.length / projectTasks.length) * 100) : 0
    }

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return

        const result = await createProject({
            name: newProjectName,
            description: newProjectDescription,
            color: newProjectColor,
            status: 'active',
            priority: newProjectPriority,
            deadline: newProjectDeadline || null,
            createdAt: new Date().toISOString()
        })

        if (result.success) {
            setNewProjectName('')
            setNewProjectDescription('')
            setNewProjectColor('#6366f1')
            setNewProjectPriority('medium')
            setNewProjectDeadline('')
            setShowCreateModal(false)
            setActiveProject(result.project)
        }
    }

    const handleCreateTask = async () => {
        if (!newTaskTitle.trim() || !activeProject) return

        await addTask({
            title: newTaskTitle,
            description: newTaskDescription,
            project: activeProject._id,
            status: 'todo',
            priority: newTaskPriority,
            assignee: newTaskAssignee,
            dueDate: newTaskDueDate || null,
            createdAt: new Date().toISOString()
        })

        setNewTaskTitle('')
        setNewTaskDescription('')
        setNewTaskPriority('medium')
        setNewTaskAssignee('')
        setNewTaskDueDate('')
        setShowTaskModal(false)
    }

    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData('text/plain', taskId)
    }

    const handleDrop = async (e, newStatus) => {
        e.preventDefault()
        const taskId = e.dataTransfer.getData('text/plain')
        await updateTaskStatus(taskId, newStatus)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4']

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: '24px' }}>
            {/* Enhanced Sidebar */}
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
                        onClick={() => setShowCreateModal(true)}
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

            {/* Enhanced Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {activeProject ? (
                    <>
                        {/* Enhanced Project Header */}
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
                                            {projectStats.total} tasks
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <CheckCircle size={14} />
                                            {projectStats.completed} completed
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <BarChart3 size={14} />
                                            {projectStats.completionRate}% progress
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
                                        onClick={() => setShowTaskModal(true)}
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
                                        onClick={() => setShowProjectSettings(true)}
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
                                        onClick={() => deleteProject(activeProject._id)}
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
                                    width: `${projectStats.completionRate}%`,
                                    height: '100%',
                                    background: activeProject.color,
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>

                            {/* Filters and View Controls */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
                                        <input
                                            type="text"
                                            placeholder="Search tasks..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{
                                                padding: '8px 12px 8px 36px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-subtle)',
                                                background: 'var(--bg-surface)',
                                                color: 'var(--text-main)',
                                                fontSize: '0.9rem',
                                                width: '200px'
                                            }}
                                        />
                                    </div>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-subtle)',
                                            background: 'var(--bg-surface)',
                                            color: 'var(--text-main)',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="backlog">Backlog</option>
                                        <option value="todo">To Do</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => setViewMode('kanban')}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-subtle)',
                                            background: viewMode === 'kanban' ? 'var(--bg-surface)' : 'transparent',
                                            color: viewMode === 'kanban' ? 'var(--text-main)' : 'var(--text-soft)',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Kanban
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-subtle)',
                                            background: viewMode === 'list' ? 'var(--bg-surface)' : 'transparent',
                                            color: viewMode === 'list' ? 'var(--text-main)' : 'var(--text-soft)',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        List
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Content Based on View Mode */}
                        {viewMode === 'kanban' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', flex: 1, overflowY: 'auto' }}>
                                <KanbanColumn 
                                    title="Backlog" 
                                    tasks={backlogTasks} 
                                    color="#6b7280" 
                                    status="backlog"
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragStart={handleDragStart}
                                    toggleTask={toggleTask} 
                                    deleteTask={deleteTask} 
                                />
                                <KanbanColumn 
                                    title="To Do" 
                                    tasks={todoTasks} 
                                    color="#6366f1" 
                                    status="todo"
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragStart={handleDragStart}
                                    toggleTask={toggleTask} 
                                    deleteTask={deleteTask} 
                                />
                                <KanbanColumn 
                                    title="In Progress" 
                                    tasks={inProgressTasks} 
                                    color="#f59e0b" 
                                    status="in-progress"
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragStart={handleDragStart}
                                    toggleTask={toggleTask} 
                                    deleteTask={deleteTask} 
                                />
                                <KanbanColumn 
                                    title="Done" 
                                    tasks={doneTasks} 
                                    color="#10b981" 
                                    status="done"
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragStart={handleDragStart}
                                    toggleTask={toggleTask} 
                                    deleteTask={deleteTask} 
                                />
                            </div>
                        ) : (
                            <TaskListView 
                                tasks={filteredTasks} 
                                toggleTask={toggleTask} 
                                deleteTask={deleteTask}
                                updateTaskStatus={updateTaskStatus}
                            />
                        )}
                    </>
                ) : (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-soft)',
                        background: 'var(--bg-elevated)',
                        borderRadius: '16px',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <Folder size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Select a project to view tasks</h3>
                        <p>or create a new one to get started</p>
                    </div>
                )}
            </div>

            {/* Enhanced Create Project Modal */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setShowCreateModal(false)}>
                    <div style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '16px',
                        padding: '32px',
                        width: '500px',
                        maxWidth: '90vw',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginTop: 0, color: 'var(--text-main)', marginBottom: '24px' }}>Create New Project</h2>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                Project Name *
                            </label>
                            <input
                                type="text"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="Enter project name..."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-subtle)',
                                    background: 'var(--bg-surface)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem'
                                }}
                                autoFocus
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                Description
                            </label>
                            <textarea
                                value={newProjectDescription}
                                onChange={(e) => setNewProjectDescription(e.target.value)}
                                placeholder="Project description..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-subtle)',
                                    background: 'var(--bg-surface)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                    Priority
                                </label>
                                <select
                                    value={newProjectPriority}
                                    onChange={(e) => setNewProjectPriority(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-subtle)',
                                        background: 'var(--bg-surface)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    value={newProjectDeadline}
                                    onChange={(e) => setNewProjectDeadline(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-subtle)',
                                        background: 'var(--bg-surface)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                Color Theme
                            </label>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {colors.map(color => (
                                    <div
                                        key={color}
                                        onClick={() => setNewProjectColor(color)}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '8px',
                                            background: color,
                                            cursor: 'pointer',
                                            border: newProjectColor === color ? '3px solid var(--text-main)' : '1px solid var(--border-subtle)',
                                            transition: 'all 0.2s'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-subtle)',
                                    background: 'transparent',
                                    color: 'var(--text-soft)',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateProject}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'var(--gradient-primary)',
                                    color: '#000',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Task Modal */}
            {showTaskModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setShowTaskModal(false)}>
                    <div style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '16px',
                        padding: '32px',
                        width: '500px',
                        maxWidth: '90vw'
                    }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginTop: 0, color: 'var(--text-main)', marginBottom: '24px' }}>Create New Task</h2>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                Task Title *
                            </label>
                            <input
                                type="text"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                placeholder="Enter task title..."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-subtle)',
                                    background: 'var(--bg-surface)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem'
                                }}
                                autoFocus
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                Description
                            </label>
                            <textarea
                                value={newTaskDescription}
                                onChange={(e) => setNewTaskDescription(e.target.value)}
                                placeholder="Task description..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-subtle)',
                                    background: 'var(--bg-surface)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                    Priority
                                </label>
                                <select
                                    value={newTaskPriority}
                                    onChange={(e) => setNewTaskPriority(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-subtle)',
                                        background: 'var(--bg-surface)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={newTaskDueDate}
                                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-subtle)',
                                        background: 'var(--bg-surface)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowTaskModal(false)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-subtle)',
                                    background: 'transparent',
                                    color: 'var(--text-soft)',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateTask}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'var(--gradient-primary)',
                                    color: '#000',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Create Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function KanbanColumn({ title, tasks, color, status, onDrop, onDragOver, onDragStart, toggleTask, deleteTask }) {
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
                {tasks.length === 0 && (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '40px 20px', 
                        color: 'var(--text-soft)', 
                        fontSize: '0.85rem',
                        border: '2px dashed var(--border-subtle)',
                        borderRadius: '12px',
                        background: 'var(--bg-surface)'
                    }}>
                        <div style={{ marginBottom: '8px', opacity: 0.5 }}>
                            {status === 'backlog' && '📋'}
                            {status === 'todo' && '📝'}
                            {status === 'in-progress' && '⚡'}
                            {status === 'done' && '✅'}
                        </div>
                        Drop tasks here
                    </div>
                )}
            </div>
        </div>
    )
}

function TaskListView({ tasks, toggleTask, deleteTask, updateTaskStatus }) {
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
                            <div
                                onClick={() => toggleTask(taskId)}
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    border: `2px solid ${task.status === 'done' ? '#10b981' : 'var(--border-subtle)'}`,
                                    background: task.status === 'done' ? '#10b981' : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {task.status === 'done' && <CheckCircle size={12} color="white" />}
                            </div>
                            
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
