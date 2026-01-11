// app/games/offline/[gameId]/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Crown, Users, Circle, Send, Bot, Clock } from 'lucide-react'

type Player = {
  id: string
  username: string
  isHost: boolean
  isOnline: boolean
}

type Message = {
  id: string
  username: string
  content: string
  timestamp: string
  isSystem?: boolean
}

export default function OfflineGameLobby() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      username: 'System',
      content: 'Welcome to the lobby!',
      timestamp: '19:42',
      isSystem: true,
    },
    {
      id: '2',
      username: 'NinjaGamer',
      content: 'anyone ready for some chaos? 🔥',
      timestamp: '19:43',
    },
    {
      id: '3',
      username: 'PixelQueen',
      content: 'yesss lets gooo',
      timestamp: '19:44',
    },
  ])

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock players
  const players: Player[] = [
    { id: '1', username: 'You', isHost: true, isOnline: true },
    { id: '2', username: 'NinjaGamer', isHost: false, isOnline: true },
    { id: '3', username: 'PixelQueen', isHost: false, isOnline: true },
    { id: '4', username: 'ShadowByte', isHost: false, isOnline: false },
    { id: '5', username: 'FrostByte', isHost: false, isOnline: true },
  ]

  const playerCount = players.length
  const minPlayers = 2
  const canStart = playerCount >= minPlayers

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMsg: Message = {
      id: Date.now().toString(),
      username: 'You',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    setMessages(prev => [...prev, newMsg])
    setInput('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Background effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.12)_0%,transparent_50%)] animate-pulse-slow" />
      </div>

      <div className="relative z-10 flex flex-col h-screen max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-black/40 backdrop-blur-md border-b border-purple-900/30 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Local Party - Chaos Arena
              </h1>
              <div className="flex items-center gap-4 mt-1.5 text-sm text-slate-400">
                <span className="font-mono bg-slate-900/60 px-3 py-1 rounded-full border border-slate-700/60">
                  Room: X7K9P2M
                </span>
                <div className="flex items-center gap-1.5">
                  <Users size={16} />
                  <span>
                    {playerCount}/{8}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={16} />
                  <span>Waiting for host</span>
                </div>
              </div>
            </div>

            <div className="px-4 py-2 bg-emerald-900/30 border border-emerald-700/40 rounded-lg text-emerald-300 font-medium">
              Lobby • {playerCount} players
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Players sidebar */}
          <div className="w-80 border-r border-purple-900/30 bg-black/30 backdrop-blur-sm flex-shrink-0">
            <div className="p-4 border-b border-purple-900/30">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Users className="text-purple-400" />
                Players ({playerCount})
              </h2>
            </div>

            <div className="p-3 space-y-2 overflow-y-auto h-full">
              {players.map(player => (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    player.isHost
                      ? 'bg-purple-900/30 border border-purple-500/40'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center font-semibold text-sm">
                      {player.username.slice(0, 2)}
                    </div>

                    {player.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{player.username}</div>
                    <div className="text-xs text-slate-500">
                      {player.isHost ? 'Host' : 'Player'}
                    </div>
                  </div>

                  {player.isHost && (
                    <Crown size={18} className="text-yellow-400 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
              {messages.map(msg => (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {msg.isSystem ? <Bot size={18} /> : msg.username.slice(0, 2)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className={`font-medium ${msg.isSystem ? 'text-emerald-400' : 'text-white'}`}>
                        {msg.username}
                      </span>
                      <span className="text-xs text-slate-500">{msg.timestamp}</span>
                    </div>
                    <p className={`text-sm ${msg.isSystem ? 'italic text-emerald-300/90' : 'text-slate-100'}`}>
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            <div className="border-t border-purple-900/30 p-5 bg-black/40 backdrop-blur-md">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-900/60 border border-slate-700 rounded-xl px-5 py-3 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                  disabled={!canStart}
                />
                <button
                  type="submit"
                  className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canStart || !input.trim()}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="bg-black/60 backdrop-blur-md border-t border-purple-900/30 p-5">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="text-slate-400">
              {canStart ? (
                <span className="text-emerald-400 font-medium">Ready to play! ({playerCount} players)</span>
              ) : (
                <span>Waiting for more players... ({playerCount}/{minPlayers})</span>
              )}
            </div>

            <button
              className={`
                px-8 py-3.5 rounded-xl font-bold text-lg transition-all
                ${
                  canStart
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-900/40 hover:shadow-purple-700/60 transform hover:scale-105 active:scale-100'
                    : 'bg-slate-700 cursor-not-allowed opacity-60'
                }
              `}
              disabled={!canStart}
            >
              START GAME
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}