import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { socketService } from '../api/socket';
import { useEffect } from 'react';

export const useEvents = () => {
    const queryClient = useQueryClient();

    const { data: events = [], isLoading, error } = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const { data } = await api.get('/events');
            return data;
        },
    });

    const createEventMutation = useMutation({
        mutationFn: (eventData) => api.post('/events', eventData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] })
    });

    const updateEventMutation = useMutation({
        mutationFn: ({ id, updates }) => api.put(`/events/${id}`, updates),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] })
    });

    const deleteEventMutation = useMutation({
        mutationFn: (id) => api.delete(`/events/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] })
    });

    useEffect(() => {
        const handleEventsUpdated = () => queryClient.invalidateQueries({ queryKey: ['events'] });
        socketService.on('events_updated', handleEventsUpdated);
        return () => { /* socketService.off('events_updated'); */ };
    }, [queryClient]);

    return {
        events,
        isLoading,
        error,
        createEvent: createEventMutation.mutate,
        updateEvent: updateEventMutation.mutate,
        deleteEvent: deleteEventMutation.mutate,
        queryClient
    };
};
