"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { tournamentService } from '@/features/tournaments/api/tournament-service';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/lib/constants";
import { Send, Lock, Loader2, MessageSquare, Trophy, Crown, Users, ChevronRight, Search } from "lucide-react";

interface ChatMessage {
    _id: string;
    userId: { _id: string; fullName: string; avatar?: string };
    content: string;
    createdAt: string;
}

interface ParticipantInfo {
    _id: string;
    fullName: string;
    avatar?: string;
    joinedAt?: string;
}

interface ParticipantsPayload {
    creator: ParticipantInfo;
    members: ParticipantInfo[];
}

const msgCache = new Map<string, ChatMessage[]>();
const participantsCache = new Map<string, ParticipantsPayload>();

function mergeMessages(existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
    const seen = new Set(existing.map((m) => m._id));
    const novel = incoming.filter((m) => !seen.has(m._id));
    if (novel.length === 0) return existing;
    return [...existing, ...novel].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

export default function AdminChatsPage() {
    const { user, isHydrated, isAuthenticated, accessToken } = useAuthStore();
    const isReady = isHydrated && isAuthenticated && (user as any)?.role === 'admin';

    const { data: tournaments, isLoading: tournamentsLoading } = useQuery({
        queryKey: ['tournaments'],
        queryFn: () => tournamentService.getAll(),
        enabled: isReady
    });

    const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const activeTournaments = tournaments?.filter((t: any) => t.status === "open" || t.status === "OPEN") || [];
    const filteredTournaments = activeTournaments.filter((t: any) => t.title?.toLowerCase().includes(searchQuery.toLowerCase()));

    const selectedTournament = activeTournaments.find((t: any) => t._id === selectedTournamentId);

    // Chat states
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [text, setText] = useState("");
    const [participants, setParticipants] = useState<ParticipantsPayload | null>(null);
    const [showParticipants, setShowParticipants] = useState(true);
    const socketRef = useRef<Socket | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Load initial cache for newly selected tournament
    useEffect(() => {
        if (selectedTournamentId) {
            setMessages(msgCache.get(selectedTournamentId) ?? []);
            setParticipants(participantsCache.get(selectedTournamentId) ?? null);
        } else {
            setMessages([]);
            setParticipants(null);
        }
    }, [selectedTournamentId]);

    // Keep cache updated
    useEffect(() => {
        if (selectedTournamentId && messages.length > 0) {
            msgCache.set(selectedTournamentId, messages);
        }
    }, [selectedTournamentId, messages]);

    const applyHistory = useCallback((history: ChatMessage[]) => {
        setMessages((prev) => mergeMessages(prev, history));
    }, []);

    const appendMessage = useCallback((msg: ChatMessage) => {
        setMessages((prev) => {
            if (prev.some((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
        });
    }, []);

    // Websocket connection
    useEffect(() => {
        if (!selectedTournamentId || !accessToken || !isReady) return;

        const socket = io(API_URL, {
            auth: { token: accessToken },
            query: { tournamentId: selectedTournamentId },
        });
        socketRef.current = socket;

        const joinRoom = () => socket.emit("tournament:join", { tournamentId: selectedTournamentId });
        joinRoom();
        socket.on("connect", joinRoom);

        socket.on("tournament:message", appendMessage);
        socket.on("tournament:history", applyHistory);

        socket.on("tournament:participants", (data: ParticipantsPayload) => {
            participantsCache.set(selectedTournamentId, data);
            setParticipants(data);
        });

        return () => {
            socket.off("connect", joinRoom);
            socket.disconnect();
        };
    }, [selectedTournamentId, accessToken, isReady, appendMessage, applyHistory]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!text.trim() || !socketRef.current || !selectedTournamentId) return;
        socketRef.current.emit("tournament:send", { tournamentId: selectedTournamentId, content: text.trim() });
        setText("");
    };

    if (!isReady) return null;

    return (
        <div className="h-[calc(100vh-8rem)] flex rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden">
            {/* ─── Sidebar ─────────────────────────────────────────────── */}
            <div className="w-80 flex flex-col border-r border-[#E5E7EB] bg-[#F8F9FA] shrink-0">
                <div className="p-4 border-b border-[#E5E7EB] bg-white">
                    <h2 className="text-lg font-extrabold text-[#1F2937]">Tournament Chats</h2>
                    <p className="text-xs text-[#6B7280] mt-0.5">Select a tournament to view chat</p>

                    <div className="relative mt-4">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Find tournament..."
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {tournamentsLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-5 h-5 animate-spin text-[#16A34A]" /></div>
                    ) : filteredTournaments.length === 0 ? (
                        <div className="text-center p-6 text-sm text-[#9CA3AF]">
                            No active tournaments found.
                        </div>
                    ) : (
                        filteredTournaments.map((t: any) => (
                            <button
                                key={t._id}
                                onClick={() => setSelectedTournamentId(t._id)}
                                className={`w-full text-left p-3 flex flex-col gap-1 rounded-xl transition-all border ${selectedTournamentId === t._id ? 'bg-[#F0FDF4] border-[#16A34A]' : 'bg-white border-transparent hover:border-[#E5E7EB]'}`}
                            >
                                <span className="font-bold text-sm text-[#1F2937] truncate">{t.title}</span>
                                <span className="text-[11px] font-medium text-[#6B7280]">
                                    {t.currentPlayers} / {t.maxPlayers} Players • {t.type}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* ─── Chat Pane ─────────────────────────────────────────────── */}
            {!selectedTournamentId ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#F0FDF4] flex items-center justify-center mb-4 text-[#16A34A]">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1F2937]">No Chat Selected</h3>
                    <p className="text-sm text-[#6B7280] mt-1 max-w-xs">
                        Select a tournament from the list on the left to monitor or join its chat.
                    </p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#1F2937]">{selectedTournament?.title}</h3>
                                <p className="text-xs text-[#6B7280]">
                                    {participants ? (participants.members.length + 1) : selectedTournament?.currentPlayers} participants connected
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowParticipants((v) => !v)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${showParticipants ? 'bg-[#F3F4F6] text-[#1F2937]' : 'bg-white text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F9FAFB]'}`}
                        >
                            <Users size={14} />
                            Members
                            <ChevronRight size={14} className={`transition-transform duration-200 ${showParticipants ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Messages Area */}
                        <div className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-center py-16 text-[#9CA3AF]">
                                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No messages yet. Say hello!</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMe = msg.userId._id === user?.id;
                                        const isHost = msg.userId._id === selectedTournament?.creatorId?._id || msg.userId._id === selectedTournament?.creator;

                                        return (
                                            <div key={msg._id} className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : ""}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm ${isHost ? "bg-gradient-to-br from-amber-400 to-orange-500" : isMe ? "bg-gradient-to-br from-emerald-400 to-emerald-600" : "bg-gradient-to-br from-blue-400 to-indigo-500"}`}>
                                                    {msg.userId.fullName?.[0]?.toUpperCase() || "?"}
                                                </div>
                                                <div className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                                                    <div className={`flex items-center gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                                                        <span className="text-xs font-semibold text-[#6B7280]">
                                                            {isMe ? "You" : msg.userId.fullName}
                                                        </span>
                                                        {isHost && (
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded text-amber-700 bg-amber-100">
                                                                <Crown size={10} /> HOST
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className={`px-4 py-2.5 text-sm shadow-sm ${isHost && !isMe
                                                            ? "bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl rounded-tl-sm"
                                                            : isMe
                                                                ? "bg-[#16A34A] text-white rounded-2xl rounded-tr-sm"
                                                                : "bg-white text-[#1F2937] border border-[#E5E7EB] rounded-2xl rounded-tl-sm"
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                    <span className="text-[10px] text-[#9CA3AF] mt-0.5 px-1">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-[#E5E7EB]">
                                <div className="flex items-center gap-2 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] p-1.5 focus-within:ring-2 focus-within:ring-[#16A34A]/20 focus-within:border-[#16A34A] transition-all">
                                    <input
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                                        placeholder="Type your message as admin..."
                                        className="flex-1 bg-transparent px-3 py-2 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!text.trim()}
                                        className="w-9 h-9 flex items-center justify-center bg-[#16A34A] hover:bg-[#15803D] text-white rounded-lg disabled:opacity-50 transition-colors shrink-0 shadow-sm"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Participants List */}
                        {showParticipants && (
                            <div className="w-64 shrink-0 bg-white border-l border-[#E5E7EB] flex flex-col">
                                <div className="px-4 py-3 bg-[#F8F9FA] border-b border-[#E5E7EB]">
                                    <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Members Directory</h4>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                                    {!participants ? (
                                        Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="flex items-center gap-3 px-3 py-2 animate-pulse">
                                                <div className="w-8 h-8 rounded-full bg-[#E5E7EB]" />
                                                <div className="h-3 w-20 bg-[#E5E7EB] rounded" />
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3 px-3 py-2 hover:bg-[#F8F9FA] rounded-lg cursor-default group transition-colors">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
                                                    {participants.creator?.fullName?.[0]?.toUpperCase() ?? "?"}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-[#1F2937] truncate group-hover:text-amber-700 transition-colors">
                                                        {participants.creator?.fullName ?? "Unknown"}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-0.5">Tournament Host</p>
                                                </div>
                                            </div>

                                            {participants.members.map((m) => (
                                                <div key={m._id} className="flex items-center gap-3 px-3 py-2 hover:bg-[#F8F9FA] rounded-lg cursor-default transition-colors">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br from-blue-400 to-indigo-500 shadow-sm">
                                                        {m.fullName?.[0]?.toUpperCase() ?? "?"}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-[#4B5563] truncate">
                                                            {m.fullName ?? "Unknown"}
                                                        </p>
                                                        <p className="text-[10px] text-[#9CA3AF] mt-0.5 uppercase font-medium">Player</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
