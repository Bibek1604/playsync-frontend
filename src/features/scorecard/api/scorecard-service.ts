import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface Scorecard {
    userId?: string;
    totalPoints: number;
    xp: number;
    level: number;
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    rank?: number;
    breakdown?: {
        pointsFromWins: number;
        pointsFromGames: number;
        pointsFromXP: number;
    };
}

export const scorecardService = {
    /**
     * GET /api/v1/scorecard
     * Returns: { totalPoints, xp, level, gamesPlayed, wins, losses, winRate, rank, breakdown }
     */
    getMyScorecard: async (): Promise<Scorecard> => {
        try {
            const response = await apiClient.get<ApiResponse<Scorecard>>(ENDPOINTS.SCORECARD.GET);
            const data = response.data.data;

            if (!data) {
                console.warn('[ScorecardService] No data returned from API');
                return { totalPoints: 0, xp: 0, level: 1, gamesPlayed: 0, wins: 0, losses: 0, winRate: 0, rank: undefined };
            }

            return {
                ...data,
                // totalPoints is mapped from xp on backend — keep both consistent
                xp: data.xp ?? data.totalPoints ?? 0,
                totalPoints: data.totalPoints ?? data.xp ?? 0,
            };
        } catch (error) {
            console.error('[ScorecardService] Error fetching scorecard:', error);
            return { totalPoints: 0, xp: 0, level: 1, gamesPlayed: 0, wins: 0, losses: 0, winRate: 0, rank: undefined };
        }
    },

    /**
     * GET /api/v1/scorecard/trend
     * NOTE: This endpoint may not exist — returns empty array if 404 or error.
     */
    getTrend: async (days: number = 7): Promise<{ date: string; points: number }[]> => {
        try {
            const response = await apiClient.get<ApiResponse<{ date: string; points: number }[]>>(
                ENDPOINTS.SCORECARD.TREND,
                { params: { days } }
            );
            return Array.isArray(response.data.data) ? response.data.data : [];
        } catch (error: any) {
            // 404 means the endpoint doesn't exist yet — fail silently
            if (error?.response?.status === 404 || error?.response?.status === 405) {
                return [];
            }
            console.warn('[ScorecardService] Trend endpoint error:', error?.response?.status);
            return [];
        }
    },
};
