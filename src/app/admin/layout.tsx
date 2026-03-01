"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Users, LogOut, Gamepad2, BarChart3,
    Shield, ChevronLeft, LayoutDashboard,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth-store';

const ADMIN_NAV = [
    { name: 'Overview', href: '/admin', icon: BarChart3 },
    { name: 'Users', href: '/admin?tab=users', icon: Users },
    { name: 'Games', href: '/admin?tab=games', icon: Gamepad2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        router.push('/auth/login');
    };

    return (
        <div className="flex h-screen" style={{ background: '#F8F9FA' }}>

            {/* ── Sidebar ── */}
            <aside className="w-60 bg-white flex flex-col flex-shrink-0"
                style={{ borderRight: '1px solid #E5E7EB' }}>

                {/* Logo — transparent background, original colors */}
                <div className="flex flex-col items-center px-5 pt-5 pb-4"
                    style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <img
                        src="/p.svg"
                        alt="PlaySync"
                        className="w-auto object-contain"
                        style={{ height: '56px' }}
                    />
                    <span
                        className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}
                    >
                        <Shield size={9} strokeWidth={2.5} />
                        Admin Panel
                    </span>
                </div>

                {/* Back link */}
                <div className="px-4 pt-4 pb-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-1.5 text-[11px] font-semibold transition-colors px-2 py-1.5 rounded-lg"
                        style={{ color: '#6B7280' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#16A34A'; (e.currentTarget as HTMLElement).style.background = '#F0FDF4'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6B7280'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                        <ChevronLeft size={13} />
                        Back to Dashboard
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                    <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: '#D1D5DB' }}>
                        Management
                    </p>
                    {ADMIN_NAV.map((item) => {
                        const isActive = item.href === '/admin' && pathname === '/admin';
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-semibold"
                                style={isActive
                                    ? { background: '#F0FDF4', color: '#16A34A', borderLeft: '3px solid #16A34A' }
                                    : { color: '#6B7280' }
                                }
                                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = '#F8F9FA'; (e.currentTarget as HTMLElement).style.color = '#1F2937'; } }}
                                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6B7280'; } }}
                            >
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={isActive
                                        ? { background: '#DCFCE7', color: '#16A34A' }
                                        : { background: '#F3F4F6', color: '#9CA3AF' }
                                    }
                                >
                                    <item.icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 space-y-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                    {/* User card */}
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                        style={{ background: '#F8F9FA', border: '1px solid #E5E7EB' }}>
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}
                        >
                            {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-bold truncate" style={{ color: '#1F2937' }}>
                                {user?.fullName || 'Admin'}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#16A34A' }}>
                                Administrator
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg w-full text-sm font-semibold transition-all"
                        style={{ color: '#EF4444' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                        <LogOut size={15} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
