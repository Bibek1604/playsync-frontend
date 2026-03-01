// components/chat/GroupChat.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Users,
  Gamepad2,
  ChevronLeft,
  MapPin,
  Clock,
  Trash2,
  LogOut
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gameService } from '@/features/games/api/game-service'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useGameChat } from '@/features/chat/hooks/useGameChat'
import { ParticipantsSidebar } from '@/features/games/components/ParticipantsSidebar'
import { getSocket } from '@/lib/socket'

type Message = {
  id: string
  sender: string
  content: string
  timestamp: string
  isOwn: boolean
  isSystem?: boolean
}

export default function GroupChat() {
  /* Existing hooks */
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, accessToken } = useAuthStore()
  const gameId = params.gameId as string
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  /* --- NEW: Join Mutation & Logic (Offline) --- */
  const joinMutation = useMutation({
    mutationFn: (id: string) => gameService.join(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['myJoinedGames'] }); // Update Sidebar list
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to join game';
      if (msg.toLowerCase().includes('already joined')) {
        // Treat as success - just refresh data to be sure
        queryClient.invalidateQueries({ queryKey: ['game', gameId] });
      } else {
        alert(msg);
        router.push('/games/offline');
      }
    }
  });

  const { data: game, isLoading } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => gameService.getById(gameId),
    enabled: !!gameId
  });

  useEffect(() => {
    if (game && user && !isLoading) {
      const userId = user.id || (user as any)._id;
      const creatorId = typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId;
      const isCreator = userId?.toString() === creatorId?.toString();

      // Check if user has ANY participation record (ACTIVE or LEFT)
      const hasParticipationRecord = game.participants?.some(p => {
        const pId = typeof p.userId === 'object' ? (p.userId as any)._id : p.userId;
        return pId?.toString() === userId?.toString();
      });

      // Only auto-join if user is not creator and has NO participation record at all
      if (!isCreator && !hasParticipationRecord) {
        joinMutation.mutate(gameId);
      }
    }
  }, [game, user, isLoading, gameId]);

  // Listen for real-time participant updates
  useEffect(() => {
    if (!accessToken || !gameId) return;

    const socket = getSocket(accessToken);

    // Refresh game data when players join or leave
    const handlePlayerUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    };

    socket.on('game:player_joined', handlePlayerUpdate);
    socket.on('game:player_left', handlePlayerUpdate);

    return () => {
      socket.off('game:player_joined', handlePlayerUpdate);
      socket.off('game:player_left', handlePlayerUpdate);
    };
  }, [accessToken, gameId, queryClient]);
  /* ----------------------------------------- */

  /* --- NEW: Leave Mutation & Logic --- */
  const leaveMutation = useMutation({
    mutationFn: (id: string) => gameService.leave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['myJoinedGames'] }); // Update Sidebar list
      router.push('/games/offline');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Failed to leave game');
    }
  });

  const handleLeave = () => {
    if (confirm('Are you sure you want to leave this game?')) {
      leaveMutation.mutate(gameId);
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => gameService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['myJoinedGames'] }); // Update Sidebar list
      router.push('/games/offline');
    },
    onError: () => {
      alert('Failed to delete game');
    }
  })

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      deleteMutation.mutate(gameId)
    }
  }

  /* ... rest of the component state ... */
  /* --- Real Chat Hook --- */
  /* --- Real Chat Hook --- */
  const { messages, input, setInput, sendMessage, isLoading: chatLoading } = useGameChat(gameId);
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
      {/* Header - Professional & Clean */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md overflow-hidden">
                {game?.imageUrl ? (
                  <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
                ) : (
                  <Gamepad2 size={24} className="text-white" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-lg leading-tight">{isLoading ? 'Loading...' : game?.title}</h2>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {game?.currentPlayers || 0}/{game?.maxPlayers || 0} members
                  </span>
                  {game?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-emerald-500" />
                      {game.location}
                    </span>
                  )}
                  {game?.startTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-blue-500" />
                      {new Date(game.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical size={20} className="text-gray-600" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-2 animate-fade-in">
                  {(() => {
                    const userId = user?.id || (user as any)?._id;
                    const creatorId = game?.creatorId && (typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId);
                    const isCreator = userId && creatorId && userId.toString() === creatorId.toString();

                    // Find user's participation record
                    const userParticipation = game?.participants?.find(p => {
                      const pId = p.userId && typeof p.userId === 'object' ? (p.userId as any)._id : p.userId;
                      return pId && userId && pId.toString() === userId.toString();
                    });

                    if (isCreator) {
                      return (
                        <button
                          onClick={handleDelete}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete Game
                        </button>
                      );
                    }

                    if (userParticipation?.status === 'ACTIVE') {
                      return (
                        <button
                          onClick={handleLeave}
                          className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 transition-colors"
                        >
                          <LogOut size={16} />
                          Leave Game
                        </button>
                      );
                    }

                    if (userParticipation?.status === 'LEFT') {
                      return (
                        <button
                          onClick={() => {
                            joinMutation.mutate(gameId);
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 transition-colors"
                        >
                          <Users size={16} />
                          Rejoin Game
                        </button>
                      );
                    }

                    return <div className="px-4 py-2 text-sm text-gray-500">No actions available</div>;
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Participants Sidebar */}
        {game && (
          <ParticipantsSidebar
            participants={game.participants || []}
            creatorId={typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId}
          />
        )}

        {/* Main Content Area (Messages + Input) */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative z-0">
          {/* Messages Area - Clean, Modern */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
            {messages.length === 0 && !chatLoading && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}

            {messages.map((msg: any, idx) => {
              const isSystem = msg.type === 'system';
              // Safe ID extraction
              const getUserId = (u: any) => {
                if (!u) return null;
                return typeof u === 'object' ? (u._id || u.id) : u;
              };
              const msgUserId = getUserId(msg.user);
              // Current User ID
              const currentUserId = user?.id || (user as any)?._id;
              const isOwn = currentUserId && msgUserId && msgUserId.toString() === currentUserId.toString();

              const prevMsgUserId = idx > 0 ? getUserId(messages[idx - 1].user) : null;
              const showAvatar = !isOwn && !isSystem && (idx === 0 || prevMsgUserId !== msgUserId);

              if (isSystem) {
                return (
                  <div key={idx} className="flex justify-center my-4">
                    <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">{msg.content}</span>
                  </div>
                )
              }

              return (
                <div
                  key={msg._id || idx}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className={`flex max-w-[85%] sm:max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                    {/* Avatar */}
                    {!isOwn && (
                      <div className="w-8 h-8 flex-shrink-0 mb-1">
                        {showAvatar ? (
                          msg.user?.profilePicture ? (
                            <img src={msg.user.profilePicture} alt="User" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                              {(msg.user?.fullName || 'U').charAt(0).toUpperCase()}
                            </div>
                          )
                        ) : <div className="w-8" />}
                      </div>
                    )}

                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      {/* Always show name for other users' messages */}
                      {!isOwn && msg.user && (
                        <span className="text-xs font-semibold text-gray-600 mb-1 ml-1">
                          {msg.user?.fullName || msg.user?.username || 'Unknown User'}
                        </span>
                      )}
                      <div
                        className={`
                                px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                                ${isOwn
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-none'
                            : 'bg-gray-100 border border-gray-200 text-gray-800 rounded-bl-none'
                          }
                                `}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Premium Look */}
          <footer className="bg-white border-t border-gray-200 shadow-sm z-10">
            {(() => {
              // Check if participant
              const userId = user?.id || (user as any)?._id;

              // Check if user is ACTIVE participant
              const isActiveParticipant = game?.participants?.some((p: any) => {
                const pId = typeof p.userId === 'object' ? (p.userId as any)._id : p.userId;
                return pId?.toString() === userId?.toString() && p.status === 'ACTIVE';
              });

              const creatorId = game?.creatorId && (typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId);
              const isCreator = userId && creatorId && userId.toString() === creatorId.toString();

              // Can chat if: ACTIVE participant OR creator
              const canChat = isActiveParticipant || isCreator;

              return (
                <form
                  onSubmit={handleSend}
                  className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4"
                >
                  <button type="button" className="p-3 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                    <Paperclip size={20} className="text-gray-600" />
                  </button>
                  <button type="button" className="p-3 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                    <Smile size={20} className="text-gray-600" />
                  </button>

                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={canChat ? "Type a message..." : "Join the game to start chatting"}
                    disabled={!canChat}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-6 py-3.5
                                focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50
                                text-gray-900 placeholder-gray-500 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  />

                  {/* Leave Game Button for Active Participants */}
                  {(() => {
                    // Recalculate userId and isCreator in this scope
                    const currentUserId = user?.id || (user as any)?._id;
                    const gameCreatorId = game?.creatorId && (typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId);
                    const userIsCreator = currentUserId && gameCreatorId && currentUserId.toString() === gameCreatorId.toString();

                    const userParticipation = game?.participants?.find((p: any) => {
                      const pId = typeof p.userId === 'object' ? (p.userId as any)._id : p.userId;
                      return pId?.toString() === currentUserId?.toString();
                    });

                    // Show Leave button if: user is ACTIVE participant AND not the creator
                    if (userParticipation?.status === 'ACTIVE' && !userIsCreator) {
                      return (
                        <button
                          type="button"
                          onClick={handleLeave}
                          className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-all shadow-sm border border-red-200 hover:border-red-300 font-medium text-sm"
                        >
                          <LogOut size={18} />
                          <span className="hidden sm:inline">Leave</span>
                        </button>
                      );
                    }
                    return null;
                  })()}

                  <button
                    type="submit"
                    className={`p-4 rounded-full transition-all shadow-md ${input.trim()
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    disabled={!input.trim() || !canChat}
                  >
                    <Send size={20} />
                  </button>
                </form>
              )
            })()}
          </footer>
        </div>

        {/* Participants Sidebar (Desktop: Static Right, Mobile: Slide-in Right) */}
        <aside className={`
            fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 z-50
            lg:relative lg:translate-x-0 lg:shadow-none lg:z-0
            ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <Users size={18} className="text-emerald-600" />
                Participants
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {game?.participants?.length || 0}
                </span>
              </h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-200 rounded-full text-gray-500"
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {game?.participants?.map((p: any) => {
                const pId = p.userId._id || p.userId;
                // Safe check for creator
                const creatorId = game?.creatorId && (typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId);
                const isOwner = creatorId && pId && creatorId.toString() === pId.toString();

                return (
                  <div key={pId} className="group flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100">
                    <div className="relative">
                      {p.userId.profilePicture ? (
                        <img src={p.userId.profilePicture} alt={p.userId.fullName} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm">
                          {(p.userId.fullName || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate flex items-center gap-1">
                        {p.userId.fullName}
                        {isOwner && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 rounded border border-yellow-200">HOST</span>}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">Joined {new Date(p.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}

              {(!game?.participants || game.participants.length === 0) && (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <Users size={32} className="mb-2 opacity-20" />
                  <p className="text-sm">No participants yet</p>
                </div>
              )}
            </div>

            {/* Optional: Add Invite Button or similar here */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/30">
              <button className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm font-medium hover:bg-gray-50 hover:border-emerald-300 hover:text-emerald-600 transition-all flex items-center justify-center gap-2">
                <Users size={16} />
                Invite Friends
              </button>
            </div>
          </div>
        </aside>

        {/* Backdrop for Mobile Sidebar */}
        {
          isMenuOpen && (
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
          )
        }
      </div >

    </div >
  )
}