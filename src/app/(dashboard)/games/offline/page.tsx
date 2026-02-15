'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gamepad2, Search, FolderOpen, Clock, Star, Download, Play, Plus, Loader2, MapPin, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService } from '@/features/games/api/game-service';
import CreateGameModal from '@/features/games/components/CreateGameModal';
import { useAuthStore } from '@/features/auth/store/auth-store';

export default function OfflineGamesLibrary() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Delete Game Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => gameService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
    onError: (error) => {
      alert('Failed to delete game');
    }
  });

  const handleDelete = (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation(); // Prevent navigation
    if (confirm('Are you sure you want to delete this game?')) {
      deleteMutation.mutate(gameId);
    }
  };

  // Fetch Offline Games
  const { data, isLoading } = useQuery({
    queryKey: ['games', 'OFFLINE', searchQuery],
    queryFn: () => gameService.getAll({
      category: 'OFFLINE',
      search: searchQuery
    })
  });

  const games = data?.games || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Offline Games</h1>
            <p className="text-gray-500 font-medium">Manage your local game library</p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black shadow-lg shadow-gray-200 hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Add Game
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search your games..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm font-medium"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      )}

      {/* Games Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.map((game) => (
          <div
            key={game._id}
            className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 border border-gray-100 hover:-translate-y-1 group flex flex-col justify-between h-full"
          >
            <div>
              {/* Game Icon & Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                  {game.imageUrl ? (
                    <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
                  ) : (
                    '🎮'
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 leading-tight line-clamp-1">{game.title}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(game.tags || []).slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3 mb-5">
                {/* Location */}
                {game.location && (
                  <div className="flex items-center gap-2 text-gray-500 font-medium text-sm line-clamp-1">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{game.location}</span>
                  </div>
                )}

                {/* Event Time */}
                <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                  <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Event Time</span>
                    <span>
                      {new Date(game.startTime || game.createdAt).toLocaleDateString()} • {new Date(game.startTime || game.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar (Mock for now as backend doesn't track progress yet) */}
              <div className="mb-6">
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `0%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs font-bold text-gray-400 text-right">
                  0% complete
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/games/offline/${game._id}`)}
                className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-slate-200 hover:shadow-emerald-200 transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Play Game
              </button>

              {/* Delete Button (Creator Only) - Safe Access */}
              {(() => {
                const userId = user?.id || (user as any)?._id;
                const creatorId = typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId;
                const isCreator = userId && creatorId && userId.toString() === creatorId.toString();

                return isCreator && (
                  <button
                    onClick={(e) => handleDelete(e, game._id)}
                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-200"
                    title="Delete Game"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      {/* Empty/Add More Card - Adjusted for grid */}
      {!isLoading && games.length === 0 && (
        <div className="bg-white/60 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No offline games found</h3>
          <p className="text-gray-600 mb-6">Add your installed games to manage them here!</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Download className="w-5 h-5" />
            Add New Game
          </button>
        </div>
      )}

      <CreateGameModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        category="OFFLINE"
      />
    </div>
  );
}