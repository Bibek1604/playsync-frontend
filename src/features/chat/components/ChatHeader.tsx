import React from 'react';
import { Users, MoreVertical, Hash } from 'lucide-react';

interface ChatHeaderProps {
    title: string;
    participantCount: number;
    onMenuClick?: () => void;
    action?: React.ReactNode;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ title, participantCount, onMenuClick, action }) => {
    return (
        <header className="h-[68px] bg-white border-b border-gray-100 flex items-center justify-between px-5 shrink-0 z-10 shadow-sm">
            {/* Left: icon + title */}
            <div className="flex items-center gap-3 min-w-0">
                {/* Mobile menu toggle */}
                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all lg:hidden"
                    aria-label="Toggle participants"
                >
                    <Users size={20} />
                </button>

                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white shadow-sm shadow-green-200 shrink-0">
                    <Hash size={18} strokeWidth={2.5} />
                </div>

                <div className="min-w-0">
                    <h1 className="text-[15px] font-bold text-gray-900 leading-none mb-1 truncate">
                        {title}
                    </h1>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                        <span className="text-[11px] text-gray-400 font-semibold">
                            {participantCount} {participantCount === 1 ? 'player' : 'players'} active
                        </span>
                    </div>
                </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2 shrink-0">
                {action}
                <button
                    onClick={onMenuClick}
                    className="hidden sm:flex p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-all"
                    aria-label="More options"
                >
                    <MoreVertical size={20} />
                </button>
            </div>
        </header>
    );
};
