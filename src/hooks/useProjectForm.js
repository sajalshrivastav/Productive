import { useState } from 'react'
import { useProjects } from '../Context/ProjectContext'

export function useProjectForm() {
    const { createProject, setActiveProject } = useProjects()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [color, setColor] = useState('#6366f1')
    const [priority, setPriority] = useState('medium')
    const [deadline, setDeadline] = useState('')

    const resetForm = () => {
        setName('')
        setDescription('')
        setColor('#6366f1')
        setPriority('medium')
        setDeadline('')
        setShowCreateModal(false)
    }

    const handleSubmit = async () => {
        if (!name.trim()) return

        const result = await createProject({
            name,
            description,
            color,
            status: 'active',
            priority,
            deadline: deadline || null,
            createdAt: new Date().toISOString()
        })

        if (result.success) {
            resetForm()
            setActiveProject(result.project)
        }
    }

    return {
        showCreateModal,
        setShowCreateModal,
        name, setName,
        description, setDescription,
        color, setColor,
        priority, setPriority,
        deadline, setDeadline,
        handleSubmit,
        resetForm
    }
}
