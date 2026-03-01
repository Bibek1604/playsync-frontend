import { useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, Notification } from '../api/notification-service';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { getSocket } from '@/lib/socket';

export const useNotifications = () => {
    const { accessToken, user } = useAuthStore();
    const queryClient = useQueryClient();
    const socketListenersAdded = useRef(false);

    // Fetch initial notifications
    const {
        data: notificationData,
        isLoading,
        error
    } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationService.getNotifications(),
        enabled: !!accessToken,
        staleTime: 30000, // Cache for 30 seconds
    });

    // Fetch unread count
    const {
        data: unreadCount = 0
    } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: notificationService.getUnreadCount,
        enabled: !!accessToken,
        staleTime: 30000, // Sync with notifications query
        refetchInterval: 60000 // Poll every minute as backup
    });

    // Mark as read mutation
    const markAsReadMutation = useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        }
    });

    // Mark all as read mutation
    const markAllReadMutation = useMutation({
        mutationFn: notificationService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        }
    });

    // Socket listeners with proper cleanup
    useEffect(() => {
        if (!accessToken || socketListenersAdded.current) return;

        const socket = getSocket(accessToken);

        const handleNewNotification = (data: Notification) => {
            console.log('📬 New notification received:', data);
            
            // Optimistically update cache
            queryClient.setQueryData(['notifications'], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    notifications: [data, ...(old.notifications || [])],
                    unreadCount: (old.unreadCount || 0) + 1
                };
            });

            // Also refetch to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['notifications'] });

            // Optional: Play notification sound
            try {
                const audio = new Audio('/sounds/notification.mp3');
                audio.play().catch(() => { }); // Ignore play errors
            } catch (e) {
                // Ignore audio errors
            }
        };

        const handleUnreadCount = (data: { count: number }) => {
            console.log('📊 Unread count updated:', data.count);
            queryClient.setQueryData(['notifications', 'unread-count'], data.count);
        };

        const handleNotificationRead = (data: { notificationId: string }) => {
            console.log('✅ Notification marked as read:', data.notificationId);
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        };

        const handleAllNotificationsRead = () => {
            console.log('✅ All notifications marked as read');
            queryClient.setQueryData(['notifications', 'unread-count'], 0);
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        };

        socket.on('notification', handleNewNotification);
        socket.on('notification:unread-count', handleUnreadCount);
        socket.on('notification:read', handleNotificationRead);
        socket.on('notification:all-read', handleAllNotificationsRead);

        socketListenersAdded.current = true;

        return () => {
            socket.off('notification', handleNewNotification);
            socket.off('notification:unread-count', handleUnreadCount);
            socket.off('notification:read', handleNotificationRead);
            socket.off('notification:all-read', handleAllNotificationsRead);
            socketListenersAdded.current = false;
        };
    }, [accessToken, queryClient]);

    return {
        notifications: notificationData?.notifications || [],
        unreadCount: notificationData?.unreadCount ?? unreadCount,
        pagination: notificationData?.pagination,
        isLoading,
        error,
        markAsRead: markAsReadMutation.mutate,
        markAllAsRead: markAllReadMutation.mutate,
        isMarkingRead: markAsReadMutation.isPending || markAllReadMutation.isPending
    };
};

