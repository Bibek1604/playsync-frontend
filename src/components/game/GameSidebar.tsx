"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/features/games/store/game-store';
import { useGameChat } from '@/features/chat/hooks/useGameChat';
import { gameService } from '@/features/games/api/game-service';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { LogOut, ChevronDown, ChevronUp, Gamepad2, ShieldAlert } from 'lucide-react';
import { toast } from '@/lib/toast';
import { ConfirmModal, useModal, Button } from '@/components/ui';
import { getImageUrl } from '@/lib/constants';

// New Chat Components
import { MessageBubble } from '@/features/chat/components/MessageBubble';
import { MessageInput } from '@/features/chat/components/MessageInput';
import { ParticipantsSidebar as SidebarParticipants } from '@/features/chat/components/ParticipantsSidebar';

export default function GameSidebar() {
    const router = useRouter();
    const { activeGame, leaveGame } = useGameStore();
    const { accessToken, user } = useAuthStore();
    const socket = getSocket(accessToken || undefined);

    const [isPlayersExpanded, setIsPlayersExpanded] = useState(true);
    const leaveModal = useModal();

    if (!activeGame) return null;

    const { messages, sendMessage } = useGameChat(activeGame._id);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleLeaveGame = async () => {
        try {
            await gameService.leave(activeGame._id);
            socket.emit('game:leave', activeGame._id);
            leaveGame();
            leaveModal.close();
            router.push('/games/online');
        } catch (error) {
            toast.error('Failed to leave game');
        }
    };

    const participantsData = useMemo(() => {
        if (!activeGame?.participants) return [];
        const creatorId = (activeGame.creatorId as any)?._id || (activeGame.creatorId as any)?.id || activeGame.creatorId;

        return activeGame.participants.map((p: any) => {
            const pUser = p.userId as any;
            const pId = pUser?._id || pUser?.id || p.userId;
            return {
                id: pId.toString(),
                name: pUser?.fullName || 'Anonymous Player',
                isOnline: p.status === 'ACTIVE',
                isHost: creatorId?.toString() === pId.toString(),
                avatar: pUser?.profilePicture
            };
        });
    }, [activeGame]);

    const currentUser = {
        id: user?.id || (user as any)?._id,
        name: user?.fullName || 'Me'
    };

    return (
        <div className="w-80 bg-white border-l border-gray-100 flex flex-col h-full shadow-2xl z-20">
            {/* Context Header */}
            <div className="p-4 bg-indigo-600 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:16px_16px]" />
                <div className="relative flex items-center gap-3">
                    <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md ring-1 ring-white/30">
                        <Gamepad2 size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xs font-black uppercase tracking-tight truncate leading-none mb-1 opacity-90" title={activeGame.title}>
                            {activeGame.title}
                        </h2>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-none">
                                {activeGame.status} / {activeGame.currentPlayers} joined
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Players Area (Compact Collapsible) */}
            <div className="border-b border-gray-50 transition-all duration-500">
                <button
                    onClick={() => setIsPlayersExpanded(!isPlayersExpanded)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 group-hover:scale-125 transition-transform" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Participants</span>
                    </div>
                    {isPlayersExpanded ? <ChevronUp size={14} className="text-gray-300" /> : <ChevronDown size={14} className="text-gray-300" />}
                </button>

                {isPlayersExpanded && (
                    <div className="px-2 pb-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="max-h-[140px] overflow-y-auto custom-scrollbar space-y-1">
                            {participantsData.map((p) => (
                                <div key={p.id} className="flex items-center gap-2.5 p-2 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all">
                                    <div className="relative shrink-0">
                                        {p.avatar ? (
                                            <img
                                                src={getImageUrl(p.avatar)}
                                                alt={p.name}
                                                className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/20 shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-[10px] font-black text-white shadow-md shadow-indigo-100 uppercase tracking-tighter">
                                                {p.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${p.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-gray-800 truncate">{p.name}</p>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{p.isHost ? 'Host' : 'Member'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Area (Main Focus) */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/20">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full opacity-20 filter grayscale">
                            <ShieldAlert size={32} className="mb-2 text-indigo-600" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-900">Synchronization Channel</p>
                        </div>
                    )}

                    {messages.map((msg: any, idx) => {
                        const msgUserId = msg.user?._id || msg.user?.id || msg.user;
                        const isOwn = currentUser.id && msgUserId?.toString() === currentUser.id.toString();

                        const prevMsg = idx > 0 ? messages[idx - 1] : null;
                        const prevUserId = prevMsg?.user?._id || prevMsg?.user?.id || prevMsg?.user;
                        const isGrouped = !msg.type && prevMsg && prevMsg.type !== 'system' && prevUserId?.toString() === msgUserId?.toString() && (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 5 * 60 * 1000);

                        if (msg.type === 'system') {
                            return (
                                <div key={idx} className="flex justify-center my-3">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-3 py-1 bg-white border border-gray-100 rounded-full shadow-sm">
                                        {msg.content}
                                    </span>
                                </div>
                            );
                        }

                        const creatorId = (activeGame.creatorId as any)?._id || (activeGame.creatorId as any)?.id || activeGame.creatorId;

                        return (
                            <MessageBubble
                                key={idx}
                                isOwn={isOwn}
                                isGrouped={isGrouped}
                                isHost={creatorId?.toString() === msgUserId?.toString()}
                                message={{
                                    id: msg.id || msg._id || idx.toString(),
                                    senderId: msgUserId?.toString(),
                                    senderName: msg.user?.fullName || 'Anonymous',
                                    senderAvatar: msg.user?.profilePicture,
                                    text: msg.content,
                                    timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date()
                                }}
                            />
                        );
                    })}
                </div>

                <div className="shrink-0 p-3 bg-white border-t border-gray-100">
                    <MessageInput
                        onSendMessage={sendMessage}
                        disabled={!accessToken}
                        placeholder="Send message..."
                    />
                </div>
            </div>

            {/* Context Actions */}
            <div className="p-3 bg-gray-50 border-t border-gray-100">
                <button
                    onClick={leaveModal.open}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm active:scale-95"
                >
                    <LogOut size={16} strokeWidth={2.5} />
                    <span>Terminate Session</span>
                </button>
            </div>

            <ConfirmModal
                isOpen={leaveModal.isOpen}
                onClose={leaveModal.close}
                onConfirm={handleLeaveGame}
                title="Disconnect Node?"
                message="Terminate neural resonance with this session? All unsynched data will be lost."
                confirmText="Disconnect"
                cancelText="Maintain Node"
                variant="danger"
            />
        </div>
    );
}
