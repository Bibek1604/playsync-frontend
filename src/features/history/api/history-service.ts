import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';
import { Game, QueryParams } from '@/types';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ParticipationStats {
    totalGames: number;
    completedGames: number;
    cancelledGames?: number;  // not returned by backend — optional
    activeGames: number;
    winRate?: number;
    leftEarly: number;
}

interface GameHistoryResponse {
    history: Game[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
    };
}

export const historyService = {
    getMyHistory: async (params?: QueryParams): Promise<{ history: Game[], pagination: any }> => {
        const response = await apiClient.get<ApiResponse<GameHistoryResponse>>(
            ENDPOINTS.HISTORY.LIST,
            { params }
        );
        // Backend returns { data: { history: [...], pagination: {...} } }
        return response.data.data;
    },

    getStats: async (): Promise<ParticipationStats> => {
        const response = await apiClient.get<ApiResponse<ParticipationStats>>(
            ENDPOINTS.HISTORY.STATS
        );
        return response.data.data;
    },

    getCount: async (): Promise<number> => {
        const response = await apiClient.get<ApiResponse<number>>(
            ENDPOINTS.HISTORY.COUNT
        );
        // Backend now returns count directly, not wrapped in object
        return response.data.data;
    }
};

