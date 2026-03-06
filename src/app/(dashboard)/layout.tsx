"use client";
import React, { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading, isHydrated, user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (isHydrated && !isLoading) {
            if (!isAuthenticated) {
                router.push("/auth/login");
            } else if ((user as any)?.role === 'admin') {
                router.push("/admin");
            }
        }
    }, [isAuthenticated, isLoading, isHydrated, user, router]);

    if (!isHydrated || !isAuthenticated || (user as any)?.role === 'admin') {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    {/* Profile Avatar or Logo mark */}
                    {user ? (
                        <Avatar
                            src={(user as any)?.avatar || (user as any)?.profilePicture}
                            fallback={user?.fullName || 'U'}
                            size="xl"
                            className="ring-4 ring-green-500 shadow-lg animate-pulse"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-transparent overflow-hidden shadow-sm animate-pulse">
                            <img src="/image.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                    )}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-100 border-t-green-600 animate-spin" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Initialising Workspace</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-white">
            {/* Sidebar */}
            <Sidebar />

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-gray-50/30">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="p-6 md:p-10 max-w-screen-2xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
