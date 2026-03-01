"use client";
import React from "react";
import { Search, Bell, Command, User } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { useAuthStore } from "@/features/auth/store/auth-store";

export default function DashboardHeader() {
    const user = useAuthStore((state) => state.user);

    return (
        <header className="h-[72px] px-6 flex items-center justify-between sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
            {/* Search Bar */}
            <div className="relative hidden md:block w-[400px]">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-12 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all placeholder:text-gray-400"
                    placeholder="Search games, players, squads..."
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white text-[10px] font-bold text-slate-400 border border-slate-100 shadow-sm">
                        <Command size={10} />
                        <span>K</span>
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4 ml-auto">
                {/* Notification */}
                <NotificationDropdown />

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200" />

                {/* User chip */}
                <button className="flex items-center gap-3 pl-3 pr-1.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 hover:bg-green-50 hover:border-green-200 transition-all">
                    <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                        {user?.fullName?.split(' ')[0] || 'Player'}
                    </span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-600 text-white font-bold text-xs shadow-md shadow-green-100">
                        {user?.fullName?.[0]?.toUpperCase() || 'P'}
                    </div>
                </button>
            </div>
        </header>
    );
}
