import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';
import { User, Game } from '@/types';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const adminService = {
    getUsers: async (params?: any): Promise<PaginatedResponse<User>> => {
        const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(ENDPOINTS.ADMIN.USERS, {
            params,
        });
        return response.data.data;
    },

    getUserById: async (id: string): Promise<User> => {
        const response = await apiClient.get<ApiResponse<User>>(ENDPOINTS.ADMIN.USER_BY_ID(id));
        return response.data.data;
    },

    getGames: async (params?: any): Promise<PaginatedResponse<Game>> => {
        const response = await apiClient.get<ApiResponse<PaginatedResponse<Game>>>(ENDPOINTS.ADMIN.GAMES, {
            params,
        });
        return response.data.data;
    },

    getOnlineGames: async (params?: any): Promise<PaginatedResponse<Game>> => {
        const response = await apiClient.get<ApiResponse<PaginatedResponse<Game>>>(ENDPOINTS.ADMIN.ONLINE_GAMES, {
            params,
        });
        return response.data.data;
    },

    getOfflineGames: async (params?: any): Promise<PaginatedResponse<Game>> => {
        const response = await apiClient.get<ApiResponse<PaginatedResponse<Game>>>(ENDPOINTS.ADMIN.OFFLINE_GAMES, {
            params,
        });
        return response.data.data;
    },

    getGameById: async (id: string): Promise<Game> => {
        const response = await apiClient.get<ApiResponse<Game>>(ENDPOINTS.ADMIN.GAME_BY_ID(id));
        return response.data.data;
    },

    getStats: async (): Promise<any> => {
        const response = await apiClient.get<ApiResponse<any>>(ENDPOINTS.ADMIN.STATS);
        return response.data.data;
    }
};
