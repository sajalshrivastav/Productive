import { useState } from 'react'
import { useProjects } from './useProjects'

export function useProjectForm() {
    const { addProject } = useProjects()

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

    const handleSubmit = () => {
        if (!name.trim()) return

        addProject({
            name,
            description,
            color,
            status: 'active',
            priority,
            deadline: deadline || null,
            createdAt: new Date().toISOString()
        })

        resetForm()
        // Note: setActiveProject support removed for now, user will see new project in list
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
