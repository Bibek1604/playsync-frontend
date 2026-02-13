import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface LeaderboardEntry {
    userId: {
        _id: string;
        fullName: string;
        avatar?: string;
    };
    points: number;
    rank: number;
}

export interface LeaderboardStats {
    totalPlayers: number;
}

export const leaderboardService = {
    getLeaderboard: async (params?: { page?: number; limit?: number; period?: 'daily' | 'weekly' | 'monthly' | 'all-time' }): Promise<LeaderboardEntry[]> => {
        const response = await apiClient.get<ApiResponse<LeaderboardEntry[]>>(ENDPOINTS.LEADERBOARD.LIST, {
            params,
        });
        return response.data.data;
    },

    getStats: async (): Promise<LeaderboardStats> => {
        const response = await apiClient.get<ApiResponse<LeaderboardStats>>(ENDPOINTS.LEADERBOARD.STATS);
        return response.data.data;
    }
};
