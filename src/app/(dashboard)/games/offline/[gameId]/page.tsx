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
  Loader2,
  Trash2,
  LogOut
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gameService } from '@/features/games/api/game-service'
import { useAuthStore } from '@/features/auth/store/auth-store'

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
  const { user } = useAuthStore()
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
      const msg = error?.response?.data?.message || 'Failed to join game';
      if (!msg.includes('Already joined')) {
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

      const isParticipant = game.participants?.some(p => {
        const pId = typeof p.userId === 'object' ? (p.userId as any)._id : p.userId;
        return pId?.toString() === userId?.toString();
      });

      if (!isCreator && !isParticipant) {
        joinMutation.mutate(gameId);
      }
    }
  }, [game, user, isLoading, gameId]);
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'System',
      content: 'Welcome to the Squad Chat! Everyone is ready to play 🔥',
      timestamp: '11:42 PM',
      isOwn: false,
      isSystem: true
    },
    {
      id: '2',
      sender: 'NinjaGamer',
      content: 'yo who’s carrying tonight? 😏',
      timestamp: '11:43 PM',
      isOwn: false
    },
    {
      id: '3',
      sender: 'PixelQueen',
      content: 'me obviously 💅',
      timestamp: '11:44 PM',
      isOwn: false
    },
    {
      id: '4',
      sender: 'You',
      content: 'Let’s go ranked, I’m feeling immortal today',
      timestamp: '11:45 PM',
      isOwn: true
    },
  ])

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fake typing simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 3000)
    }, 7000)

    return () => clearTimeout(timer)
  }, [])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')
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
                    const isParticipant = game?.participants?.some(p => p.userId && userId && p.userId.toString() === userId.toString());

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

                    if (isParticipant) {
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

                    return <div className="px-4 py-2 text-sm text-gray-500">No actions available</div>;
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Messages Area - Clean, Modern */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 bg-white">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            {!msg.isOwn && !msg.isSystem && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold mr-3 flex-shrink-0 shadow-sm">
                {msg.sender.slice(0, 2)}
              </div>
            )}

            <div className={`max-w-[70%] ${msg.isSystem ? 'mx-auto text-center' : ''}`}>
              {!msg.isOwn && !msg.isSystem && (
                <span className="text-xs text-gray-500 mb-1 block font-medium">
                  {msg.sender}
                </span>
              )}

              <div
                className={`
                  px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.isSystem
                    ? 'bg-gray-100 border border-gray-200 text-gray-700 italic max-w-lg mx-auto'
                    : msg.isOwn
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-none'
                      : 'bg-gray-100 border border-gray-200 text-gray-800 rounded-bl-none'
                  }
                `}
              >
                {msg.content}
              </div>

              <span className="text-xs text-gray-400 mt-1 block">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              ...
            </div>
            <span className="italic">Someone is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Premium Look */}
      <footer className="bg-white border-t border-gray-200 shadow-sm">
        <form
          onSubmit={handleSend}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4"
        >
          <button
            type="button"
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Paperclip size={20} className="text-gray-600" />
          </button>

          <button
            type="button"
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Smile size={20} className="text-gray-600" />
          </button>

          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-6 py-3.5
                     focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50
                     text-gray-900 placeholder-gray-500 transition-all shadow-sm"
          />

          <button
            type="submit"
            className={`p-4 rounded-full transition-all shadow-md ${input.trim()
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            disabled={!input.trim()}
          >
            <Send size={20} />
          </button>
        </form>
      </footer>
    </div>
  )
}