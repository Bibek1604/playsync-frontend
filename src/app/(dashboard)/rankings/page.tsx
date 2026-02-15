"use client";
import React from 'react';
import { Crown, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { leaderboardService } from '@/features/leaderboard/api/leaderboard-service';
import { scorecardService } from '@/features/scorecard/api/scorecard-service';
import { API_URL } from '@/lib/constants';

import { useAuthStore } from '@/features/auth/store/auth-store';

export default function RankingsPage() {
    const user = useAuthStore((state) => state.user);

    const { data: leaderboardData, isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: () => leaderboardService.getLeaderboard({ limit: 50, page: 1, period: 'all' })
    });

    const { data: myScorecard, isLoading: isMyRankLoading } = useQuery({
        queryKey: ['myScorecard'],
        queryFn: scorecardService.getMyScorecard,
        enabled: !!user
    });

    const players = leaderboardData || [];
    const top1 = players[0];
    const top2 = players[1];
    const top3 = players[2];
    const restList = players.slice(3);

    const getAvatarUrl = (url?: string) => {
        if (!url) return null;
        return url.startsWith('http') ? url : `${API_URL}${url}`;
    };

    const getTier = (points: number = 0) => {
        if (points >= 3000) return 'Diamond';
        if (points >= 2000) return 'Platinum';
        if (points >= 1000) return 'Gold';
        if (points >= 500) return 'Silver';
        return 'Bronze';
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'Diamond': return 'text-cyan-500 bg-cyan-50';
            case 'Platinum': return 'text-violet-500 bg-violet-50';
            case 'Gold': return 'text-amber-500 bg-amber-50';
            case 'Silver': return 'text-slate-500 bg-slate-100';
            default: return 'text-orange-700 bg-orange-50'; // Bronze
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading rankings...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Global Rankings</h1>
                <p className="text-slate-500 mt-2 font-medium">Top performing players this season</p>
            </div>

            {/* My Rank Card */}
            {myScorecard && (
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg mb-8">
                    <div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Your Current Rank</p>
                        <h2 className="text-3xl font-black">
                            {myScorecard.rank ? `#${myScorecard.rank}` : 'Unranked'}
                            <span className="ml-3 text-lg font-medium text-slate-400">
                                {getTier(myScorecard.points || (myScorecard as any).totalPoints)} Tier
                            </span>
                        </h2>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-black text-emerald-400">{myScorecard.points || (myScorecard as any).totalPoints || 0}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase">Points</p>
                    </div>
                </div>
            )}

            {players.length > 0 ? (
                <>
                    {/* Top 3 Podium */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
                        {/* 2nd Place */}
                        {top2 && (
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center relative order-2 md:order-1 mt-8 md:mt-0">
                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-black flex items-center justify-center absolute -top-4 shadow-sm border-2 border-white">
                                    2
                                </div>
                                <div className="w-20 h-20 bg-slate-100 rounded-full mb-4 flex items-center justify-center overflow-hidden border-2 border-slate-50">
                                    {top2.userId.avatar ? (
                                        <img src={getAvatarUrl(top2.userId.avatar) || ''} alt={top2.userId.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-black text-slate-400">{top2.userId.fullName[0]}</span>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{top2.userId.fullName}</h3>
                                <p className="text-sm font-bold text-slate-400">{top2.points} pts</p>
                                <div className={`mt-4 px-3 py-1 rounded-full text-xs font-bold ${getTierColor(getTier(top2.points))}`}>
                                    {getTier(top2.points)}
                                </div>
                            </div>
                        )}

                        {/* 1st Place */}
                        {top1 && (
                            <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex flex-col items-center relative order-1 md:order-2 shadow-xl shadow-slate-200 transform md:-translate-y-4">
                                <div className="absolute -top-6">
                                    <Crown size={40} className="text-yellow-400 fill-yellow-400 drop-shadow-lg" />
                                </div>
                                <div className="w-24 h-24 bg-emerald-500 rounded-full mb-4 flex items-center justify-center overflow-hidden border-4 border-slate-800">
                                    {top1.userId.avatar ? (
                                        <img src={getAvatarUrl(top1.userId.avatar) || ''} alt={top1.userId.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-black text-slate-900">{top1.userId.fullName[0]}</span>
                                    )}
                                </div>
                                <h3 className="font-bold text-xl line-clamp-1">{top1.userId.fullName}</h3>
                                <p className="text-sm font-bold text-emerald-400">{top1.points} pts</p>
                                <div className="mt-6 w-full bg-white/10 rounded-xl p-3 text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Rank</p>
                                    <p className="font-bold text-yellow-400 text-lg">#1 Champion</p>
                                </div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {top3 && (
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center relative order-3 mt-8 md:mt-0">
                                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-black flex items-center justify-center absolute -top-4 shadow-sm border-2 border-white">
                                    3
                                </div>
                                <div className="w-20 h-20 bg-slate-100 rounded-full mb-4 flex items-center justify-center overflow-hidden border-2 border-slate-50">
                                    {top3.userId.avatar ? (
                                        <img src={getAvatarUrl(top3.userId.avatar) || ''} alt={top3.userId.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-black text-slate-400">{top3.userId.fullName[0]}</span>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{top3.userId.fullName}</h3>
                                <p className="text-sm font-bold text-slate-400">{top3.points} pts</p>
                                <div className={`mt-4 px-3 py-1 rounded-full text-xs font-bold ${getTierColor(getTier(top3.points))}`}>
                                    {getTier(top3.points)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* List */}
                    <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900">Leaderboard</h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {restList.map((player) => (
                                <div key={player.rank} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="w-8 font-black text-slate-300 text-center">{player.rank}</div>
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                                        {player.userId.avatar ? (
                                            <img src={getAvatarUrl(player.userId.avatar) || ''} alt={player.userId.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            player.userId.fullName[0]
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900">{player.userId.fullName}</h4>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getTierColor(getTier(player.points))}`}>
                                            {getTier(player.points)}
                                        </span>
                                    </div>
                                    <div className="text-right mr-4">
                                        <p className="font-bold text-slate-900">{player.points} pts</p>
                                    </div>
                                </div>
                            ))}
                            {restList.length === 0 && (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    End of list
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-20 bg-white rounded-[2rem]">
                    <p className="text-slate-500">No ranked players found.</p>
                </div>
            )}
        </div>
    );
}
