"use client";
import React, { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/auth/login");
        }
    }, [isAuthenticated, isLoading, router]);

    if (!isAuthenticated) {
        return null; // Or return a loading spinner if preferred, but null avoids flash of content
    }

    return (
        <div className="flex bg-[#FBFCFE]">
            <Sidebar />
            <main className="flex-1 min-h-screen p-8">
                {children}
            </main>
        </div>
    );
}
