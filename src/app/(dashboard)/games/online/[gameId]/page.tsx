
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
    } catch (error) {
      console.error('Failed to leave game:', error);
      alert('Failed to leave game');
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

        <button
          onClick={handleLeaveGame}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-red-100"
        >
          <LogOut size={18} />
          Leave Game
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Participants (25%) */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Users size={14} />
              Participants
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            <ul className="space-y-1">
              {activeGame?.participants?.map((p: any) => {
                const isMe = (p.userId._id || p.userId) === user?.id;
                const status = p.status?.toLowerCase() || 'active';
                return (
                  <li key={p.userId._id || p.userId} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${isMe ? 'bg-indigo-50 border border-indigo-100 shadow-sm' : 'hover:bg-gray-50'
                    }`}>
                    <div className="relative">
                      {p.userId.profilePicture ? (
                        <img
                          src={p.userId.profilePicture}
                          alt={p.userId.fullName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-sm font-bold text-indigo-600 border-2 border-white shadow-sm">
                          {(p.userId.fullName || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isMe ? 'text-indigo-900' : 'text-gray-700'}`}>
                        {p.userId.fullName || 'Unknown User'}
                      </p>
                      <p className="text-[10px] text-gray-400 capitalize flex items-center gap-1">
                        {isMe && <span className="bg-indigo-100 text-indigo-600 px-1.5 rounded text-[9px] font-bold">YOU</span>}
                        {status}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

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
              const isOwn = msg.user && msg.user._id === user?.id;
              const showAvatar = !isOwn && !isSystem && (idx === 0 || messages[idx - 1].user?._id !== msg.user?._id);

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
                      {!isOwn && showAvatar && (
                        <span className="text-xs text-gray-500 mb-1 ml-1 font-semibold">
                          {msg.user?.fullName}
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
            <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message to everyone..."
                  className="w-full pl-5 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg hover:-translate-y-[calc(50%+1px)] active:translate-y-1/2"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
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