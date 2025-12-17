import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const ProjectContext = createContext()

export function useProjects() {
    return useContext(ProjectContext)
}

const STORAGE_KEY = 'cb-projects'

export function ProjectProvider({ children }) {
    const [projects, setProjects] = useState([])
    const [activeProject, setActiveProject] = useState(null)
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()

    // Load projects from backend or localStorage
    useEffect(() => {
        const fetchProjects = async () => {
            if (user) {
                setLoading(true)
                try {
                    const { data } = await api.get('/projects')
                    setProjects(data)
                    // Set first active project as default
                    const active = data.find(p => p.status === 'active')
                    if (active) setActiveProject(active)
                } catch (error) {
                    console.error('Failed to fetch projects', error)
                } finally {
                    setLoading(false)
                }
            } else {
                // Load from localStorage
                try {
                    const stored = localStorage.getItem(STORAGE_KEY)
                    if (stored) {
                        const parsedProjects = JSON.parse(stored)
                        setProjects(parsedProjects)
                        const active = parsedProjects.find(p => p.status === 'active')
                        if (active) setActiveProject(active)
                    }
                } catch (error) {
                    console.error('Failed to load projects from localStorage', error)
                }
            }
        }
        fetchProjects()
    }, [user])

    // Save to localStorage when not authenticated
    useEffect(() => {
        if (!user && projects.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
        }
    }, [projects, user])

    const createProject = async (projectData) => {
        if (user) {
            try {
                const { data } = await api.post('/projects', projectData)
                setProjects(prev => [data, ...prev])
                return { success: true, project: data }
            } catch (error) {
                console.error('Failed to create project', error)
                return { success: false, error: error.response?.data?.message }
            }
        } else {
            // Local storage fallback
            const newProject = {
                _id: 'proj_' + Date.now(),
                ...projectData,
                createdAt: new Date().toISOString()
            }
            setProjects(prev => [newProject, ...prev])
            return { success: true, project: newProject }
        }
    }

    const updateProject = async (id, updates) => {
        // Optimistic update
        setProjects(prev => prev.map(p => p._id === id ? { ...p, ...updates } : p))
        if (activeProject?._id === id) {
            setActiveProject(prev => ({ ...prev, ...updates }))
        }

        if (user) {
            try {
                await api.put(`/projects/${id}`, updates)
            } catch (error) {
                console.error('Failed to update project', error)
                // Revert on error - refetch
                const { data } = await api.get('/projects')
                setProjects(data)
            }
        }
    }

    const deleteProject = async (id) => {
        // Optimistic delete
        setProjects(prev => prev.filter(p => p._id !== id))
        if (activeProject?._id === id) {
            setActiveProject(null)
        }

        if (user) {
            try {
                await api.delete(`/projects/${id}`)
            } catch (error) {
                console.error('Failed to delete project', error)
            }
        }
    }

    return (
        <ProjectContext.Provider value={{
            projects,
            activeProject,
            setActiveProject,
            loading,
            createProject,
            updateProject,
            deleteProject
        }}>
            {children}
        </ProjectContext.Provider>
    )
}
