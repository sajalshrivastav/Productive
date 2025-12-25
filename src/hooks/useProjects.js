import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { socketService } from '../api/socket';
import { useEffect } from 'react';

export const useProjects = () => {
    const queryClient = useQueryClient();

    const { data: projects = [], isLoading, error } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const { data } = await api.get('/projects');
            return data;
        },
    });

    const createProjectMutation = useMutation({
        mutationFn: (projectData) => api.post('/projects', projectData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
    });

    const updateProjectMutation = useMutation({
        mutationFn: ({ id, updates }) => api.put(`/projects/${id}`, updates),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
    });

    const deleteProjectMutation = useMutation({
        mutationFn: (id) => api.delete(`/projects/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
    });

    useEffect(() => {
        const handleProjectsUpdated = () => queryClient.invalidateQueries({ queryKey: ['projects'] });
        socketService.on('projects_updated', handleProjectsUpdated);
        return () => { /* socketService.off('projects_updated'); */ };
    }, [queryClient]);

    // Active project (first project by default or from local storage)
    const activeProject = projects.length > 0 ? projects[0] : null;

    return {
        projects,
        activeProject,
        isLoading,
        error,
        addProject: createProjectMutation.mutate,
        updateProject: (id, updates) => updateProjectMutation.mutate({ id, updates }),
        deleteProject: deleteProjectMutation.mutate,
        queryClient
    };

};
