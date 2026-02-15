
"use client";
import React, { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import GameSidebar from "@/components/game/GameSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useGameStore } from "@/features/games/store/game-store";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading, isHydrated } = useAuthStore();
    const { viewMode, activeGame } = useGameStore();
    const router = useRouter();

    useEffect(() => {
        if (isHydrated && !isLoading && !isAuthenticated) {
            router.push("/auth/login");
        }
    }, [isAuthenticated, isLoading, isHydrated, router]);

    if (!isHydrated || !isAuthenticated) {
        return null;
    }

    return (
        <div className="flex bg-[#FBFCFE] h-screen overflow-hidden">
            {/* Sidebar Container */}
            <div className="flex-shrink-0 h-full z-10">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto w-full relative">
                <DashboardHeader />
                <main className="flex-1 p-0 overflow-hidden w-full h-full"> {/* Remove padding to allow full game area */}
                    {children}
                </main>
            </div>
        </div>
    );
}
