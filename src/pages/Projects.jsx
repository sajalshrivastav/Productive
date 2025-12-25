import React from 'react'
import { useProjects } from '../hooks/useProjects'
import { useTasks } from '../hooks/useTasks'

import { Folder } from 'lucide-react'

// Hooks
import { useProjectForm } from '../hooks/useProjectForm'
import { useTaskForm } from '../hooks/useTaskForm'
import { useProjectFilters } from '../hooks/useProjectFilters'

// Components
import ProjectSidebar from '../Components/Projects/ProjectSidebar'
import ProjectHeader from '../Components/Projects/ProjectHeader'
import ProjectFilterBar from '../Components/Projects/ProjectFilterBar'
import CreateProjectModal from '../Components/Projects/CreateProjectModal'
import CreateTaskModal from '../Components/Projects/CreateTaskModal'
import KanbanColumn from '../Components/Projects/KanbanColumn'
import TaskListView from '../Components/Projects/TaskListView'

export default function Projects() {
    const { activeProject } = useProjects()
    const { tasks, toggleTask, deleteTask, updateTaskStatus } = useTasks()

    // Form Hooks
    const { showCreateModal, setShowCreateModal } = useProjectForm()
    const { showTaskModal, setShowTaskModal } = useTaskForm(activeProject)

    // Filter Logic
    const {
        filteredTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        backlogTasks,
        searchQuery, setSearchQuery,
        filterStatus, setFilterStatus,
        viewMode, setViewMode
    } = useProjectFilters(tasks, activeProject?._id)

    // Drag Handlers
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

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: '24px' }}>
            {/* Sidebar */}
            <ProjectSidebar onNewProjectClick={() => setShowCreateModal(true)} />

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {activeProject ? (
                    <>
                        <ProjectHeader
                            onAddTask={() => setShowTaskModal(true)}
                            onSettings={() => { }} // Placeholder
                            onDelete={() => { }} // Logic handled in context/sidebar usually, or add confirm modal
                        />

                        <ProjectFilterBar
                            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                            filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                            viewMode={viewMode} setViewMode={setViewMode}
                        />

                        {/* View Mode Content */}
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

            {/* Modals */}
            {showCreateModal && <CreateProjectModal onClose={() => setShowCreateModal(false)} />}
            {showTaskModal && <CreateTaskModal onClose={() => setShowTaskModal(false)} />}
        </div>
    )
}
