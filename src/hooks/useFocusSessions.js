import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { socketService } from '../api/socket';
import { useEffect } from 'react';

export const useFocusSessions = () => {
    const queryClient = useQueryClient();

    const { data: sessions = [], isLoading, error } = useQuery({
        queryKey: ['focusSessions'],
        queryFn: async () => {
            const { data } = await api.get('/focus-sessions');
            return data;
        },
    });

    const createSessionMutation = useMutation({
        mutationFn: (sessionData) => api.post('/focus-sessions', sessionData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['focusSessions'] })
    });

    useEffect(() => {
        const handleSessionsUpdated = () => queryClient.invalidateQueries({ queryKey: ['focusSessions'] });
        socketService.on('focus_sessions_updated', handleSessionsUpdated);
        return () => { /* socketService.off('focus_sessions_updated'); */ };
    }, [queryClient]);

    const getSessionsByDate = (dateKey) => {
        return sessions.filter(s => {
            if (!s.startTime) return false;
            const sessionDateKey = new Date(s.startTime).toISOString().split('T')[0];
            return sessionDateKey === dateKey;
        });
    };

    const getTodaySessions = () => {
        const todayKey = new Date().toISOString().split('T')[0];
        return getSessionsByDate(todayKey);
    };

    return {
        sessions,
        isLoading,
        error,
        addSession: createSessionMutation.mutate,
        getSessionsByDate,
        getTodaySessions,
        queryClient
    };

};
