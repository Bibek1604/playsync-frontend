import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../api/notification-service';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { getSocket } from '@/lib/socket';

export const useNotifications = () => {
    const { accessToken } = useAuthStore();
    const queryClient = useQueryClient();

    // Fetch initial notifications
    const {
        data: notifications = [],
        isLoading,
        error
    } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationService.getNotifications()
    });

    // Fetch unread count
    const {
        data: unreadCount = 0
    } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: notificationService.getUnreadCount,
        refetchInterval: 60000 // Poll every minute as backup
    });

    // Mark as read mutation
    const markAsReadMutation = useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    // Mark all as read mutation
    const markAllReadMutation = useMutation({
        mutationFn: notificationService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    // Socket listeners
    useEffect(() => {
        if (!accessToken) return;

        const socket = getSocket(accessToken);

        const handleNewNotification = () => {
            // Update cache immediately or refetch
            queryClient.invalidateQueries({ queryKey: ['notifications'] });

            // Also play sound or show toast here if needed
            const audio = new Audio('/sounds/notification.mp3'); // Assuming you have one, or remove this
            audio.play().catch(() => { }); // Ignore play errors
        };

        const handleUnreadCount = (data: { count: number }) => {
            queryClient.setQueryData(['notifications', 'unread-count'], data.count);
        };

        socket.on('notification', handleNewNotification);
        socket.on('notification:unread-count', handleUnreadCount);

        return () => {
            socket.off('notification', handleNewNotification);
            socket.off('notification:unread-count', handleUnreadCount);
        };
    }, [accessToken, queryClient]);

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        markAsRead: markAsReadMutation.mutate,
        markAllAsRead: markAllReadMutation.mutate,
        isMarkingRead: markAsReadMutation.isPending || markAllReadMutation.isPending
    };
};
