"use client";

import { Sun } from "lucide-react";

// Theme toggle is disabled — app uses light mode only
export function ThemeToggle() {
    return (
        <div
            className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-green-50 border border-green-100 text-green-600 shadow-sm cursor-default"
            aria-label="Light mode"
            title="Light mode active"
        >
            <Sun size={18} />
        </div>
    );
}
