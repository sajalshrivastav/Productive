import { useState } from 'react'
import { useTasks } from './useTasks'


export function useTaskForm(activeProject) {
    const { addTask } = useTasks()
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState('medium')
    const [assignee, setAssignee] = useState('')
    const [dueDate, setDueDate] = useState('')

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setPriority('medium')
        setAssignee('')
        setDueDate('')
        setShowTaskModal(false)
    }

    const handleSubmit = () => {
        if (!title.trim() || !activeProject) return

        addTask({
            title,
            description,
            project: activeProject._id,
            status: 'todo',
            priority,
            assignee,
            dueDate: dueDate || null,
            createdAt: new Date().toISOString()
        })

        resetForm()
    }


    return {
        showTaskModal,
        setShowTaskModal,
        title, setTitle,
        description, setDescription,
        priority, setPriority,
        assignee, setAssignee,
        dueDate, setDueDate,
        handleSubmit,
        resetForm
    }
}
