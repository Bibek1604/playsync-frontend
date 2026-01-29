'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Clock, Users, Globe } from 'lucide-react';

export default function OnlineGameLobbies() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const lobbies = [
    {
      id: 1,
      gameTitle: 'Battle Arena',
      location: 'US East',
      time: '2 min',
      playersNeeded: 10,
      playersInLobby: 8,
      icon: '⚔️',
    },
    {
      id: 2,
      gameTitle: 'Cyber Clash',
      location: 'EU West',
      time: '5 min',
      playersNeeded: 12,
      playersInLobby: 10,
      icon: '🤖',
    },
    {
      id: 3,
      gameTitle: 'Speed Legends',
      location: 'Asia',
      time: 'Now',
      playersNeeded: 6,
      playersInLobby: 6,
      icon: '🏎️',
    },
    {
      id: 4,
      gameTitle: 'Squad Strike',
      location: 'US West',
      time: '1 min',
      playersNeeded: 8,
      playersInLobby: 5,
      icon: '🎯',
    },
    {
      id: 5,
      gameTitle: 'Tower Defense',
      location: 'EU East',
      time: '3 min',
      playersNeeded: 20,
      playersInLobby: 18,
      icon: '🏰',
    },
    {
      id: 6,
      gameTitle: 'Sniper Arena',
      location: 'US Central',
      time: '30 sec',
      playersNeeded: 2,
      playersInLobby: 1,
      icon: '🎮',
    },
  ];

  const filteredLobbies = lobbies.filter(lobby =>
    lobby.gameTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Online Games</h1>
            <p className="text-gray-500 font-medium">Join multiplayer matches</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm font-medium"
          />
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredLobbies.map((lobby) => (
          <div
            key={lobby.id}
            className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 border border-gray-100 hover:-translate-y-1 group"
          >
            {/* Game Icon & Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                {lobby.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800 leading-tight">{lobby.gameTitle}</h3>
            </div>

            {/* Info */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>{lobby.location}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Starts in {lobby.time}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                <Users className="w-4 h-4 text-purple-500" />
                <span>
                  <span className="text-gray-900 font-bold">{lobby.playersInLobby}</span>/{lobby.playersNeeded} Players
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(lobby.playersInLobby / lobby.playersNeeded) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Join Button */}
            <button
              onClick={() => router.push(`/games/offline/${lobby.id}`)}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-slate-200 hover:shadow-emerald-200 transition-all duration-300 transform active:scale-95"
            >
              Join Game
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}