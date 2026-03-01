import { useQuery } from '@tanstack/react-query';
import { historyService, ParticipationStats } from '../api/history-service';
import { Game, QueryParams } from '@/types';

export const useHistory = (params?: QueryParams) => {
    const {
        data: historyData,
        isLoading: isHistoryLoading,
        error: historyError
    } = useQuery({
        queryKey: ['history', params],
        queryFn: () => historyService.getMyHistory(params),
        staleTime: 30000, // Consider data fresh for 30 seconds
    });

    const {
        data: stats,
        isLoading: isStatsLoading,
        error: statsError
    } = useQuery({
        queryKey: ['history', 'stats'],
        queryFn: historyService.getStats,
        staleTime: 60000, // Stats change less frequently
    });

    const {
        data: count,
        isLoading: isCountLoading
    } = useQuery({
        queryKey: ['history', 'count'],
        queryFn: historyService.getCount,
        staleTime: 60000,
    });

    return {
        history: historyData?.history || [],
        pagination: historyData?.pagination,
        stats,
        count,
        isLoading: isHistoryLoading || isStatsLoading || isCountLoading,
        error: historyError || statsError,
    };
};

