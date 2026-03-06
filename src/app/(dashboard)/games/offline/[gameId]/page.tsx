"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { gameService } from '@/features/games/api/game-service';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { useGameChat } from '@/features/chat/hooks/useGameChat';
import { getSocket } from '@/lib/socket';
import { Zap, ShieldAlert, MessageSquare, LogOut, Trash2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { ConfirmModal, useModal, Button } from '@/components/ui';

// New Chat Components
import { ChatLayout } from '@/features/chat/components/ChatLayout';
import { ChatHeader } from '@/features/chat/components/ChatHeader';
import { ParticipantsSidebar } from '@/features/chat/components/ParticipantsSidebar';
import { MessageBubble } from '@/features/chat/components/MessageBubble';
import { MessageInput } from '@/features/chat/components/MessageInput';

export default function OfflineGamePage() {
  const { gameId } = useParams() as { gameId: string };
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, user } = useAuthStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const leaveModal = useModal();
  const deleteModal = useModal();

  const { data: game, isLoading, error } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => gameService.getById(gameId),
    enabled: !!gameId,
    retry: 1
  });

  const { messages, sendMessage } = useGameChat(gameId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Join Mutation (Offline auto-join)
  const joinMutation = useMutation({
    mutationFn: (id: string) => gameService.join(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
    }
  });

  useEffect(() => {
    if (game && user && !isLoading) {
      const userId = user.id || (user as any)._id;
      const creatorId = typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId;
      const isCreator = userId?.toString() === creatorId?.toString();

      const hasParticipationRecord = game.participants?.some(p => {
        const pId = typeof p.userId === 'object' ? (p.userId as any)._id : p.userId;
        return pId?.toString() === userId?.toString();
      });

      const isFull = (game.currentPlayers || 0) >= (game.maxPlayers || 0);

      if (isFull && !isCreator && !hasParticipationRecord) {
        toast.error('Sector at capacity.');
        router.push('/games/offline');
        return;
      }

      if (!isCreator && !hasParticipationRecord && !isFull) {
        joinMutation.mutate(gameId);
      }
    }
  }, [game, user, isLoading, gameId]);

  const handleLeaveGame = async () => {
    try {
      await gameService.leave(gameId);
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
      leaveModal.close();
      router.push('/games/offline');
    } catch (error: any) {
      toast.error('Decoupling failed');
    }
  };

  const handleDeleteGame = async () => {
    try {
      await gameService.delete(gameId);
      deleteModal.close();
      router.push('/games/offline');
      toast.success('Sector deconstructed.');
    } catch {
      toast.error('Deconstruction failed');
    }
  };

  // Prepare participants data
  const participantsData = useMemo(() => {
    if (!game?.participants) return [];
    const creatorIdArr = typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId;

    // Remove duplicate participants by userId
    const seenIds = new Set<string>();
    const uniqueParticipants = game.participants.filter((p) => {
      const pUser = p.userId as any;
      const pId = pUser?._id || pUser?.id || p.userId;
      const idStr = pId.toString();
      if (seenIds.has(idStr)) return false;
      seenIds.add(idStr);
      return true;
    });

    return uniqueParticipants.map(p => {
      const pUser = p.userId as any;
      const pId = pUser?._id || pUser?.id || p.userId;
      return {
        id: pId.toString(),
        name: pUser?.fullName || 'Anonymous Player',
        isOnline: p.status === 'ACTIVE',
        isHost: creatorIdArr?.toString() === pId.toString(),
        avatar: pUser?.profilePicture
      };
    });
  }, [game]);

  const currentUser = {
    id: user?.id || (user as any)?._id,
    name: user?.fullName || 'Me'
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 bg-gray-50">
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

  if (error || !game) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 bg-gray-50">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
          <ShieldAlert size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Game Not Found</h2>
        <p className="text-gray-400 text-sm font-medium mb-8 text-center max-w-xs">This game session doesn't exist or has ended.</p>
        <Button onClick={() => router.push('/games/offline')} variant="primary" className="px-8 h-11 rounded-lg">
          Back to Games
        </Button>
      </div>
    );
  }

  const isCreator = currentUser.id && (typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId)?.toString() === currentUser.id.toString();

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
      <ChatHeader
        title={game.title}
        participantCount={game.currentPlayers}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        action={
          isCreator ? (
            <Button
              onClick={() => deleteModal.open()}
              variant="danger"
              size="sm"
              leftIcon={Trash2}
              className="rounded-lg h-9 px-4 font-bold text-xs"
            >
              End Session
            </Button>
          ) : (
            <Button
              onClick={() => leaveModal.open()}
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

      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scrollbar px-4 md:px-10 py-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-5 select-none">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100">
              <span className="text-4xl">👋</span>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-gray-800">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1.5">Say hi to your teammates!</p>
            </div>
          </div>
        )}

        {messages.map((msg: any, idx) => {
          if (msg.type === 'system') {
            return (
              <div key={idx} className="flex justify-center my-5">
                <div className="px-4 py-1.5 bg-white border border-gray-100 rounded-full shadow-sm">
                  <span className="text-[11px] font-semibold text-gray-400">{msg.content}</span>
                </div>
              </div>
            );
          }

          const msgUserId = msg.senderId || msg.user?._id || msg.user?.id || msg.user;
          const isOwn = currentUser.id && msgUserId?.toString() === currentUser.id.toString();

          const prevMsg = idx > 0 ? messages[idx - 1] : null;
          const prevUserId = prevMsg?.senderId || prevMsg?.user?._id || prevMsg?.user?.id || prevMsg?.user;
          const isGrouped = prevMsg && prevMsg.type !== 'system' && prevUserId?.toString() === msgUserId?.toString() && (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 5 * 60 * 1000);

          const creatorId = typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId;

          return (
            <MessageBubble
              key={idx}
              isOwn={isOwn}
              isGrouped={isGrouped}
              isHost={creatorId?.toString() === msgUserId?.toString()}
              message={{
                id: msg.id || msg._id || idx.toString(),
                senderId: msgUserId?.toString(),
                senderName: msg.senderName || msg.user?.fullName || 'Anonymous',
                senderAvatar: msg.senderAvatar || msg.user?.profilePicture,
                text: msg.text || msg.content,
                timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date()
              }}
            />
          );
        })}
      </div>

      <MessageInput
        onSendMessage={sendMessage}
        disabled={!accessToken}
      />

      <ConfirmModal
        isOpen={leaveModal.isOpen}
        onClose={leaveModal.close}
        onConfirm={handleLeaveGame}
        title="Leave Game?"
        message="Are you sure you want to leave this game?"
        confirmText="Leave Game"
        cancelText="Cancel"
        variant="danger"
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteGame}
        title="End Session?"
        message="This will permanently delete the game and remove all participants. Are you sure?"
        confirmText="End Session"
        cancelText="Cancel"
        variant="danger"
      />
    </ChatLayout>
  );
}