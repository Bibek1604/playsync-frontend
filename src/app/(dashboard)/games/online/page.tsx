'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Clock, Users, Globe, Plus, Loader2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService } from '@/features/games/api/game-service';
import CreateGameModal from '@/features/games/components/CreateGameModal';
import { useAuthStore } from '@/features/auth/store/auth-store';

export default function OnlineGameLobbies() {
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

  // Fetch Online Games
  const { data, isLoading } = useQuery({
    queryKey: ['games', 'ONLINE', searchQuery],
    queryFn: () => gameService.getAll({
      category: 'ONLINE',
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
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Online Games</h1>
            <p className="text-gray-500 font-medium">Join multiplayer matches worldwide</p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Create Lobby
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search games..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && games.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Globe className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No active lobbies found</h3>
          <p className="text-gray-500 mt-2">Be the first to create a game lobby!</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-6 px-6 py-2 text-emerald-600 font-bold bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            Create Game
          </button>
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
                <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Ends: {new Date(game.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>
                    <span className="text-gray-900 font-bold">{game.currentPlayers}</span>/{game.maxPlayers} Players
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(game.currentPlayers / game.maxPlayers) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Join Button */}
            {/* Action Buttons */}
            <div className="flex gap-2">
              {(() => {
                const userId = user?.id || (user as any)?._id;
                const creatorId = typeof game.creatorId === 'object' ? (game.creatorId as any)._id : game.creatorId;
                const isCreator = userId && creatorId && userId.toString() === creatorId.toString();
                const isParticipant = game.participants?.some(p => p.userId?.toString() === userId?.toString());
                const isJoined = isCreator || isParticipant;

                return (
                  <button
                    onClick={() => router.push(`/games/online/${game._id}`)}
                    className={`flex-1 py-3 font-bold rounded-xl shadow-lg transition-all duration-300 transform active:scale-95 ${isJoined
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200'
                        : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-slate-200 hover:shadow-emerald-200'
                      }`}
                  >
                    {isJoined ? 'Enter Chat' : 'Join Lobby'}
                  </button>
                );
              })()}

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

      <CreateGameModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        category="ONLINE"
      />
    </div>
  );
}