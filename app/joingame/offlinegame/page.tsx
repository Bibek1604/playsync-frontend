'use client';
import { useState } from 'react';
import { Gamepad2, Search, FolderOpen, Clock, Star, Download, Play } from 'lucide-react';

export default function OfflineGamesLibrary() {
  const [searchQuery, setSearchQuery] = useState('');

  const offlineGames = [
    {
      id: 1,
      gameTitle: 'Adventure Quest',
      genre: 'RPG',
      lastPlayed: '2 days ago',
      progress: 67,
      totalHours: 28.4,
      rating: 4.8,
      icon: '🗡️',
    },
    {
      id: 2,
      gameTitle: 'Space Survivor',
      genre: 'Roguelike',
      lastPlayed: 'Yesterday',
      progress: 100,
      totalHours: 41.2,
      rating: 4.6,
      icon: '🌌',
    },
    {
      id: 3,
      gameTitle: 'Puzzle Kingdom',
      genre: 'Puzzle',
      lastPlayed: '1 week ago',
      progress: 12,
      totalHours: 4.1,
      rating: 4.7,
      icon: '🧩',
    },
    {
      id: 4,
      gameTitle: 'Retro Racer 1989',
      genre: 'Racing',
      lastPlayed: 'Never',
      progress: 0,
      totalHours: 0,
      rating: 4.4,
      icon: '🏎️',
    },
    {
      id: 5,
      gameTitle: 'Neon Blade Runner',
      genre: 'Action',
      lastPlayed: '3 days ago',
      progress: 45,
      totalHours: 15.8,
      rating: 4.9,
      icon: '⚡',
    },
    {
      id: 6,
      gameTitle: 'Mystic Forest Tales',
      genre: 'Adventure',
      lastPlayed: '5 days ago',
      progress: 88,
      totalHours: 19.6,
      rating: 4.7,
      icon: '🌲',
    },
  ];

  const filteredGames = offlineGames.filter(game =>
    game.gameTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Offline Games</h1>
              <p className="text-gray-600">Play your installed games anywhere — no internet needed</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1"
            >
              {/* Game Icon & Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center text-3xl">
                  {game.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{game.gameTitle}</h3>
              </div>

              {/* Info */}
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2 text-gray-600">
                  <FolderOpen className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{game.genre}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Last played: {game.lastPlayed}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-gray-800">
                    Rating: {game.rating} • {game.totalHours}h played
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-5">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${game.progress}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-600 text-right">
                  {game.progress}% complete
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-200 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                {game.progress === 0 ? 'Start Game' : 'Continue Playing'}
              </button>
            </div>
          ))}

          {/* Empty/Add More Card */}
          {filteredGames.length === 0 && (
            <div className="col-span-full bg-white/60 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No games found</h3>
              <p className="text-gray-600 mb-6">Try searching again or download new games!</p>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                <Download className="w-5 h-5" />
                Download More Games
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}