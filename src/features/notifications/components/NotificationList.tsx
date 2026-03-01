/**
 * Notification List Component
 * Comprehensive notification display with filtering and pagination
 */

'use client';

import { useState } from 'react';
import { Bell, Check, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { Notification } from '../api/notification-service';

type NotificationFilter = 'all' | 'unread' | 'read';
type NotificationType = 'all' | 'game_join' | 'game_full' | 'chat_message' | 'game_cancel' | 'system';

export default function NotificationList() {
    const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, isMarkingRead } = useNotifications();
    const [filter, setFilter] = useState<NotificationFilter>('all');
    const [typeFilter, setTypeFilter] = useState<NotificationType>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter notifications
    const filteredNotifications = notifications.filter((notification) => {
        // Read/Unread filter
        if (filter === 'unread' && notification.read) return false;
        if (filter === 'read' && !notification.read) return false;

        // Type filter
        if (typeFilter !== 'all' && notification.type !== typeFilter) return false;

        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

    const getNotificationIcon = (type: string) => {
        const icons: Record<string, string> = {
            game_join: '👥',
            game_full: '✅',
            chat_message: '💬',
            game_cancel: '❌',
            system: '⚙️',
        };
        return icons[type] || '📢';
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }
        
        // Navigate to related page if gameId exists
        if (notification.data?.gameId) {
            // You can use Next.js router here
            // router.push(`/games/${notification.data.gameId}`);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-24 bg-slate-100 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <Bell size={24} className="text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                            <p className="text-sm text-slate-500">
                                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    
                    {unreadCount > 0 && (
                        <button
                            onClick={() => markAllAsRead()}
                            disabled={isMarkingRead}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Check size={16} />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                                filter === 'all'
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                                filter === 'unread'
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Unread ({unreadCount})
                        </button>
                        <button
                            onClick={() => setFilter('read')}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                                filter === 'read'
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Read
                        </button>
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as NotificationType)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="all">All Types</option>
                        <option value="game_join">Player Joined</option>
                        <option value="game_full">Game Full</option>
                        <option value="chat_message">Chat</option>
                        <option value="game_cancel">Game Cancelled</option>
                        <option value="system">System</option>
                    </select>
                </div>
            </div>

            {/* Notifications List */}
            {paginatedNotifications.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No notifications</h3>
                    <p className="text-slate-500">
                        {filter === 'unread' 
                            ? "You're all caught up! No unread notifications."
                            : 'No notifications to display with current filters.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {paginatedNotifications.map((notification) => (
                        <div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 rounded-lg border transition-all cursor-pointer ${
                                !notification.read
                                    ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex gap-4">
                                {/* Icon */}
                                <div className="text-2xl shrink-0">
                                    {getNotificationIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className={`font-semibold ${
                                            !notification.read ? 'text-slate-900' : 'text-slate-700'
                                        }`}>
                                            {notification.title}
                                        </h4>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 mt-2" />
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                                        <span>•</span>
                                        <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                                    </div>
                                </div>

                                {/* Mark as read button */}
                                {!notification.read && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notification._id);
                                        }}
                                        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-200 transition-colors"
                                        title="Mark as read"
                                    >
                                        <Check size={16} className="text-emerald-600" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    
                    <div className="flex items-center gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 rounded-lg font-semibold transition-colors ${
                                    currentPage === i + 1
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
