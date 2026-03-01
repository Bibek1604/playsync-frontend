import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface Scorecard {
    userId: string;
    points: number;
    rank: number;
    gamesPlayed: number;
    winRate: number;
    updatedAt: string;
}

export const scorecardService = {
    getMyScorecard: async (): Promise<Scorecard> => {
        const response = await apiClient.get<ApiResponse<Scorecard>>(ENDPOINTS.SCORECARD.GET);
        return response.data.data;
    }
};
