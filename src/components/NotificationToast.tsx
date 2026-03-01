/**
 * Toast Notification Component
 * Real-time notification display with auto-dismiss
 */

'use client';

import { useEffect, useState } from 'react';
import { X, Bell, Users, MessageSquare, CheckCircle, AlertCircle, Info, Trophy } from 'lucide-react';
import { Notification } from '@/features/notifications/api/notification-service';

interface ToastProps {
    notification: Notification;
    onDismiss: () => void;
    autoHideDuration?: number;
}

export default function NotificationToast({ notification, onDismiss, autoHideDuration = 5000 }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        // Slide in animation
        const showTimer = setTimeout(() => setIsVisible(true), 10);

        // Auto dismiss
        const hideTimer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300); // Wait for slide-out animation
        }, autoHideDuration);

        // Progress bar animation
        const progressInterval = setInterval(() => {
            setProgress((prev) => Math.max(0, prev - (100 / (autoHideDuration / 100))));
        }, 100);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
            clearInterval(progressInterval);
        };
    }, [autoHideDuration, onDismiss]);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
    };

    const getIcon = () => {
        const iconProps = { size: 20 };
        switch (notification.type) {
            case 'game_full':
                return <CheckCircle {...iconProps} className="text-emerald-600" />;
            case 'game_join':
                return <Users {...iconProps} className="text-green-600" />;
            case 'game_leave':
                return <Users {...iconProps} className="text-orange-600" />;
            case 'game_create':
                return <Bell {...iconProps} className="text-purple-600" />;
            case 'chat_message':
                return <MessageSquare {...iconProps} className="text-purple-600" />;
            case 'game_start':
                return <Bell {...iconProps} className="text-orange-600" />;
            case 'game_end':
                return <AlertCircle {...iconProps} className="text-red-600" />;
            case 'completion_bonus':
                return <Trophy {...iconProps} className="text-yellow-600" />;
            default:
                return <Info {...iconProps} className="text-slate-600" />;
        }
    };

    const getTypeColor = () => {
        switch (notification.type) {
            case 'game_full':
                return 'border-emerald-200 bg-emerald-50';
            case 'game_join':
                return 'border-green-200 bg-green-50';
            case 'game_leave':
                return 'border-orange-200 bg-orange-50';
            case 'game_create':
                return 'border-purple-200 bg-purple-50';
            case 'chat_message':
                return 'border-purple-200 bg-purple-50';
            case 'game_start':
                return 'border-orange-200 bg-orange-50';
            case 'game_end':
                return 'border-red-200 bg-red-50';
            case 'completion_bonus':
                return 'border-yellow-200 bg-yellow-50';
            default:
                return 'border-slate-200 bg-slate-50';
        }
    };

    return (
        <div
            className={`
                relative w-96 max-w-full bg-white border-l-4 rounded-lg shadow-lg overflow-hidden
                transition-all duration-300 transform
                ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
                ${getTypeColor()}
            `}
        >
            {/* Progress Bar */}
            <div
                className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-100"
                style={{ width: `${progress}%` } as React.CSSProperties}
            />

            <div className="p-4">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="shrink-0 mt-0.5">
                        {getIcon()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">
                            {notification.title}
                        </p>
                        <p className="text-slate-600 text-sm mt-1 wrap-break-word">
                            {notification.message}
                        </p>
                        {notification.data?.gameId && (
                            <a
                                href={`/games/${notification.data.gameId}`}
                                className="text-emerald-600 hover:text-emerald-700 font-semibold text-xs mt-2 inline-block"
                            >
                                View Game →
                            </a>
                        )}
                    </div>

                    {/* Dismiss Button */}
                    <button
                        onClick={handleDismiss}
                        className="shrink-0 p-1 hover:bg-slate-100 rounded transition-colors"
                        aria-label="Dismiss notification"
                    >
                        <X size={16} className="text-slate-400" />
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Toast Container Component
 * Manages multiple toast notifications in a stack
 */
interface ToastContainerProps {
    notifications: Notification[];
    onDismiss: (id: string) => void;
}

export function ToastContainer({ notifications, onDismiss }: ToastContainerProps) {
    return (
        <div className="fixed bottom-4 left-4 z-50 space-y-3 pointer-events-none">
            <div className="pointer-events-auto">
                {notifications.map((notification, index) => {
                    const stackZIndex = notifications.length - index;
                    return (
                        <div
                            key={notification.id}
                            className="mb-3"
                            style={{ zIndex: stackZIndex } as React.CSSProperties}
                        >
                            <NotificationToast
                                notification={notification}
                                onDismiss={() => onDismiss(notification.id)}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
