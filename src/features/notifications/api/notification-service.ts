import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';
import { QueryParams } from '@/types';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export type NotificationType =
    | 'game_join'
    | 'game_leave'
    | 'game_create'
    | 'game_full'
    | 'game_start'
    | 'game_end'
    | 'chat_message'
    | 'leaderboard'
    | 'game_cancel'
    | 'game_cancelled'
    | 'game_completed'
    | 'completion_bonus'
    | 'system';

export interface Notification {
    _id: string;
    id: string; // Alias for _id
    user: string;
    type: NotificationType;
    title: string;
    message: string;
    data: {
        gameId?: string;
        username?: string;
        gameTitle?: string;
        bonusPoints?: number;
        [key: string]: any;
    };
    link?: string;
    read: boolean;
    createdAt: string;
    updatedAt: string;
}

interface NotificationListResponse {
    notifications: Notification[];
    unreadCount: number;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface UnreadCountResponse {
    unreadCount: number;
}

export const notificationService = {
    getNotifications: async (params?: QueryParams): Promise<NotificationListResponse> => {
        const response = await apiClient.get<ApiResponse<NotificationListResponse>>(
            ENDPOINTS.NOTIFICATIONS.LIST,
            { params }
        );
        // Backend returns { data: { notifications: [...], unreadCount: ..., pagination: {...} } }
        // Add id alias for _id
        const data = response.data.data;
        data.notifications = data.notifications.map(notif => ({
            ...notif,
            id: notif._id
        }));
        return data;
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await apiClient.get<ApiResponse<UnreadCountResponse>>(
            ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
        );
        return response.data.data.unreadCount;
    },

    markAllAsRead: async (): Promise<void> => {
        await apiClient.patch(ENDPOINTS.NOTIFICATIONS.READ_ALL);
    },

    markAsRead: async (id: string): Promise<void> => {
        await apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    }
};
