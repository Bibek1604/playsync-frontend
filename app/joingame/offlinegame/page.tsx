'use client';
import { useState } from 'react';
import { Gamepad2, FolderOpen, Clock, Star, ChevronRight, Download } from 'lucide-react';

export default function OfflineGames() {
  const [selectedGame, setSelectedGame] = useState(null);

  const offlineGames = [
    {
      id: 'adventure-quest',
      title: 'Adventure Quest',
      description: 'Epic single-player RPG with 40+ hours of story',
      playtime: '35-50h',
      rating: 4.8,
      image: '/games/adventure-quest.jpg', // you can replace with real paths
    },
    {
      id: 'space-survivor',
      title: 'Space Survivor',
      description: 'Roguelike survival in infinite procedurally generated space',
      playtime: 'Endless',
      rating: 4.6,
    },
    {
      id: 'puzzle-kingdom',
      title: 'Puzzle Kingdom',
      description: 'Relaxing yet challenging logic puzzles & brain teasers',
      playtime: '15-30h',
      rating: 4.7,
    },
    {
      id: 'retro-racer',
      title: 'Retro Racer 1989',
      description: 'Classic arcade racing with modern physics',
      playtime: '8-15h',
      rating: 4.4,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Offline Games
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose from your locally saved adventures — no internet needed
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {offlineGames.map((game) => (
            <div
              key={game.id}
              onClick={() => setSelectedGame(game.id === selectedGame ? null : game.id)}
              className={`group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${
                selectedGame === game.id ? 'ring-2 ring-emerald-500 shadow-emerald-200 scale-[1.02]' : ''
              }`}
            >
              {/* Game Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 relative">
                {/* You can add real images later */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-5xl font-bold opacity-30">
                  {game.title[0]}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-700 transition-colors">
                  {game.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-5 line-clamp-2">
                  {game.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{game.playtime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>{game.rating}</span>
                    </div>
                  </div>
                  
                  {selectedGame === game.id ? (
                    <button className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
                      Play Now
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-emerald-600 font-medium group-hover:text-emerald-700 flex items-center gap-1">
                      Select <ChevronRight className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state / Download more */}
        <div className="mt-16 text-center">
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <Download className="w-5 h-5" />
            Download More Offline Games
          </button>
        </div>
      </div>
    </div>
  );
}