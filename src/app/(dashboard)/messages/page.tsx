'use client';

import React, { useState } from 'react';
import {
    MessageSquare,
    Search,
    Users,
    ChevronRight,
    Loader2,
    ShieldCheck,
    FolderOpen,
    Sparkles
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { gameService } from '@/features/games/api/game-service';
import { tournamentService } from '@/features/tournaments/api/tournament-service';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { getImageUrl } from '@/lib/constants';
import Link from 'next/link';
import { Badge, Card, Button } from '@/components/ui';

export default function MessagesPage() {
    const { user } = useAuthStore();
    const currentUserId = String(user?.id || (user as any)?._id || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');

    const { data, isLoading } = useQuery({
        queryKey: ['myJoinedGames', user?.id],
        queryFn: async () => {
            const response = await gameService.getMyJoined({ limit: 50 });
            const currentTime = new Date();
            return {
                ...response,
                games: response.games.filter(game => {
                    const isStatusActive = game.status === 'OPEN' || game.status === 'FULL';
                    const isTimeActive = new Date(game.endTime) > currentTime;
                    return isStatusActive && isTimeActive;
                })
            };
        },
        enabled: !!user
    });

    const { data: tournamentsData, isLoading: tournamentsLoading } = useQuery({
        queryKey: ['tournaments'],
        queryFn: tournamentService.getAll,
        enabled: !!user,
    });

    const games = data?.games || [];
    const tournamentsArray = Array.isArray(tournamentsData) ? tournamentsData : (tournamentsData?.data as any[]) || [];
    const joinedTournaments = tournamentsArray.filter((t: any) => {
        const isClosed = String(t?.status || '').toUpperCase() === 'CLOSED';
        if (isClosed) return false;

        const participantMatch = Array.isArray(t?.participants) && t.participants.some((p: any) => {
            const pUserId = typeof p?.userId === 'object' ? (p.userId?._id || p.userId?.id) : p?.userId;
            return pUserId && String(pUserId) === currentUserId;
        });

        const paidMatch = Boolean(t?.isPaid) || String(t?.paymentStatus || '').toLowerCase() === 'success';
        return participantMatch || paidMatch;
    });

    const allLobbies = [
        ...games.map(g => ({
            ...g,
            isTournament: false,
            link: `/games/${g.category.toLowerCase()}/${g._id}`
        })),
        ...joinedTournaments.map(t => ({
            _id: t._id,
            title: t.title || t.name,
            category: t.type?.toUpperCase() || 'ONLINE',
            currentPlayers: t.currentPlayers,
            maxPlayers: t.maxPlayers,
            participants: t.participants || [],
            isTournament: true,
            link: `/tournaments/${t._id}/chat`
        }))
    ];

    const filteredGames = allLobbies.filter(lobby => {
        const matchesSearch = lobby.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'ALL' || lobby.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const isAnyLoading = isLoading || tournamentsLoading;

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-sm">
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-50/50 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-lg ring-4 ring-green-50">
                        <MessageSquare size={32} />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-100 rounded-full text-[10px] font-black uppercase tracking-widest text-green-600 mb-3">
                            <Sparkles size={12} className="fill-current" />
                            Active Game Chats
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">Messages</h1>
                        <p className="text-gray-400 font-medium">Chat with players in your active game sessions.</p>
                    </div>
                </div>

                <div className="relative z-10 flex bg-gray-50 p-1.5 rounded-xl border border-gray-100 items-center">
                    {['ALL', 'ONLINE', 'OFFLINE'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat as any)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat
                                ? 'bg-green-600 text-white shadow-md'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search game lobbies by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 text-gray-900 font-medium shadow-sm transition-all"
                    />
                </div>
                <div className="shrink-0 px-6 py-3.5 bg-white border border-gray-100 rounded-xl font-black text-sm text-gray-600 shadow-sm">
                    {filteredGames.length} Lobbies
                </div>
            </div>

            {/* Results */}
            {isAnyLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                        <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-400 w-5 h-5" />
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Loading</p>
                        <h3 className="text-lg font-bold text-gray-900">Fetching your game rooms...</h3>
                    </div>
                </div>
            ) : filteredGames.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600 mb-6">
                        <FolderOpen className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight text-center mb-2">No Active Lobbies</h3>
                    <p className="text-gray-500 font-medium mt-1 text-center max-w-sm">You aren&apos;t in any active game sessions. Join a game to start chatting.</p>
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Link href="/games/online">
                            <Button className="px-8 h-11 rounded-lg font-bold">
                                Browse Online Games
                            </Button>
                        </Link>
                        <Link href="/games/offline">
                            <Button variant="outline" className="px-8 h-11 rounded-lg font-bold">
                                Browse Offline Games
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGames.map((game) => (
                        <Link
                            key={`${game.isTournament ? 't' : 'g'}-${game._id}`}
                            href={game.link}
                            className="block group"
                        >
                            <Card className="p-0 overflow-hidden border-gray-100 bg-white hover:border-green-200 hover:shadow-lg transition-all duration-200">
                                <div className="p-6 flex items-center gap-5">
                                    <div className={`w-16 h-16 rounded-xl border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-3xl shadow-sm relative ${game.isTournament ? 'bg-amber-50 text-amber-500' : 'bg-gray-50'}`}>
                                        {game.isTournament ? "🏆" : (game as any).imageUrl ? (
                                            <img src={getImageUrl((game as any).imageUrl)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            "🎮"
                                        )}
                                        <div className="absolute top-1 right-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500 ring-2 ring-green-500/20" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-lg text-gray-900 truncate group-hover:text-green-600 transition-colors mb-1">{game.title}</h4>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant={game.category === 'ONLINE' ? 'success' : 'neutral'} size="sm">
                                                {game.category}
                                            </Badge>
                                            {game.isTournament && (
                                                <Badge variant="warning" size="sm">TOURNAMENT</Badge>
                                            )}
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                <Users size={11} className="text-green-500" />
                                                {game.currentPlayers}/{game.maxPlayers}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-300 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                                </div>

                                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            {game.participants?.slice(0, 3).map((p: any, i: number) => (
                                                <div key={i} className="w-6 h-6 rounded-full bg-white ring-2 ring-white border border-gray-100 overflow-hidden shadow-sm">
                                                    {(p.userId?.profilePicture || p.userId?.avatar) ? (
                                                        <img src={getImageUrl(p.userId.profilePicture || p.userId.avatar)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-green-100 flex items-center justify-center text-[9px] font-black text-green-700">
                                                            {((p.userId?.fullName || p.userId?.username || 'U') as string).charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {(game.participants?.length || 0) > 3 && (
                                                <div className="w-6 h-6 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-[8px] font-bold text-gray-600 shadow-sm">
                                                    +{(game.participants?.length || 0) - 3}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-green-600 font-black text-[10px] uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Live
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
