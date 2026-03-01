"use client";

import React, { useState } from 'react';
import { Search, Trophy, TrendingUp, ArrowUpRight, Crown, Medal, Star, Zap, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { leaderboardService } from '@/features/leaderboard/api/leaderboard-service';
import { scorecardService } from '@/features/scorecard/api/scorecard-service';
import { API_URL, getImageUrl } from '@/lib/constants';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { Avatar } from '@/components/ui';

const rankConfig = [
    { icon: Crown, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', label: '1st Place' },
    { icon: Trophy, color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200', label: '2nd Place' },
    { icon: Medal, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', label: '3rd Place' },
];

export default function RankingsPage() {
    const router = useRouter();
    const currentUser = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => { setMounted(true); }, []);

    const { data: players = [], isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: () => leaderboardService.getLeaderboard({ limit: 50, page: 1, period: 'all' })
    });

    const { data: scorecard } = useQuery({
        queryKey: ['scorecard'],
        queryFn: () => scorecardService.getMyScorecard(),
        enabled: isAuthenticated,
        staleTime: 30_000,
    });

    const myXp = scorecard?.xp ?? 0;
    const myLevel = scorecard?.level ?? 1;

    const myRank = React.useMemo(() => {
        const userId = (currentUser as any)?._id || currentUser?.id;
        const idx = players.findIndex((p: any) => p.userId === userId);
        return idx >= 0 ? idx + 1 : (scorecard?.rank ?? null);
    }, [players, currentUser, scorecard]);

    const filteredPlayers = players.filter((p: any) =>
        (p.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const top3 = players.slice(0, 3);
    const rest = filteredPlayers.slice(3);

    // Podium indices: [2nd, 1st, 3rd]
    const podiumOrder = top3.length >= 3 ? [players[1], players[0], players[2]] : players;
    const podiumRanks = top3.length >= 3 ? [1, 0, 2] : [0, 1, 2];

    return (
        <div className="max-w-6xl mx-auto space-y-12 py-8 animate-in">

            {/* Header Section */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-50/30 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-green-600 mb-4">
                        <Trophy size={12} className="fill-current" />
                        Global Standings
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                        Hall of <span className="text-green-600 italic">Legends</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg">
                        Recognizing the elite performers ranked by total XP growth.
                    </p>
                </div>

                <div className="relative w-full md:w-[320px] z-10">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search legends..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-4 focus:ring-green-50 focus:border-green-400 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Podium Section */}
            {!searchQuery && top3.length >= 3 && (
                <div className="grid grid-cols-3 gap-4 md:gap-8 items-end max-w-4xl mx-auto pt-8">
                    {podiumOrder.map((player, i) => {
                        const rankIdx = podiumRanks[i];
                        const cfg = rankConfig[rankIdx];
                        const isWinner = rankIdx === 0;

                        return (
                            <div key={i} className={`flex flex-col items-center ${isWinner ? 'order-2' : i === 0 ? 'order-1' : 'order-3'}`}>
                                <div className="relative mb-6">
                                    <div className={`rounded-full overflow-hidden ${isWinner ? 'w-24 h-24 ring-8 ring-green-100' : 'w-16 h-16 ring-4 ring-gray-100'} shadow-lg`}>
                                        <Avatar
                                            src={getImageUrl(player.avatar ?? undefined)}
                                            fallback={player.fullName ?? ''}
                                            size={isWinner ? 'xl' : 'lg'}
                                            className={`w-full h-full rounded-full ${isWinner ? 'border-4 border-amber-400' : 'border-2 border-gray-200'}`}
                                        />
                                    </div>
                                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-lg p-2 shadow-md ${cfg.bg} ${cfg.border} border-2`}>
                                        <cfg.icon className={`w-5 h-5 ${cfg.color} fill-current`} />
                                    </div>
                                </div>

                                <div className="text-center space-y-1">
                                    <h4 className={`font-bold tracking-tight ${isWinner ? 'text-xl' : 'text-base'} text-gray-900`}>
                                        {player.fullName}
                                    </h4>
                                    <p className="text-green-600 font-bold text-sm">
                                        {player.xp.toLocaleString()} <span className="text-[10px] text-gray-400 uppercase">XP</span>
                                    </p>
                                    <div className="flex justify-center">
                                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase">
                                            Lvl {player.level}
                                        </span>
                                    </div>
                                </div>

                                {/* Podium Base */}
                                <div
                                    className={`w-full mt-6 rounded-t-xl border-x border-t border-gray-100 flex items-center justify-center font-black text-gray-200 text-4xl shadow-inner`}
                                    style={{ height: isWinner ? '160px' : i === 0 ? '120px' : '100px', background: 'linear-gradient(180deg, #f9fafb 0%, white 100%)' }}
                                >
                                    {rankIdx + 1}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Rankings List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Current Rankings</h3>
                    <div className="flex gap-2">
                        <span className="text-xs font-semibold text-gray-400">Total Players:</span>
                        <span className="text-xs font-bold text-gray-900">{players.length}</span>
                    </div>
                </div>

                <div className="divide-y divide-slate-50 overflow-x-auto">
                    {(searchQuery ? filteredPlayers : rest).map((player: any, i: number) => {
                        const rank = searchQuery ? players.findIndex((p: any) => p.userId === player.userId) + 1 : i + 4;
                        const isMe = (currentUser as any)?._id === player.userId || currentUser?.id === player.userId;

                        return (
                            <div
                                key={i}
                                className={`flex items-center gap-6 p-5 transition-all hover:bg-gray-50 group cursor-pointer ${isMe ? 'bg-green-50/50' : ''}`}
                            >
                                <div className="w-8 flex justify-center text-sm font-bold text-gray-300 group-hover:text-green-600 transition-colors">
                                    #{rank}
                                </div>
                                <Avatar
                                    src={getImageUrl(player.avatar ?? undefined)}
                                    fallback={player.fullName ?? ''}
                                    size="sm"
                                    className="ring-2 ring-white shadow-sm"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h5 className="font-bold text-gray-900 truncate">{player.fullName}</h5>
                                        {isMe && (
                                            <span className="bg-green-100 text-green-700 text-[8px] font-bold px-1.5 py-0.5 rounded leading-none uppercase">You</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Level {player.level}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <p className="font-extrabold text-green-600 text-base leading-none">
                                        {player.xp.toLocaleString()} <span className="text-[8px] text-gray-400">XP</span>
                                    </p>
                                    <p className="text-[10px] font-bold text-green-500 uppercase">{player.wins} Wins</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Current User Summary Sticky Bottom */}
            {mounted && isAuthenticated && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
                    <div className="bg-white text-gray-900 rounded-2xl px-5 py-3.5 flex items-center gap-5 shadow-xl border border-gray-100">
                        <div className="flex items-center gap-2 pr-5 border-r border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                            <Trophy size={13} className="text-amber-400" />
                            Your Status
                        </div>
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={getImageUrl(((currentUser as any)?.profilePicture || (currentUser as any)?.avatar) ?? undefined)}
                                fallback={currentUser?.fullName ?? ''}
                                size="sm"
                                className="ring-2 ring-green-400"
                            />
                            <div>
                                <h4 className="font-bold text-sm leading-none mb-1 text-gray-900">{currentUser?.fullName}</h4>
                                <div className="flex items-center gap-3">
                                    <p className="text-[10px] font-bold text-green-600 uppercase">Lvl {myLevel}</p>
                                    <p className="text-[10px] font-bold text-green-600 uppercase">{myXp.toLocaleString()} XP</p>
                                </div>
                            </div>
                        </div>
                        <div className="pl-5 border-l border-gray-100">
                            <h3 className="text-2xl font-extrabold text-gray-900">#{myRank || '—'}</h3>
                            <p className="text-[9px] font-bold uppercase tracking-tighter text-gray-400">Global Rank</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
