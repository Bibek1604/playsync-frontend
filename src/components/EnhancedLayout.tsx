/**
 * Enhanced Layout with Player History Sidebar
 * Complete integration of notifications, history, and points system
 */

'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastContainer } from '@/components/NotificationToast';
import { useNotificationToasts } from '@/hooks/useNotificationToasts';
import NotificationDropdown from '@/features/notifications/components/NotificationDropdown';
import PlayerHistorySidebar from '@/components/PlayerHistorySidebar';
import { Avatar } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store/auth-store';
import Link from 'next/link';
import { Bell, Clock, User, History, Menu } from 'lucide-react';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30000, // 30 seconds
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

/**
 * Inner Layout - Has access to React Query
 */
function LayoutContent({ children }: { children: ReactNode }) {
    const { toasts, dismissToast } = useNotificationToasts();
    const { user } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Toast Notifications */}
            <ToastContainer notifications={toasts} onDismiss={dismissToast} />

            {/* Player History Sidebar */}
            <PlayerHistorySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Navigation */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Profile Avatar */}
                        <Link href="/" className="flex items-center gap-3">
                            <Avatar
                                src={(user as any)?.avatar || (user as any)?.profilePicture}
                                fallback={user?.fullName || 'U'}
                                size="sm"
                                className="ring-2 ring-emerald-500"
                            />
                            <span className="text-2xl font-bold text-emerald-600">PlaySync</span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="flex items-center gap-6">
                            <Link
                                href="/games"
                                className="text-slate-600 hover:text-slate-900 font-semibold transition-colors"
                            >
                                Games
                            </Link>
                            
                            {/* History Sidebar Toggle */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
                            >
                                <History size={18} />
                                <span className="hidden sm:inline">My Games</span>
                            </button>

                            <Link
                                href="/leaderboard"
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
                            >
                                <Clock size={18} />
                                <span className="hidden sm:inline">Leaderboard</span>
                            </Link>
                            
                            {/* Notification Dropdown */}
                            <NotificationDropdown />

                            {/* User Menu */}
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                <User size={18} className="text-slate-600" />
                                <span className="font-semibold text-slate-700 hidden sm:inline">Profile</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="py-8">
                <ErrorBoundary>
                    {children}
                </ErrorBoundary>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-slate-500 text-sm">
                        © 2024 PlaySync. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

/**
 * Root Layout Component
 * Wrap your entire app with this
 */
export default function EnhancedLayout({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <LayoutContent>{children}</LayoutContent>
        </QueryClientProvider>
    );
}
