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
  ChevronLeft
} from 'lucide-react'

type Message = {
  id: string
  sender: string
  content: string
  timestamp: string
  isOwn: boolean
  isSystem?: boolean
}

export default function GroupChat() {
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
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={24} className="text-gray-700" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                <Gamepad2 size={24} className="text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Ranked Squad Chat</h2>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Users size={14} />
                  7 online • 12 members
                </p>
              </div>
            </div>
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical size={20} className="text-gray-600" />
          </button>
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
                  ${
                    msg.isSystem
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
            className={`p-4 rounded-full transition-all shadow-md ${
              input.trim()
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