import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';
import { Game, QueryParams } from '@/types';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface PaginatedResponse<T> {
    games: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const gameService = {
    getAll: async (params?: QueryParams): Promise<PaginatedResponse<Game>> => {
        const response = await apiClient.get<ApiResponse<PaginatedResponse<Game>>>(ENDPOINTS.GAMES.LIST, {
            params,
        });
        return response.data.data;
    },

    getById: async (id: string): Promise<Game> => {
        const response = await apiClient.get<ApiResponse<Game>>(ENDPOINTS.GAMES.BY_ID(id), {
            params: { details: true }
        });
        return response.data.data;
    },

    getMyCreated: async (params?: QueryParams): Promise<PaginatedResponse<Game>> => {
        const response = await apiClient.get<ApiResponse<PaginatedResponse<Game>>>(ENDPOINTS.GAMES.MY_CREATED, {
            params,
        });
        return response.data.data;
    },

    getMyJoined: async (params?: QueryParams): Promise<PaginatedResponse<Game>> => {
        const response = await apiClient.get<ApiResponse<PaginatedResponse<Game>>>(ENDPOINTS.GAMES.MY_JOINED, {
            params,
        });
        return response.data.data;
    },

    create: async (formData: FormData): Promise<Game> => {
        const response = await apiClient.post<ApiResponse<Game>>(ENDPOINTS.GAMES.BASE, formData);
        return response.data.data;
    },

    update: async (id: string, formData: FormData): Promise<Game> => {
        const response = await apiClient.patch<ApiResponse<Game>>(ENDPOINTS.GAMES.BY_ID(id), formData);
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(ENDPOINTS.GAMES.BY_ID(id));
    },

    join: async (id: string): Promise<Game> => {
        const response = await apiClient.post<ApiResponse<Game>>(ENDPOINTS.GAMES.JOIN(id));
        return response.data.data;
    },

    leave: async (id: string): Promise<Game> => {
        const response = await apiClient.post<ApiResponse<Game>>(ENDPOINTS.GAMES.LEAVE(id));
        return response.data.data;
    },

    canJoin: async (id: string): Promise<{ canJoin: boolean; reason?: string }> => {
        const response = await apiClient.get<ApiResponse<{ canJoin: boolean; reason?: string }>>(ENDPOINTS.GAMES.CAN_JOIN(id));
        return response.data.data;
    },

    cancel: async (id: string, reason: string): Promise<Game> => {
        const response = await apiClient.post<ApiResponse<Game>>(ENDPOINTS.GAMES.CANCEL(id), { reason });
        return response.data.data;
    },

    complete: async (id: string): Promise<Game> => {
        const response = await apiClient.post<ApiResponse<Game>>(ENDPOINTS.GAMES.COMPLETE(id));
        return response.data.data;
    },

    getTags: async (): Promise<string[]> => {
        const response = await apiClient.get<ApiResponse<string[]>>(ENDPOINTS.GAMES.TAGS);
        return response.data.data;
    }
};
