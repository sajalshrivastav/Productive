import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { socketService } from '../api/socket';
import { useEffect } from 'react';

export const useHabits = () => {
    const queryClient = useQueryClient();

    const { data: habits = [], isLoading, error } = useQuery({
        queryKey: ['habits'],
        queryFn: async () => {
            const { data } = await api.get('/habits');
            return data;
        },
    });

    const createHabitMutation = useMutation({
        mutationFn: (habitData) => api.post('/habits', habitData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] })
    });

    const updateHabitMutation = useMutation({
        mutationFn: ({ id, updates }) => api.put(`/habits/${id}`, updates),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] })
    });

    const deleteHabitMutation = useMutation({
        mutationFn: (id) => api.delete(`/habits/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] })
    });

    useEffect(() => {
        const handleHabitsUpdated = () => queryClient.invalidateQueries({ queryKey: ['habits'] });
        socketService.on('habits_updated', handleHabitsUpdated);
        return () => { /* socketService.off('habits_updated'); */ };
    }, [queryClient]);

    const toggleDay = (id, dateKey) => {
        const habit = habits.find(h => (h.id || h._id) === id);
        if (!habit) return;
        const newHistory = { ...(habit.history || {}) };
        newHistory[dateKey] = !newHistory[dateKey];
        updateHabitMutation.mutate({ id, updates: { history: newHistory } });
    };

    return {
        habits,
        isLoading,
        error,
        addHabit: createHabitMutation.mutate,
        updateHabit: updateHabitMutation.mutate,
        deleteHabit: deleteHabitMutation.mutate,
        toggleDay,
        queryClient
    };
};
