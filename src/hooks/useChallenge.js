import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { socketService } from '../api/socket';
import { useEffect, useMemo } from 'react';

// Helper to calculate days passed
const getDaysPassed = (startDate) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export const useChallenge = () => {
    const queryClient = useQueryClient();

    const { data: challenges = [], isLoading, error } = useQuery({
        queryKey: ['challenges'],
        queryFn: async () => {
            const { data } = await api.get('/challenges');
            return data;
        },
    });

    const activeChallenge = challenges.find(c => c.status === 'active') || null;

    const createChallengeMutation = useMutation({
        mutationFn: (challengeData) => api.post('/challenges', challengeData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['challenges'] })
    });

    const updateChallengeMutation = useMutation({
        mutationFn: ({ id, updates }) => api.put(`/challenges/${id}`, updates),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['challenges'] })
    });

    const deleteChallengeMutation = useMutation({
        mutationFn: (id) => api.delete(`/challenges/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['challenges'] })
    });

    useEffect(() => {
        const handleChallengesUpdated = () => queryClient.invalidateQueries({ queryKey: ['challenges'] });
        socketService.on('challenges_updated', handleChallengesUpdated);
        return () => { /* socketService.off('challenges_updated'); */ };
    }, [queryClient]);

    // Derived State
    const activeDay = useMemo(() => {
        if (!activeChallenge) return 0;
        return getDaysPassed(activeChallenge.createdAt);
    }, [activeChallenge]);

    const completedDays = useMemo(() => {
        if (!activeChallenge || !activeChallenge.history) return [];
        return Object.keys(activeChallenge.history).filter(k => activeChallenge.history[k]);
    }, [activeChallenge]);

    const toggleDay = (dateKey) => {
        if (!activeChallenge) return;

        const newHistory = { ...activeChallenge.history };
        newHistory[dateKey] = !newHistory[dateKey];

        updateChallengeMutation.mutate({
            id: activeChallenge._id || activeChallenge.id,
            updates: { history: newHistory }
        });
    };

    const giveUp = () => {
        if (activeChallenge) {
            deleteChallengeMutation.mutate(activeChallenge._id || activeChallenge.id);
        }
    };

    return {
        challenges,
        activeChallenge,
        activeDay, // 1-based day count
        completedDays,
        isLoading,
        error,
        startChallenge: createChallengeMutation.mutate,

        updateChallenge: (id, updates) => updateChallengeMutation.mutate({ id, updates }),
        deleteChallenge: deleteChallengeMutation.mutate,
        toggleDay,
        giveUp,

        queryClient
    };
};
