"use client";
import React from "react";
import NotificationDropdown from "./NotificationDropdown";
import { useAuthStore } from "@/features/auth/store/auth-store";

export default function DashboardHeader() {
    const user = useAuthStore((state) => state.user);

    return (
        <header className="h-18 px-6 flex items-center justify-end sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
            {/* Right Side */}
            <div className="flex items-center gap-4">
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
