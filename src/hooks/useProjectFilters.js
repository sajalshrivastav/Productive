import { useState, useMemo } from 'react'

export function useProjectFilters(tasks, activeProjectId) {
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('kanban')

    const filteredTasks = useMemo(() => {
        if (!activeProjectId) return []

        return tasks
            .filter(t => t.project === activeProjectId)
            .filter(task => {
                const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
                const matchesStatus = filterStatus === 'all' || task.status === filterStatus
                return matchesSearch && matchesStatus
            })
    }, [tasks, activeProjectId, searchQuery, filterStatus])

    const todoTasks = filteredTasks.filter(t => t.status === 'todo')
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress')
    const doneTasks = filteredTasks.filter(t => t.status === 'done')
    const backlogTasks = filteredTasks.filter(t => t.status === 'backlog')

    return {
        filterStatus, setFilterStatus,
        searchQuery, setSearchQuery,
        viewMode, setViewMode,
        filteredTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        backlogTasks
    }
}
