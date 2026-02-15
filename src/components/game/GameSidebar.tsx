
import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/features/games/store/game-store';
import { useGameChat } from '@/features/chat/hooks/useGameChat';
import { gameService } from '@/features/games/api/game-service';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { Send, LogOut, Users, MessageSquare, Gamepad2, ChevronDown, ChevronUp } from 'lucide-react';

export default function GameSidebar() {
    const router = useRouter();
    const { activeGame, leaveGame } = useGameStore();
    const { accessToken, user } = useAuthStore();
    const socket = getSocket(accessToken || undefined);

    const [isPlayersExpanded, setIsPlayersExpanded] = useState(true);

    // If no active game, shouldn't occur in theory if layout handles it correctly
    if (!activeGame) return null;

    const { messages, input, setInput, sendMessage, isLoading: isChatLoading } = useGameChat(activeGame._id);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleLeaveGame = async () => {
        if (!confirm('Are you sure you want to leave the game?')) return;
        try {
            await gameService.leave(activeGame._id);
            socket.emit('game:leave', activeGame._id);
            leaveGame();
            router.push('/games/online');
        } catch (error) {
            console.error('Failed to leave game:', error);
            alert('Failed to leave game');
        }
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg z-20">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white shadow-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                        <Gamepad2 size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-sm truncate leading-tight" title={activeGame.title}>
                            {activeGame.title}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${activeGame.status === 'OPEN' ? 'bg-green-400' : 'bg-yellow-400'
                                }`} />
                            <span className="text-xs text-slate-400 capitalize">{activeGame.status?.toLowerCase() || 'unknown'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Players Section (Collapsible) */}
            <div className="border-b border-gray-100 bg-gray-50/50 transition-all duration-300">
                <button
                    onClick={() => setIsPlayersExpanded(!isPlayersExpanded)}
                    className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-gray-500 hover:bg-gray-100/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span>PLAYERS ({activeGame.currentPlayers}/{activeGame.maxPlayers})</span>
                    </div>
                    {isPlayersExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {isPlayersExpanded && (
                    <div className="px-3 pb-3 max-h-[160px] overflow-y-auto custom-scrollbar">
                        <ul className="space-y-1">
                            {activeGame.participants?.map((p: any) => {
                                const isMe = (p.userId._id || p.userId) === user?.id;
                                return (
                                    <li key={p.userId._id || p.userId} className={`flex items-center gap-3 p-2 rounded-md ${isMe ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-gray-100'
                                        }`}>
                                        <div className="relative">
                                            {p.userId.profilePicture ? (
                                                <img
                                                    src={p.userId.profilePicture}
                                                    alt={p.userId.fullName}
                                                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                    {(p.userId.fullName || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${p.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
                                                }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm truncate ${isMe ? 'font-semibold text-indigo-900' : 'text-gray-700'}`}>
                                                {p.userId.fullName || 'Unknown User'} {isMe && '(You)'}
                                            </p>
                                            <p className="text-[10px] text-gray-400 capitalize">{p.status?.toLowerCase()}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>

            {/* Chat Section */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
                <div className="px-4 py-2 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 flex items-center gap-2 text-xs font-semibold text-gray-500 shadow-sm">
                    <MessageSquare size={14} className="text-indigo-500" />
                    CHAT ROOM
                </div>

                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400/60 pb-8">
                            <MessageSquare size={32} className="mb-2 opacity-50" />
                            <p className="text-sm font-medium">No messages yet</p>
                            <p className="text-xs">Start the conversation!</p>
                        </div>
                    )}

                    {messages.map((msg: any, idx) => {
                        const isSystem = msg.type === 'system';
                        const isOwn = msg.user && msg.user._id === user?.id;
                        const showAvatar = !isOwn && !isSystem && (idx === 0 || messages[idx - 1].user?._id !== msg.user?._id);

                        if (isSystem) {
                            return (
                                <div key={idx} className="flex justify-center my-4 opacity-75">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-full border border-gray-200">
                                        {msg.content}
                                    </span>
                                </div>
                            );
                        }

                        return (
                            <div key={idx} className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                                <div className={`flex max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>

                                    {!isOwn && (
                                        <div className="w-8 h-8 flex-shrink-0 flex items-end">
                                            {showAvatar ? (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white">
                                                    {msg.user?.fullName?.charAt(0).toUpperCase()}
                                                </div>
                                            ) : <div className="w-8" />}
                                        </div>
                                    )}

                                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                        {!isOwn && showAvatar && (
                                            <span className="text-[10px] text-gray-500 mb-1 ml-1 font-medium">
                                                {msg.user?.fullName}
                                            </span>
                                        )}

                                        <div className={`relative px-4 py-2 text-sm shadow-sm transition-all hover:shadow-md ${isOwn
                                            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
                                            }`}>
                                            {msg.content}
                                            <div className={`absolute bottom-full mb-1 ${isOwn ? 'right-0' : 'left-0'} px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="absolute right-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-sm"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                    onClick={handleLeaveGame}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-rose-600 border border-red-100 rounded-xl text-sm font-semibold hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm hover:shadow"
                >
                    <LogOut size={16} />
                    <span>Leave Game</span>
                </button>
            </div>
        </div>
    );
}
