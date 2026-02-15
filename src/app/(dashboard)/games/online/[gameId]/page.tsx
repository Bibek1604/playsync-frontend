
"use client";

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { gameService } from '@/features/games/api/game-service';
import { useGameStore } from '@/features/games/store/game-store';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { useGameChat } from '@/features/chat/hooks/useGameChat'; // Import hook
import { getSocket } from '@/lib/socket';
import { Game } from '@/types';
import { Send, LogOut, Users, MessageSquare, Gamepad2, ChevronDown, ChevronUp } from 'lucide-react'; // Icons
import { ParticipantsSidebar } from '@/features/games/components/ParticipantsSidebar';

export default function GamePage() {
  const { gameId } = useParams() as { gameId: string };
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, user } = useAuthStore();

  // Game Store Actions
  const {
    activeGame,
    enterGame,
    leaveGame,
    addParticipant,
    removeParticipant
  } = useGameStore();

  const [isPlayersExpanded, setIsPlayersExpanded] = useState(true);

  // 1. Fetch Game Data
  const { data: game, isLoading, error } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => gameService.getById(gameId),
    enabled: !!gameId,
    retry: 1
  });

  // 2. Chat Hook
  const { messages, input, setInput, sendMessage, isLoading: isChatLoading } = useGameChat(gameId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 3. Sync with Store & Socket Logic
  useEffect(() => {
    if (!game || !accessToken) return;

    // Enter Game Mode
    enterGame(game);
    const socket = getSocket(accessToken);

    // Join Lobby
    socket.emit('game:join', gameId, (response: any) => {
      if (!response?.success) {
        console.error('Failed to join game lobby:', response?.error);
      }
    });

    // Listeners
    const handlePlayerJoined = (payload: any) => {
      console.log('Player Joined:', payload);
      addParticipant(payload);
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    };

    const handlePlayerLeft = (payload: any) => {
      console.log('Player Left:', payload);
      removeParticipant(payload.userId);
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    };

    socket.on('game:player_joined', handlePlayerJoined);
    socket.on('game:player_left', handlePlayerLeft);

    // Cleanup
    return () => {
      socket.off('game:player_joined', handlePlayerJoined);
      socket.off('game:player_left', handlePlayerLeft);
      leaveGame();
    };
  }, [game, accessToken, gameId, enterGame, leaveGame, addParticipant, removeParticipant, queryClient]);


  // Handlers
  const handleLeaveGame = async () => {
    if (!confirm('Are you sure you want to leave the game?')) return;
    try {
      await gameService.leave(gameId);
      const socket = getSocket(accessToken);
      socket.emit('game:leave', gameId);
      leaveGame();
      router.push('/games/online');
    } catch (error: any) {
      console.error('Failed to leave game:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to leave game';
      alert(errorMessage);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <h2 className="text-xl font-bold mb-2">Game Not Found</h2>
        <button
          onClick={() => router.push('/games/online')}
          className="text-primary hover:underline"
        >
          Return to Lobby
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Top Bar: Game Info & Actions */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-sm">
            <Gamepad2 size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">{game.title}</h1>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${game.status === 'OPEN' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{game.status}</span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-500">{activeGame?.currentPlayers || game.currentPlayers} / {game.maxPlayers} Players</span>
            </div>
          </div>
        </div>

        {/* Show Leave or Rejoin button based on participant status */}
        {(() => {
          const userId = user?.id;

          // Find user's participation record
          const userParticipation = game.participants?.find(p => {
            const pId = typeof p.userId === 'object' ? (p.userId as any)._id || (p.userId as any).id : p.userId;
            return pId && userId && pId.toString() === userId.toString();
          });

          // Check if user is creator
          const creatorId = typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId;
          const isCreator = userId && creatorId && userId.toString() === creatorId.toString();

          if (userParticipation?.status === 'ACTIVE' && !isCreator) {
            // User is active participant (not creator) - show Leave button
            return (
              <button
                onClick={handleLeaveGame}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-red-100"
              >
                <LogOut size={18} />
                Leave Game
              </button>
            );
          } else if (userParticipation?.status === 'LEFT') {
            // User has left - show Rejoin button
            return (
              <button
                onClick={async () => {
                  try {
                    await gameService.join(gameId);
                    queryClient.invalidateQueries({ queryKey: ['game', gameId] });
                  } catch (error) {
                    console.error('Failed to rejoin game:', error);
                    alert('Failed to rejoin game');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-green-100"
              >
                <Users size={18} />
                Rejoin Game
              </button>
            );
          }

          return null;
        })()}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Participants Sidebar */}
        {game && (
          <ParticipantsSidebar
            participants={activeGame?.participants || game.participants || []}
            creatorId={typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId}
          />
        )}

        {/* Center Panel: Chat (Main Focus) */}
        <div className="flex-1 flex flex-col bg-[#F3F4F6] relative">
          {/* Chat Header (Optional for mobile context mainly) */}
          <div className="md:hidden p-2 bg-white border-b border-gray-200 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
            Game Chat
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600">No messages yet</h3>
                <p className="text-sm">Be the first to say hello!</p>
              </div>
            )}

            {messages.map((msg: any, idx) => {
              const isSystem = msg.type === 'system';

              // Helper for safe ID extraction
              const getUserId = (u: any) => {
                if (!u) return null; // Handle null/undefined
                return typeof u === 'object' ? (u._id || u.id) : u;
              };

              const msgUserId = getUserId(msg.user);
              const isOwn = user?.id && msgUserId === user.id;

              const prevMsgUserId = idx > 0 ? getUserId(messages[idx - 1].user) : null;
              const showAvatar = !isOwn && !isSystem && (idx === 0 || prevMsgUserId !== msgUserId);

              if (isSystem) {
                return (
                  <div key={idx} className="flex justify-center my-6">
                    <div className="px-4 py-1.5 bg-gray-200/50 backdrop-blur-sm text-gray-500 text-xs font-semibold rounded-full border border-gray-200/50 uppercase tracking-wider shadow-sm">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                  <div className={`flex max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>

                    {!isOwn && (
                      <div className="w-10 h-10 flex-shrink-0 flex items-end">
                        {showAvatar ? (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-md ring-2 ring-white">
                            {msg.user?.fullName?.charAt(0).toUpperCase()}
                          </div>
                        ) : <div className="w-10" />}
                      </div>
                    )}

                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      {/* Always show name for other users' messages */}
                      {!isOwn && msg.user && (
                        <span className="text-xs font-semibold text-gray-600 mb-1 ml-1">
                          {msg.user?.fullName || msg.user?.username || 'Unknown User'}
                        </span>
                      )}

                      <div className={`relative px-5 py-3 text-[15px] shadow-sm transition-all hover:shadow-md ${isOwn
                        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
                        }`}>
                        {msg.content}
                        <div className={`absolute bottom-full mb-2 ${isOwn ? 'right-0' : 'left-0'} px-2.5 py-1.5 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-xl font-medium tracking-wide`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Output */}
          <div className="p-4 bg-white border-t border-gray-200">
            {(() => {
              const userId = user?.id || (user as any)?._id;

              // Check if user is ACTIVE participant
              const isActiveParticipant = game?.participants?.some((p: any) => {
                const pId = typeof p.userId === 'object' ? (p.userId as any)._id : p.userId;
                return pId?.toString() === userId?.toString() && p.status === 'ACTIVE';
              });

              // Creator is always a participant owner
              const creatorId = typeof game?.creatorId === 'object' ? (game.creatorId as any)._id : game?.creatorId;
              const isCreator = userId && creatorId && userId.toString() === creatorId.toString();

              // Can chat if: ACTIVE participant OR creator
              const canChat = isActiveParticipant || isCreator;

              return (
                <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={canChat ? "Type a message to everyone..." : "Join the game to chat"}
                      disabled={!canChat}
                      className="w-full pl-5 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || !canChat}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg hover:-translate-y-[calc(50%+1px)] active:translate-y-1/2"
                    >
                      <Send size={18} />
                    </button>
                  </div>

                  {/* Leave Game Button for Active Participants */}
                  {(() => {
                    // Recalculate userId and isCreator in this scope
                    const currentUserId = user?.id || (user as any)?._id;
                    const gameCreatorId = game?.creatorId && (typeof game.creatorId === 'object' ? (game.creatorId as any)._id || (game.creatorId as any).id : game.creatorId);
                    const userIsCreator = currentUserId && gameCreatorId && currentUserId.toString() === gameCreatorId.toString();

                    const userParticipation = game?.participants?.find((p: any) => {
                      const pId = typeof p.userId === 'object' ? (p.userId as any)._id || (p.userId as any).id : p.userId;
                      return pId?.toString() === currentUserId?.toString();
                    });

                    // Show Leave button if: user is ACTIVE participant AND not the creator
                    if (userParticipation?.status === 'ACTIVE' && !userIsCreator) {
                      return (
                        <button
                          type="button"
                          onClick={handleLeaveGame}
                          className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all shadow-sm border border-red-200 hover:border-red-300 font-medium text-sm shrink-0"
                        >
                          <LogOut size={18} />
                          <span className="hidden sm:inline">Leave</span>
                        </button>
                      );
                    }
                    return null;
                  })()}
                </form>
              );
            })()}
            <div className="text-center mt-2">
              <p className="text-[10px] text-gray-400">
                Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-500 font-sans">Enter</kbd> to send
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}