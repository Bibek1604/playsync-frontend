"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { gameService } from '@/features/games/api/game-service';
import { useGameStore } from '@/features/games/store/game-store';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { useGameChat } from '@/features/chat/hooks/useGameChat';
import { getSocket } from '@/lib/socket';
import { Zap, ShieldAlert, MessageSquare, LogOut, Trash2, Smile } from 'lucide-react';
import { toast } from '@/lib/toast';
import { ConfirmModal, useModal, Button } from '@/components/ui';

import { ChatLayout } from '@/features/chat/components/ChatLayout';
import { ChatHeader } from '@/features/chat/components/ChatHeader';
import { ParticipantsSidebar } from '@/features/chat/components/ParticipantsSidebar';
import { MessageBubble } from '@/features/chat/components/MessageBubble';
import { MessageInput } from '@/features/chat/components/MessageInput';

/* ── date label helper ── */
function getDateLabel(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function GamePage() {
  const { gameId } = useParams() as { gameId: string };
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, user } = useAuthStore();

  const { enterGame, leaveGame, addParticipant, removeParticipant } = useGameStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const leaveModal = useModal();

  const { data: game, isLoading, error } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => gameService.getById(gameId),
    enabled: !!gameId,
    retry: 1,
  });

  const { messages, sendMessage } = useGameChat(gameId);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* ── scroll to bottom on new messages ── */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  /* ── Auth & participation guard ── */
  useEffect(() => {
    if (!game || !user || isLoading) return;
    const userId = user.id || (user as any)._id;
    const creatorId = typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId;
    const isCreator = userId && creatorId && userId.toString() === creatorId.toString();

    const isParticipant = game.participants?.some((p) => {
      const pId = typeof p.userId === 'object' ? (p.userId as any)._id || (p.userId as any).id : p.userId;
      return pId && userId && pId.toString() === userId.toString();
    });

    const isFull = (game.currentPlayers || 0) >= (game.maxPlayers || 0);
    if (isFull && !isCreator && !isParticipant) {
      toast.error('This game is at full capacity.');
      router.push('/games/online');
    }
  }, [game, user, isLoading, router]);

  /* ── Socket & store sync ── */
  useEffect(() => {
    if (!game || !accessToken) return;
    enterGame(game);
    const socket = getSocket(accessToken);
    socket.emit('game:join', gameId);

    const handlePlayerJoined = (payload: any) => {
      addParticipant(payload);
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    };
    const handlePlayerLeft = (payload: any) => {
      removeParticipant(payload.userId);
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    };

    socket.on('game:player_joined', handlePlayerJoined);
    socket.on('game:player_left', handlePlayerLeft);

    return () => {
      socket.off('game:player_joined', handlePlayerJoined);
      socket.off('game:player_left', handlePlayerLeft);
      leaveGame();
    };
  }, [game, accessToken, gameId, enterGame, leaveGame, addParticipant, removeParticipant, queryClient]);

  const handleLeaveGame = useCallback(async () => {
    try {
      await gameService.leave(gameId);
      const socket = getSocket(accessToken);
      socket.emit('game:leave', gameId);
      leaveGame();
      leaveModal.close();
      router.push('/games/online');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to leave game');
    }
  }, [gameId, accessToken, leaveGame, leaveModal, router]);

  /* ── Participants data ── */
  const participantsData = useMemo(() => {
    if (!game?.participants) return [];
    const creatorIdArr = typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId;
    return game.participants.map((p) => {
      const pUser = p.userId as any;
      const pId = pUser?._id || pUser?.id || p.userId;
      return {
        id: pId.toString(),
        name: pUser?.fullName || 'Anonymous Player',
        isOnline: p.status === 'ACTIVE',
        isHost: creatorIdArr?.toString() === pId.toString(),
        avatar: pUser?.profilePicture,
      };
    });
  }, [game]);

  const currentUser = useMemo(() => ({
    id: user?.id || (user as any)?._id,
    name: user?.fullName || 'Me',
  }), [user]);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 bg-[#F7F8FA]">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 animate-pulse flex items-center justify-center shadow-lg shadow-green-100">
          <Zap className="text-white" size={28} />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-500">Connecting to game...</p>
          <p className="text-xs text-gray-400 mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !game) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 bg-[#F7F8FA]">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
          <ShieldAlert size={32} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Game Not Found</h2>
        <p className="text-gray-400 text-sm font-medium mb-8 text-center max-w-xs">
          This game session doesn&apos;t exist or has ended.
        </p>
        <Button onClick={() => router.push('/games/online')} variant="primary" className="px-8 h-11 rounded-lg">
          Back to Games
        </Button>
      </div>
    );
  }

  const isCreator =
    currentUser.id &&
    (typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId)
      ?.toString() === currentUser.id.toString();

  return (
    <ChatLayout
      sidebar={
        <ParticipantsSidebar
          participants={participantsData}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      }
    >
      {/* Header */}
      <ChatHeader
        title={game.title}
        participantCount={game.currentPlayers}
        onMenuClick={() => setIsSidebarOpen((v) => !v)}
        action={
          isCreator ? (
            <Button
              onClick={leaveModal.open}
              variant="danger"
              size="sm"
              leftIcon={Trash2}
              className="rounded-lg h-9 px-4 font-bold text-xs"
            >
              End Session
            </Button>
          ) : (
            <Button
              onClick={leaveModal.open}
              variant="ghost"
              size="sm"
              leftIcon={LogOut}
              className="rounded-lg h-9 px-4 text-gray-500 hover:text-red-600 hover:bg-red-50 font-bold text-xs transition-all"
            >
              Leave
            </Button>
          )
        }
      />

      {/* ── Messages scroll area ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto chat-scrollbar px-4 md:px-10 py-6 space-y-0"
      >
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-5 select-none">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100">
              <span className="text-4xl">👋</span>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-gray-800">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1.5">
                Say hi to your teammates! Use {' '}
                <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                  <Smile size={13} /> emoji
                </span>{' '}
                to react
              </p>
            </div>
          </div>
        )}

        {/* Message list with date separators */}
        {messages.map((msg: any, idx: number) => {
          const msgDate = msg.createdAt ? new Date(msg.createdAt) : new Date();
          const prevMsg = idx > 0 ? messages[idx - 1] : null;
          const prevDate = prevMsg?.createdAt ? new Date(prevMsg.createdAt) : null;

          /* show date label when date changes */
          const showDateSep =
            !prevDate || new Date(msgDate).toDateString() !== new Date(prevDate).toDateString();

          /* system events */
          if (msg.type === 'system') {
            return (
              <div key={idx}>
                {showDateSep && <DateSeparator date={msgDate} />}
                <div className="flex justify-center my-4">
                  <div className="px-4 py-1.5 bg-white border border-gray-100 rounded-full shadow-sm">
                    <span className="text-[11px] font-semibold text-gray-400">{msg.text}</span>
                  </div>
                </div>
              </div>
            );
          }

          const msgUserId = msg.senderId;
          const isOwn = !!(currentUser.id && msgUserId?.toString() === currentUser.id.toString());

          const prevMsgUserId = prevMsg?.senderId;
          const isGrouped = !!(
            prevMsg &&
            prevMsg.type !== 'system' &&
            prevMsgUserId?.toString() === msgUserId?.toString() &&
            new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 5 * 60 * 1000
          );

          const creatorId =
            typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId;

          return (
            <div key={idx}>
              {showDateSep && <DateSeparator date={msgDate} />}
              <MessageBubble
                isOwn={isOwn}
                isGrouped={isGrouped}
                isHost={creatorId?.toString() === msgUserId?.toString()}
                message={{
                  id: msg._id || msg.id || String(idx),
                  senderId: msgUserId?.toString(),
                  senderName: msg.senderName || 'Anonymous',
                  senderAvatar: msg.senderAvatar,
                  text: msg.text,
                  timestamp: msgDate,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={sendMessage}
        disabled={!accessToken}
        placeholder="Message the team... (Enter to send)"
      />

      {/* Confirm modal */}
      <ConfirmModal
        isOpen={leaveModal.isOpen}
        onClose={leaveModal.close}
        onConfirm={handleLeaveGame}
        title={isCreator ? 'End Game Session?' : 'Leave Game?'}
        message={
          isCreator
            ? 'Are you sure you want to end this session? All players will be removed.'
            : 'Are you sure you want to leave this game?'
        }
        confirmText={isCreator ? 'End Session' : 'Leave Game'}
        cancelText="Cancel"
        variant="danger"
      />
    </ChatLayout>
  );
}

/* ── Date separator ── */
function DateSeparator({ date }: { date: Date }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap px-1">
        {getDateLabel(date)}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}