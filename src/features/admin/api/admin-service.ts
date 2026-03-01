import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminStats {
    totalUsers: number;
    totalGames: number;
    totalOnlineGames: number;
    totalOfflineGames: number;
    activeGames: number;
    totalParticipantsAcrossAllGames: number;
}

export interface AdminUser {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    profilePicture?: string;
    createdAt: string;
    lastLogin?: string;
    gamesCreated?: number;
    gamesJoined?: number;
}

export interface AdminGame {
    _id: string;
    title: string;
    category: 'ONLINE' | 'OFFLINE';
    status: 'OPEN' | 'FULL' | 'ENDED' | 'CANCELLED';
    creator: {
        _id: string;
        fullName: string;
        email: string;
        profilePicture?: string;
    } | null;
    currentPlayers: number;
    maxPlayers: number;
    endTime?: string;
    createdAt: string;
}

export interface AdminGameDetail extends AdminGame {
    description?: string;
    imageUrl?: string;
    updatedAt: string;
    participants: Array<{
        userId: { _id: string; fullName: string; profilePicture?: string };
        joinedAt: string;
        leftAt?: string;
        status: string;
    }>;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface PaginatedData<T> {
    data: T[];
    pagination: Pagination;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function qs(params: Record<string, any>) {
    return Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    );
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const adminService = {
    /** GET /api/v1/admin/stats */
    getStats: async (): Promise<AdminStats> => {
        const res = await apiClient.get<ApiResponse<AdminStats>>(ENDPOINTS.ADMIN.STATS);
        return res.data.data;
    },

    /** GET /api/v1/admin/users */
    getUsers: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: 'createdAt' | 'lastLogin' | 'fullName';
        sortOrder?: 'asc' | 'desc';
    }): Promise<{ data: AdminUser[]; pagination: Pagination }> => {
        const res = await apiClient.get<ApiResponse<PaginatedData<AdminUser>>>(
            ENDPOINTS.ADMIN.USERS,
            { params: qs({ page: 1, limit: 20, ...params }) }
        );
        return res.data.data;
    },

    /** GET /api/v1/admin/users/:userId */
    getUserById: async (userId: string): Promise<AdminUser> => {
        const res = await apiClient.get<ApiResponse<AdminUser>>(ENDPOINTS.ADMIN.USER_BY_ID(userId));
        return res.data.data;
    },

    /** GET /api/v1/admin/games */
    getGames: async (params: {
        page?: number;
        limit?: number;
        status?: string;
        sortBy?: string;
        sortOrder?: string;
    }): Promise<{ data: AdminGame[]; pagination: Pagination }> => {
        const res = await apiClient.get<ApiResponse<PaginatedData<AdminGame>>>(
            ENDPOINTS.ADMIN.GAMES,
            { params: qs({ page: 1, limit: 20, ...params }) }
        );
        return res.data.data;
    },

    /** GET /api/v1/admin/games/online */
    getOnlineGames: async (params: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<{ data: AdminGame[]; pagination: Pagination }> => {
        const res = await apiClient.get<ApiResponse<PaginatedData<AdminGame>>>(
            ENDPOINTS.ADMIN.ONLINE_GAMES,
            { params: qs({ page: 1, limit: 20, ...params }) }
        );
        return res.data.data;
    },

    /** GET /api/v1/admin/games/offline */
    getOfflineGames: async (params: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<{ data: AdminGame[]; pagination: Pagination }> => {
        const res = await apiClient.get<ApiResponse<PaginatedData<AdminGame>>>(
            ENDPOINTS.ADMIN.OFFLINE_GAMES,
            { params: qs({ page: 1, limit: 20, ...params }) }
        );
        return res.data.data;
    },

    /** GET /api/v1/admin/games/:gameId */
    getGameById: async (gameId: string): Promise<AdminGameDetail> => {
        const res = await apiClient.get<ApiResponse<AdminGameDetail>>(
            ENDPOINTS.ADMIN.GAME_BY_ID(gameId)
        );
        return res.data.data;
    },
};
