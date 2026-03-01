/**
 * Hook for managing real-time toast notifications
 * Integrates with Socket.IO to display incoming notifications as toasts
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Notification } from '@/features/notifications/api/notification-service';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { playNotificationSound } from '@/lib/notification-sound';

const MAX_TOASTS = 3; // Maximum number of toasts to show at once

export function useNotificationToasts() {
    const [toasts, setToasts] = useState<Notification[]>([]);
    const { accessToken } = useAuthStore();
    const socketListenersAdded = useRef(false);

    const addToast = useCallback((notification: Notification) => {
        setToasts((prev) => {
            // Prevent duplicates
            if (prev.some((t) => t.id === notification.id)) {
                return prev;
            }
            // Keep only MAX_TOASTS most recent
            const newToasts = [notification, ...prev].slice(0, MAX_TOASTS);
            
            // Play notification sound for new notification
            playNotificationSound();
            
            return newToasts;
        });
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    useEffect(() => {
        // Clear toasts when logged out
        if (!accessToken) {
            socketListenersAdded.current = false;
            return;
        }

        const socket = getSocket();
        
        // Only add listeners once
        if (!socketListenersAdded.current) {
            const handleNewNotification = (notification: Notification) => {
                console.log('Toast: Received notification', notification);
                addToast(notification);
            };

            socket.on('notification', handleNewNotification);
            socketListenersAdded.current = true;

            console.log('Toast: Socket listeners registered');
        }

        return () => {
            // Cleanup on unmount
            if (socketListenersAdded.current) {
                const socket = getSocket();
                socket.off('notification');
                socketListenersAdded.current = false;
                console.log('Toast: Socket listeners removed');
            }
        };
    }, [accessToken, addToast]);

    return {
        toasts,
        addToast,
        dismissToast,
        clearAllToasts,
    };
}
