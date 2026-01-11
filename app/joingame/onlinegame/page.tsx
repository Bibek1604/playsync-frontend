'use client';

import { useState } from 'react';
import { Gamepad2, Search, MapPin, Clock, Users, Globe } from 'lucide-react';

export default function OnlineGameLobbies() {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Online Games</h1>
              <p className="text-gray-600">Join multiplayer matches</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLobbies.map((lobby) => (
            <div
              key={lobby.id}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1"
            >
              {/* Game Icon & Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center text-3xl">
                  {lobby.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{lobby.gameTitle}</h3>
              </div>

              {/* Info */}
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{lobby.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Starts in {lobby.time}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-800">
                    {lobby.playersInLobby}/{lobby.playersNeeded} Players
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-5">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${(lobby.playersInLobby / lobby.playersNeeded) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Join Button */}
              <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-200 transition-all duration-300 hover:scale-105 active:scale-95">
                Join Game
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}