"use client";

import { Users, Crown } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_URL } from '@/lib/constants';

interface Participant {
    userId: string | {
        _id?: string;
        id?: string;
        fullName?: string;
        profilePicture?: string;
    };
    status: string;
    joinedAt: string;
    rank?: number;
}

interface ParticipantsSidebarProps {
    participants: Participant[];
    creatorId: string;
    onlineUsers?: Set<string>;
    isOpen?: boolean;
    onClose?: () => void;
}

export function ParticipantsSidebar({ participants, creatorId, onlineUsers = new Set(), isOpen = false, onClose }: ParticipantsSidebarProps) {
    const { user } = useAuthStore();

    const getParticipantId = (p: Participant) => {
        if (typeof p.userId === 'string') return p.userId;
        return p.userId._id || p.userId.id || '';
    };

    const getParticipantData = (p: Participant) => {
        if (typeof p.userId === 'string') {
            return { fullName: 'Unknown User', profilePicture: undefined };
        }
        return {
            fullName: p.userId.fullName || 'Unknown User',
            profilePicture: p.userId.profilePicture
        };
    };

    const isOnline = (participantId: string) => {
        return onlineUsers.has(participantId);
    };

    const getProfilePicture = (profilePicture?: string) => {
        if (!profilePicture) return null;
        if (profilePicture.startsWith('http')) return profilePicture;
        return `${API_URL}${profilePicture}`;
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <div className={`
                fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-slate-200 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none lg:z-auto
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <Users size={14} className="text-indigo-600" />
                        Participants ({participants.filter(p => p.status === 'ACTIVE').length})
                    </h3>
                    {/* Close button for mobile */}
                    <button onClick={onClose} className="lg:hidden p-1 hover:bg-slate-200 rounded-full text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                    <ul className="space-y-2">
                        {participants
                            .filter(p => p.status === 'ACTIVE')
                            .map((p) => {
                                const participantId = getParticipantId(p);
                                const participantData = getParticipantData(p);
                                const isMe = participantId === user?.id;
                                const isCreator = participantId === creatorId;
                                const online = isOnline(participantId);
                                const profilePic = getProfilePicture(participantData.profilePicture);

                                return (
                                    <li
                                        key={participantId}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all group relative ${isMe
                                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 shadow-sm'
                                            : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                            }`}
                                    >
                                        {/* Avatar with Rank Badge */}
                                        <div className="relative flex-shrink-0">
                                            {profilePic ? (
                                                <img
                                                    src={profilePic}
                                                    alt={participantData.fullName}
                                                    className={`w-12 h-12 rounded-full object-cover border-2 shadow-md ${online ? 'border-green-400' : 'border-slate-300'
                                                        }`}
                                                />
                                            ) : (
                                                <div
                                                    className={`w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-base font-bold text-white border-2 shadow-md ${online ? 'border-green-400' : 'border-slate-300'
                                                        }`}
                                                >
                                                    {(participantData.fullName || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}

                                            {/* Online Status Indicator */}
                                            <div
                                                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${online ? 'bg-green-500 animate-pulse' : 'bg-slate-400'
                                                    }`}
                                            />

                                            {/* Rank Badge (if available) */}
                                            {p.rank && (
                                                <div className="absolute -top-1 -left-1 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md border border-white flex items-center gap-0.5">
                                                    <Crown size={8} />
                                                    #{p.rank}
                                                </div>
                                            )}
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p
                                                    className={`text-sm font-semibold truncate ${isMe ? 'text-indigo-900' : 'text-slate-800'
                                                        }`}
                                                >
                                                    {participantData.fullName || 'Unknown User'}
                                                </p>
                                                {isCreator && (
                                                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shadow-sm">
                                                        Host
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                {isMe && (
                                                    <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide">
                                                        You
                                                    </span>
                                                )}
                                                <span
                                                    className={`text-[10px] font-medium ${online ? 'text-green-600' : 'text-slate-400'
                                                        }`}
                                                >
                                                    {online ? '● Online' : '○ Offline'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Hover Stats Tooltip */}
                                        <div className="absolute left-full ml-2 top-0 bg-slate-900 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-48">
                                            <div className="font-bold mb-2 text-indigo-300">{participantData.fullName}</div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Games Played:</span>
                                                    <span className="font-semibold">Loading...</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Completion:</span>
                                                    <span className="font-semibold">--%</span>
                                                </div>
                                                <div className="text-[9px] text-slate-500 mt-2">
                                                    Hover to view full stats
                                                </div>
                                            </div>
                                            {/* Arrow */}
                                            <div className="absolute right-full top-4 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-slate-900"></div>
                                        </div>
                                    </li>
                                );
                            })}
                    </ul>
                </div>
            </div>
        </>
    );
}
