'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart2,
    Wifi,
    WifiOff,
    Settings,
    Trophy,
    MessageSquare,
    LayoutDashboard,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    Zap,
    Shield,
    Users,
    Gamepad2,
    Activity,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/features/admin/api/admin-service';
import { Avatar } from '@/components/ui';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: BarChart2, label: 'Analytics', href: '/analytics' },
    { icon: Wifi, label: 'Online Games', href: '/games/online' },
    { icon: WifiOff, label: 'Offline Games', href: '/games/offline' },
    { icon: Trophy, label: 'Rankings', href: '/rankings' },
    { icon: MessageSquare, label: 'Messages', href: '/messages' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mounted, setMounted] = React.useState(false);

    const isAdmin = mounted && (user as any)?.role === 'admin';

    React.useEffect(() => { setMounted(true); }, []);

    // Fetch admin stats only for admin users
    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: adminService.getStats,
        enabled: isAdmin,
        staleTime: 30_000,
        refetchInterval: 60_000,
    });

    const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

    // Admin quick-stat rows shown below nav
    const adminStatItems = stats ? [
        { icon: Users, label: 'Users', value: stats.totalUsers, color: 'text-green-600 bg-green-50' },
        { icon: Gamepad2, label: 'Games', value: stats.totalGames, color: 'text-blue-600 bg-blue-50' },
        { icon: Wifi, label: 'Online', value: stats.totalOnlineGames, color: 'text-cyan-600 bg-cyan-50' },
        { icon: WifiOff, label: 'Offline', value: stats.totalOfflineGames, color: 'text-purple-600 bg-purple-50' },
        { icon: Activity, label: 'Active', value: stats.activeGames, color: 'text-amber-600 bg-amber-50' },
        { icon: Users, label: 'Players', value: stats.totalParticipantsAcrossAllGames, color: 'text-rose-600 bg-rose-50' },
    ] : [];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white border-r border-gray-100">
            {/* Brand */}
            <div className={`flex items-center gap-3 px-4 py-4 shrink-0 border-b border-gray-50 ${isCollapsed ? 'justify-center h-[72px]' : 'justify-center'}`}>
                {isCollapsed ? (
                    /* Collapsed: just the Zap icon */
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-600 shadow-sm flex-shrink-0">
                        <Zap size={18} className="text-white" strokeWidth={2.5} />
                    </div>
                ) : (
                    /* Expanded: the real /p.svg logo from footer */
                    <img
                        src="/p.svg"
                        alt="PlaySync"
                        className="h-40 w-auto object-contain"
                    />
                )}
            </div>

            {/* Profile Card Summary */}
            {!isCollapsed && mounted && (
                <div className="px-5 transition-all animate-fade-in py-2">
                    <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm group/profile hover:bg-white hover:border-green-100 transition-all cursor-pointer">
                        <Avatar
                            src={(user as any)?.profilePicture || (user as any)?.avatar}
                            fallback={user?.fullName || 'U'}
                            size="sm"
                            className="ring-2 ring-white shadow-sm group-hover/profile:scale-105 transition-transform"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight truncate">
                                {user?.fullName || 'Player'}
                            </p>
                            <p className="text-[8px] font-bold text-green-600 uppercase tracking-widest mt-0.5">
                                • Online
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-4">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all group relative ${isCollapsed ? 'justify-center' : ''} ${active
                                ? 'bg-green-600 text-white shadow-lg shadow-green-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${active ? 'bg-white/20' : 'bg-transparent group-hover:bg-gray-100'}`}>
                                <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
                            </div>
                            {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    );
                })}

                {/* Admin link — only for admin role */}
                {isAdmin && (() => {
                    const active = isActive('/admin');
                    return (
                        <Link
                            href="/admin"
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all group relative mt-2 ${isCollapsed ? 'justify-center' : ''} ${active
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-100'
                                : 'text-purple-500 hover:bg-purple-50 hover:text-purple-700'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${active ? 'bg-white/20' : 'bg-transparent group-hover:bg-purple-100'}`}>
                                <Shield size={18} strokeWidth={active ? 2.5 : 2} />
                            </div>
                            {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">Admin</span>}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    Admin Panel
                                </div>
                            )}
                        </Link>
                    );
                })()}

                {/* ── Admin Live Stats Block (shown in sidebar below nav) ── */}
                {isAdmin && !isCollapsed && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-3 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                            Platform Stats
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {adminStatItems.length === 0
                                ? Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-[60px] bg-gray-50 rounded-xl animate-pulse" />
                                ))
                                : adminStatItems.map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex flex-col gap-1.5 bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-xl px-3 py-2.5 transition-all group/stat"
                                    >
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${item.color}`}>
                                            <item.icon size={12} />
                                        </div>
                                        <p className="text-base font-extrabold text-gray-900 leading-none">
                                            {item.value.toLocaleString()}
                                        </p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none">
                                            {item.label}
                                        </p>
                                    </div>
                                ))
                            }
                        </div>
                        <Link
                            href="/admin"
                            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all uppercase tracking-widest"
                        >
                            <Shield size={10} />
                            Open Admin Panel
                        </Link>
                    </div>
                )}

                {/* Collapsed state: show admin stat icons only */}
                {isAdmin && isCollapsed && adminStatItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                        {adminStatItems.map((item) => (
                            <div
                                key={item.label}
                                className="relative flex items-center justify-center group/cstat"
                            >
                                <div className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center ${item.color} cursor-default`}>
                                    <item.icon size={12} />
                                    <span className="text-[8px] font-black mt-0.5 leading-none">
                                        {item.value > 999 ? `${(item.value / 1000).toFixed(1)}k` : item.value}
                                    </span>
                                </div>
                                <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-800 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/cstat:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.label}: {item.value.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </nav>

            {/* Footer */}
            <div className="p-5 border-t border-gray-50 space-y-2">
                <button
                    onClick={() => logout()}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all ${isCollapsed ? 'justify-center' : 'justify-between'} group/logout`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 group-hover/logout:bg-red-100 group-hover/logout:text-red-600 transition-colors">
                            <LogOut size={16} />
                        </div>
                        {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">Sign Out</span>}
                    </div>
                </button>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex w-full items-center justify-center py-2.5 text-gray-300 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden h-16 flex items-center justify-between px-4 sticky top-0 z-40 bg-white border-b border-gray-100">
                <div className="flex items-center">
                    <img src="/p.svg" alt="PlaySync" className="h-36 w-auto object-contain" />
                </div>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 text-gray-500 bg-gray-50 rounded-lg border border-gray-100"
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden h-full w-full"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar Panel */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 transition-all duration-300 lg:relative lg:translate-x-0
                    ${isCollapsed ? 'w-[80px]' : 'w-[260px]'}
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <SidebarContent />
            </aside>
        </>
    );
}
