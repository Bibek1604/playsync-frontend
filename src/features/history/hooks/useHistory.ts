import { useQuery } from '@tanstack/react-query';
import { historyService, ParticipationStats } from '../api/history-service';
import { Game, QueryParams } from '@/types';

export const useHistory = (params?: QueryParams) => {
    const {
        data: history,
        isLoading: isHistoryLoading,
        error: historyError
    } = useQuery({
        queryKey: ['history', params],
        queryFn: () => historyService.getMyHistory(params)
    });

    const {
        data: stats,
        isLoading: isStatsLoading,
        error: statsError
    } = useQuery({
        queryKey: ['history', 'stats'],
        queryFn: historyService.getStats
    });

    const {
        data: count,
        isLoading: isCountLoading
    } = useQuery({
        queryKey: ['history', 'count'],
        queryFn: historyService.getCount
    });

    return {
        history,
        stats,
        count,
        isLoading: isHistoryLoading || isStatsLoading || isCountLoading,
        error: historyError || statsError,
    };
};
