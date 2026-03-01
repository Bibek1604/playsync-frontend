"use client";
import React from "react";
import { Search } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { useAuthStore } from "@/features/auth/store/auth-store";

export default function DashboardHeader() {
    const user = useAuthStore((state) => state.user);

    return (
        <header className="h-20 px-8 flex items-center justify-between bg-transparent">
            {/* Search Bar - Optional, but good for dashboard headers */}
            <div className="relative hidden md:block w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-transparent rounded-2xl leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-0 focus:border-slate-200 sm:text-sm shadow-sm transition-all"
                    placeholder="Search games, players, tournaments..."
                />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4 ml-auto">
                <NotificationDropdown />

                {/* We can add other header items here later if needed */}
            </div>
        </header>
    );
}
