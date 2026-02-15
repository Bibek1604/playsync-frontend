import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';
import { QueryParams } from '@/types';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface Notification {
    _id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
}

export const notificationService = {
    getNotifications: async (params?: QueryParams): Promise<Notification[]> => {
        const response = await apiClient.get<ApiResponse<Notification[]>>(ENDPOINTS.NOTIFICATIONS.LIST, {
            params,
        });
        return response.data.data;
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await apiClient.get<ApiResponse<number>>(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
        return response.data.data;
    },

    markAllAsRead: async (): Promise<void> => {
        await apiClient.patch(ENDPOINTS.NOTIFICATIONS.READ_ALL);
    },

    markAsRead: async (id: string): Promise<void> => {
        await apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    }
};
