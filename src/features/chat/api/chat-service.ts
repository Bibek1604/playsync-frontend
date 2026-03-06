import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ChatMessage {
    _id: string;          // Database ID
    senderId: string;     // Normalized User ID
    senderName: string;   // Full name
    senderAvatar?: string;
    text: string;         // Content
    type: 'text' | 'system';
    createdAt: string;    // Timestamp
}

interface ChatHistoryResponse {
    messages: ChatMessage[];
    hasMore: boolean;
    nextCursor?: string;
}

export const chatService = {
    getChatHistory: async (gameId: string, params?: { page?: number; limit?: number }): Promise<ChatMessage[]> => {
        const response = await apiClient.get<ApiResponse<ChatHistoryResponse>>(ENDPOINTS.CHAT.HISTORY(gameId), {
            params,
        });
        return response.data.data.messages;
    }
};
