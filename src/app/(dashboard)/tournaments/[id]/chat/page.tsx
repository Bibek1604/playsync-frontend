"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Lock,
  Loader2,
  MessageSquare,
  Trophy,
  Crown,
  Users,
  ChevronRight,
} from "lucide-react";
import { tournamentApi, Tournament } from "@/features/tournaments/api/tournament.api";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/lib/constants";

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

// ─── Module-level cache ───────────────────────────────────────────────────────
// Survives React re-mounts / HMR / navigation so messages are never lost.
const msgCache = new Map<string, ChatMessage[]>();
const participantsCache = new Map<string, ParticipantsPayload>();

/** Merge incoming messages with existing ones, deduplicating by _id. */
function mergeMessages(existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const seen = new Set(existing.map((m) => m._id));
  const novel = incoming.filter((m) => !seen.has(m._id));
  if (novel.length === 0) return existing;
  const merged = [...existing, ...novel].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  return merged;
}

export default function TournamentChatPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;

  // ?verified=1 means we just completed payment — trust access optimistically
  // so the user doesn't see a flash of "Chat Access Restricted"
  const justPaid = searchParams.get("verified") === "1";

  const { user, accessToken } = useAuthStore();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [accessAllowed, setAccessAllowed] = useState<boolean | null>(justPaid ? true : null);
  // Hydrate from cache immediately so messages are visible before socket reconnects
  const [messages, setMessages] = useState<ChatMessage[]>(() => msgCache.get(id) ?? []);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<ParticipantsPayload | null>(
    () => participantsCache.get(id) ?? null
  );
  const [showParticipants, setShowParticipants] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Keep cache in sync whenever messages change
  useEffect(() => {
    if (messages.length > 0) msgCache.set(id, messages);
  }, [id, messages]);

  // Helper to add messages without losing existing ones
  const applyHistory = useCallback((history: ChatMessage[]) => {
    setMessages((prev) => mergeMessages(prev, history));
  }, []);

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m._id === msg._id)) return prev;
      const next = [...prev, msg];
      msgCache.set(id, next);
      return next;
    });
  }, [id]);

  // Check access + load tournament
  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }

    (async () => {
      setLoading(true);
      try {
        const [t, access] = await Promise.all([
          tournamentApi.getById(id),
          tournamentApi.checkChatAccess(id),
        ]);
        setTournament(t);
        // If we just paid, always allow — socket will reject on its own if something is wrong
        setAccessAllowed(justPaid ? true : access.allowed);
      } catch {
        // If access check fails for a just-paid user, keep them in — socket is the real gate
        if (!justPaid) setAccessAllowed(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user, justPaid, router]);

  // Socket connection (only if access granted)
  useEffect(() => {
    if (!accessAllowed || !accessToken) return;

    const socket = io(API_URL, {
      auth: { token: accessToken },
      query: { tournamentId: id },
    });
    socketRef.current = socket;

    const joinRoom = () => socket.emit("tournament:join", { tournamentId: id });
    joinRoom();
    // Re-join automatically after a socket reconnect (tab resume, network blip)
    socket.on("connect", joinRoom);

    socket.on("tournament:message", appendMessage);

    socket.on("tournament:history", (history: ChatMessage[]) => {
      // Merge — never wipe messages the user already sees
      applyHistory(history);
    });

    socket.on("tournament:participants", (data: ParticipantsPayload) => {
      participantsCache.set(id, data);
      setParticipants(data);
    });

    socket.on("tournament:error", ({ message }: { message: string }) => {
      if (message?.toLowerCase().includes("payment")) {
        setAccessAllowed(false);
      }
    });

    return () => {
      socket.off("connect", joinRoom);
      socket.disconnect();
    };
  }, [accessAllowed, accessToken, id, applyHistory, appendMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit("tournament:send", { tournamentId: id, content: text.trim() });
    setText("");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Access denied
  if (accessAllowed === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Chat Access Restricted</h2>
        <p className="text-slate-500 max-w-sm text-sm">
          Please complete payment to access this tournament chat.
        </p>
        <Link
          href={`/tournaments/${id}`}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition text-sm"
        >
          Pay & Join Tournament
        </Link>
      </div>
    );
  }

  const totalMembers = participants ? 1 + (participants.members?.length ?? 0) : tournament?.currentPlayers ?? 0;

  return (
    <div className="flex gap-3 h-[calc(100vh-8rem)] max-w-5xl mx-auto">
      {/* ─── Chat Column ─────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <Link href={`/tournaments/${id}`} className="text-slate-400 hover:text-slate-700 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-slate-800 text-sm">{tournament?.name}</h2>
            {tournament?.creatorId?._id === user?.id && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                <Crown className="w-2.5 h-2.5" /> HOST
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">Tournament Chat · {totalMembers} participants</p>
        </div>
        {/* Toggle participants panel */}
        <button
          onClick={() => setShowParticipants((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition border border-slate-100 shrink-0"
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Members</span>
          <ChevronRight className={`w-3 h-3 transition-transform ${showParticipants ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-slate-300">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId._id === user?.id;
            const isHost = msg.userId._id === tournament?.creatorId?._id;
            return (
              <div key={msg._id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${isHost ? "bg-linear-to-br from-amber-400 to-orange-500" : "bg-linear-to-br from-emerald-400 to-indigo-500"}`}>
                  {msg.userId.fullName?.[0]?.toUpperCase() || "?"}  
                </div>
                <div className={`max-w-xs lg:max-w-md ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                  <div className={`flex items-center gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
                    <span className="text-[10px] text-slate-400">{isMe ? "You" : msg.userId.fullName}</span>
                    {isHost && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">
                        <Crown className="w-2 h-2" /> HOST
                      </span>
                    )}
                  </div>
                  <div className={`px-3.5 py-2 rounded-2xl text-sm ${isHost && !isMe ? "bg-amber-50 border border-amber-200 text-slate-700 rounded-tl-sm" : isMe ? "bg-emerald-600 text-white rounded-tr-sm" : "bg-slate-100 text-slate-700 rounded-tl-sm"}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type a message…"
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            aria-label="Send message"
            onClick={sendMessage}
            disabled={!text.trim()}
            className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      </div>{/* end chat column */}

      {/* ─── Participants Panel ───────────────────────── */}
      {showParticipants && (
        <div className="w-52 shrink-0 flex flex-col rounded-2xl border border-slate-100 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Participants</span>
            <span className="ml-auto text-xs font-semibold text-slate-400">{totalMembers}</span>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {!participants ? (
              /* Skeleton while loading */
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 px-4 py-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 animate-pulse shrink-0" />
                  <div className="h-3 bg-slate-100 rounded animate-pulse flex-1" />
                </div>
              ))
            ) : (
              <>
                {/* Creator row */}
                <div className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-linear-to-br from-amber-400 to-orange-500">
                    {participants.creator?.fullName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {participants.creator?.fullName ?? "Unknown"}
                      {participants.creator?._id === user?.id && " (you)"}
                    </p>
                    <p className="text-[10px] text-amber-600 font-medium">Host</p>
                  </div>
                </div>

                {/* Member rows */}
                {participants.members.map((m) => (
                  <div key={m._id} className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-linear-to-br from-emerald-400 to-indigo-500">
                      {m.fullName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">
                        {m.fullName ?? "Unknown"}
                        {m._id === user?.id && " (you)"}
                      </p>
                      <p className="text-[10px] text-slate-400">Member</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
