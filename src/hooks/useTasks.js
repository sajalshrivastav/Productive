import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { socketService } from '../api/socket';
import { useEffect } from 'react';

export const useTasks = () => {
    const queryClient = useQueryClient();

    // Fetch tasks
    const { data: tasks = [], isLoading, error } = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const { data } = await api.get('/tasks');
            // Ensure dateKey is present for filtering today's tasks
            return data.map(t => ({
                ...t,
                done: t.status === 'done'
            }));
        },
    });

    // Mutations
    const createTaskMutation = useMutation({
        mutationFn: (taskData) => api.post('/tasks', {
            ...taskData,
            dateKey: taskData.dateKey || new Date().toISOString().split('T')[0]
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, updates }) => api.put(`/tasks/${id}`, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });

    const deleteTaskMutation = useMutation({
        mutationFn: (id) => api.delete(`/tasks/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });

    // Simplified handlers that use mutations
    const addTask = (details) => {
        createTaskMutation.mutate(details);
    };

    const toggleTask = (id) => {
        const task = tasks.find(t => (t.id || t._id) === id);
        if (!task) return;
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        updateTaskMutation.mutate({ id, updates: { status: newStatus } });
    };

    const archiveTask = (id) => {
        updateTaskMutation.mutate({ id, updates: { isArchived: true } });
    };

    const updateTaskStatus = (id, newStatus) => {
        updateTaskMutation.mutate({ id, updates: { status: newStatus, done: newStatus === 'done' } });
    };

    const restoreTask = (id) => {

        updateTaskMutation.mutate({ id, updates: { isArchived: false } });
    };

    const updateTask = (id, updates) => {
        updateTaskMutation.mutate({ id, updates });
    };

    const deleteTask = (id) => {
        deleteTaskMutation.mutate(id);
    };

    const addSubtask = (taskId, title) => {
        const task = tasks.find(t => (t.id || t._id) === taskId);
        if (!task) return;
        const newSubtasks = [...(task.subtasks || []), { title, done: false }];
        updateTaskMutation.mutate({ id: taskId, updates: { subtasks: newSubtasks } });
    };

    const toggleSubtask = (taskId, subTaskId) => {
        const task = tasks.find(t => (t.id || t._id) === taskId);
        if (!task) return;
        const newSubtasks = task.subtasks.map(s => {
            const currentSubId = s.id || s._id;
            if (currentSubId === subTaskId) return { ...s, done: !s.done };
            return s;
        });
        updateTaskMutation.mutate({ id: taskId, updates: { subtasks: newSubtasks } });
    };

    // Socket listeners for real-time updates
    useEffect(() => {
        const handleTasksUpdated = (payload) => {
            console.log('Real-time task update received:', payload);
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        };

        socketService.on('tasks_updated', handleTasksUpdated);

        return () => {
            // socketService.off('tasks_updated');
        };
    }, [queryClient]);

    const getTodayKey = () => new Date().toISOString().split('T')[0];
    const todayKey = getTodayKey();
    const todayTasks = tasks.filter(t => t.dateKey === todayKey && !t.isArchived);

    return {
        tasks,
        recurring: [],
        isLoading,
        error,
        addTask,
        toggleTask,
        updateTask,
        updateTaskStatus,
        deleteTask,

        addSubtask,
        toggleSubtask,
        archiveTask,
        restoreTask,
        moveTask: () => { },
        todayTasks,
        todayKey,
        todayCounts: {
            completed: todayTasks.filter(t => t.done).length,
            total: todayTasks.length
        },
        queryClient
    };
};
