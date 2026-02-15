"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth-store";
import {
    Gamepad2,
    LayoutDashboard,
    Users,
    Trophy,
    MessageSquare,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Zap,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { gameService } from "@/features/games/api/game-service";

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const profile = useAuthStore((state) => state.profile);

    const { data: joinedGamesData } = useQuery({
        queryKey: ['myJoinedGames'],
        queryFn: () => gameService.getMyJoined(),
        enabled: !!user
    });

    const joinedGames = joinedGamesData?.games || [];

    const handleLogout = async () => {
        await logout();
        router.push('/auth/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        { icon: Users, label: "Online Games", href: "/games/online" },
        { icon: Trophy, label: "Offline Games", href: "/games/offline" },
        { icon: MessageSquare, label: "Messages", href: "/messages", badge: "3" },
        { icon: MessageSquare, label: "Rankings", href: "/rankings" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ];

    return (
        <aside
            className={`bg-white border-r border-slate-100 transition-all duration-300 ease-in-out z-[100] flex flex-col h-screen sticky top-0 ${isCollapsed ? "w-20" : "w-64"
                }`}
        >
            {/* --- Header / Logo --- */}
            <div className="h-20 flex items-center px-6 mb-4">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 shrink-0 group-hover:rotate-12 transition-transform">
                        <Gamepad2 size={20} />
                    </div>
                    {!isCollapsed && (
                        <span className="text-xl font-black tracking-tighter uppercase text-slate-900">
                            PLAY<span className="text-emerald-600">SYNC</span>
                        </span>
                    )}
                </Link>
            </div>

            {/* --- Collapse Toggle --- */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-24 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm z-50"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* --- Navigation Items --- */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-4 px-3 py-3.5 rounded-2xl transition-all relative group ${isActive
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                }`}
                        >
                            <item.icon
                                size={22}
                                className={`${isActive ? "text-white" : "group-hover:scale-110 transition-transform"}`}
                            />

                            {!isCollapsed && (
                                <span className="text-sm font-bold tracking-tight flex-1 whitespace-nowrap">
                                    {item.label}
                                </span>
                            )}

                            {/* Notification Badge */}
                            {item.badge && !isCollapsed && (
                                <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                    {item.badge}
                                </span>
                            )}

                            {/* Tooltip for Collapsed State */}
                            {isCollapsed && (
                                <div className="absolute left-16 bg-slate-900 text-white text-[10px] font-black px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity uppercase tracking-widest whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    );
                })}

                {/* --- Joined Games Section --- */}
                {!isCollapsed && joinedGames.length > 0 && (
                    <div className="pt-6 pb-2">
                        <h3 className="px-4 text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                            Joined Games
                        </h3>
                        <div className="space-y-1">
                            {joinedGames.map((game) => {
                                const gameHref = `/games/${game.category.toLowerCase()}/${game._id}`;
                                const isActive = pathname === gameHref;
                                return (
                                    <Link
                                        key={game._id}
                                        href={gameHref}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-emerald-200 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                                            {game.imageUrl ? (
                                                <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                <span className="text-xs font-bold">{game.title.substring(0, 1)}</span>
                                            )}
                                        </div>
                                        <span className="text-sm font-semibold truncate">
                                            {game.title}
                                        </span>
                                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </nav>

            {/* --- Bottom Section: Player Card --- */}
            <div className="p-4 border-t border-slate-50 mt-auto">
                {!isCollapsed ? (
                    <div
                        onClick={() => router.push('/settings')}
                        className="bg-slate-900 rounded-[1.5rem] p-4 text-white relative overflow-hidden group cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/40 transition-all" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 overflow-hidden">
                                    {profile?.profilePicture ? (
                                        <img
                                            src={profile.profilePicture.startsWith('http')
                                                ? profile.profilePicture
                                                : `http://localhost:5000${profile.profilePicture}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Zap size={16} fill="currentColor" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                                        Pro Active
                                    </p>
                                    <p className="text-xs font-bold truncate max-w-[120px]">
                                        {(profile?.fullName || user?.fullName || "Ghost_Main").split(' ')[0]}
                                    </p>
                                </div>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[70%]" />
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                                70% to Elite Rank
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div
                            onClick={() => router.push('/settings')}
                            className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-500 cursor-pointer hover:bg-emerald-600 hover:text-white transition-all overflow-hidden"
                        >
                            {profile?.profilePicture ? (
                                <img
                                    src={profile.profilePicture.startsWith('http')
                                        ? profile.profilePicture
                                        : `http://localhost:5000${profile.profilePicture}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Zap size={20} />
                            )}
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-4 px-3 py-4 mt-4 text-slate-400 hover:text-red-500 transition-colors ${isCollapsed ? "justify-center" : ""}`}
                >
                    <LogOut size={22} />
                    {!isCollapsed && <span className="text-sm font-bold">Logout</span>}
                </button>
            </div>
        </aside>
    );
}
