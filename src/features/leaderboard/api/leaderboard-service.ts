import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface LeaderboardEntry {
    userId: string;
    fullName: string;
    avatar?: string | null;
    level: number;
    xp: number;          // The primary "points" metric
    wins: number;
    totalGames: number;
    winRate?: number;
    rank: number;
}

export interface LeaderboardStats {
    totalPlayers: number;
}

/** Paginated response from /api/v1/leaderboard */
interface LeaderboardApiData {
    leaderboard: Array<{
        rank: number;
        userId: string;
        fullName: string;
        avatar: string | null;
        xp: number;
        level: number;
        wins: number;
        totalGames: number;
    }>;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
    };
}

export const leaderboardService = {
    /**
     * GET /api/v1/leaderboard
     * Uses the proper scorecard-based leaderboard endpoint that returns
     * userId, xp, level, wins, totalGames with correct pagination.
     */
    getLeaderboard: async (params?: { page?: number; limit?: number; period?: 'daily' | 'weekly' | 'monthly' | 'all' }): Promise<LeaderboardEntry[]> => {
        try {
            const response = await apiClient.get<ApiResponse<LeaderboardApiData>>(ENDPOINTS.LEADERBOARD.LIST, {
                params: {
                    limit: params?.limit || 50,
                    page: params?.page || 1,
                    period: params?.period || 'all',
                },
            });

            const raw = response.data.data;

            // /api/v1/leaderboard returns { leaderboard: [...], pagination: {...} }
            // /api/v1/users/leaderboard returns a plain array — handle both shapes gracefully
            const entries = Array.isArray(raw)
                ? raw  // old endpoint fallback
                : raw?.leaderboard ?? [];

            return entries.map((entry: any, idx: number) => ({
                userId: (entry.userId || entry._id || '').toString(),
                fullName: entry.fullName || '',
                avatar: entry.avatar || null,
                level: entry.level ?? 1,
                xp: entry.xp ?? 0,
                wins: entry.wins ?? 0,
                totalGames: entry.totalGames ?? 0,
                winRate: entry.winRate ?? 0,
                rank: entry.rank ?? idx + 1,
            }));
        } catch (error) {
            console.error('[LeaderboardService] Error fetching leaderboard:', error);
            return [];
        }
    },

    getStats: async (): Promise<LeaderboardStats> => {
        const response = await apiClient.get<ApiResponse<LeaderboardStats>>(ENDPOINTS.LEADERBOARD.STATS);
        return response.data.data;
    }
};
