import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ChatMessage {
    _id: string;
    gameId: string;
    userId: string;
    content: string;
    createdAt: string;
    user?: {
        fullName: string;
        avatar?: string;
    };
}

export const chatService = {
    getChatHistory: async (gameId: string, params?: { page?: number; limit?: number }): Promise<ChatMessage[]> => {
        const response = await apiClient.get<ApiResponse<ChatMessage[]>>(ENDPOINTS.CHAT.HISTORY(gameId), {
            params,
        });
        return response.data.data;
    }
};
