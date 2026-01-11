'use client';
import { useState } from 'react';
import { Gamepad2, Search, SlidersHorizontal, Clock, Star, Play, Download, Plus, Trophy, Filter } from 'lucide-react';

export default function OfflineGamesWorkspaceEnhanced() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastPlayed'); // lastPlayed | progress | title | rating

  const games = [
    { id: 1, title: 'Adventure Quest', genre: 'RPG', progress: 67, lastPlayed: '2 days ago', totalHours: 28.4, rating: 4.8, completed: false },
    { id: 2, title: 'Space Survivor', genre: 'Roguelike', progress: 100, lastPlayed: 'Yesterday', totalHours: 41.2, rating: 4.6, completed: true },
    { id: 3, title: 'Puzzle Kingdom', genre: 'Puzzle', progress: 12, lastPlayed: '1 week ago', totalHours: 4.1, rating: 4.7, completed: false },
    { id: 4, title: 'Retro Racer 1989', genre: 'Racing', progress: 0, lastPlayed: 'Never', totalHours: 0, rating: 4.4, completed: false },
    { id: 5, title: 'Neon Blade Runner', genre: 'Action', progress: 45, lastPlayed: '3 days ago', totalHours: 15.8, rating: 4.9, completed: false },
  ];

  const filteredGames = games
    .filter(game => game.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'progress') return b.progress - a.progress;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      // default: lastPlayed (you can implement real date sorting later)
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header with Stats */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">My Offline Collection</h1>
                <p className="text-slate-400 mt-1">
                  {games.length} games • {games.filter(g => g.completed).length} completed • {games.reduce((sum, g) => sum + g.totalHours, 0).toFixed(1)}h played
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl w-64 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <button className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 rounded-2xl p-5 border border-emerald-800/30">
            <p className="text-slate-400 text-sm">Most Played</p>
            <p className="text-2xl font-bold mt-1">Space Survivor</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 rounded-2xl p-5 border border-emerald-800/30">
            <p className="text-slate-400 text-sm">Achievement Progress</p>
            <p className="text-2xl font-bold mt-1">43%</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 rounded-2xl p-5 border border-emerald-800/30">
            <p className="text-slate-400 text-sm">Longest Session</p>
            <p className="text-2xl font-bold mt-1">4h 12m</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 rounded-2xl p-5 border border-emerald-800/30">
            <p className="text-slate-400 text-sm">Favorite Genre</p>
            <p className="text-2xl font-bold mt-1">RPG</p>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map(game => (
            <div key={game.id} className="group bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-900/20 transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-900 relative">
                <div className="absolute inset-0 flex items-center justify-center text-7xl font-black text-slate-600/30">
                  {game.title[0]}
                </div>
                {game.completed && (
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    100% Complete
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg group-hover:text-emerald-400 transition-colors">
                    {game.title}
                  </h3>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">{game.rating}</span>
                  </div>
                </div>

                <div className="flex gap-3 text-xs text-slate-400 mb-4">
                  <span>{game.genre}</span>
                  <span>•</span>
                  <span>{game.totalHours}h</span>
                </div>

                <div className="mb-5">
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                      style={{ width: `${game.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-slate-400">
                    <span>{game.progress}%</span>
                    <span>{game.lastPlayed}</span>
                  </div>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-medium hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md">
                  <Play className="w-5 h-5" />
                  {game.progress === 0 ? 'Play Now' : 'Continue'}
                </button>
              </div>
            </div>
          ))}

          {/* Add Game Placeholder */}
          <div className="border-2 border-dashed border-slate-600 rounded-2xl h-full min-h-[420px] flex flex-col items-center justify-center text-slate-500 hover:text-emerald-400 hover:border-emerald-500/50 transition-all cursor-pointer group">
            <Download className="w-12 h-12 mb-4 opacity-60 group-hover:opacity-100" />
            <span className="font-medium text-lg">Install New Game</span>
          </div>
        </div>
      </div>
    </div>
  );
}