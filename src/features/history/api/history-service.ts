import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';
import { Game } from '@/types';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ParticipationStats {
    totalGames: number;
    completedGames: number;
    cancelledGames: number;
    activeGames: number;
    winRate?: number;
}

export const historyService = {
    getMyHistory: async (params?: any): Promise<Game[]> => {
        const response = await apiClient.get<ApiResponse<Game[]>>(ENDPOINTS.HISTORY.LIST, {
            params,
        });
        return response.data.data;
    },

    getStats: async (): Promise<ParticipationStats> => {
        const response = await apiClient.get<ApiResponse<ParticipationStats>>(ENDPOINTS.HISTORY.STATS);
        return response.data.data;
    },

    getCount: async (): Promise<number> => {
        const response = await apiClient.get<ApiResponse<number>>(ENDPOINTS.HISTORY.COUNT);
        return response.data.data;
    }
};
