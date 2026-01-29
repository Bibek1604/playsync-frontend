"use client";
import React from 'react';
import { Trophy, Medal, Crown, TrendingUp, Shield, Star, Award } from 'lucide-react';

export default function RankingsPage() {
    const topPlayers = [
        { rank: 1, name: "Ghost_Main", score: 2450, winRate: "78%", region: "NA", avatar: "G" },
        { rank: 2, name: "ViperStrike", score: 2380, winRate: "72%", region: "EU", avatar: "V" },
        { rank: 3, name: "ShadowHunter", score: 2310, winRate: "70%", region: "ASIA", avatar: "S" },
    ];

    const recentRankings = [
        { rank: 4, name: "PixelWarrior", score: 2250, change: "+2", tier: "Diamond" },
        { rank: 5, name: "CyberNinja", score: 2190, change: "-1", tier: "Platinum" },
        { rank: 6, name: "StormBreaker", score: 2150, change: "+4", tier: "Platinum" },
        { rank: 7, name: "NeonRider", score: 2100, change: "0", tier: "Gold" },
        { rank: 8, name: "TechMaster", score: 2050, change: "+1", tier: "Gold" },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Global Rankings</h1>
                <p className="text-slate-500 mt-2 font-medium">Top performing players this season</p>
            </div>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
                {/* 2nd Place */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center relative order-2 md:order-1 mt-8 md:mt-0">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-black flex items-center justify-center absolute -top-4 shadow-sm border-2 border-white">
                        2
                    </div>
                    <div className="w-20 h-20 bg-slate-100 rounded-full mb-4 flex items-center justify-center text-2xl font-black text-slate-400">
                        {topPlayers[1].avatar}
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">{topPlayers[1].name}</h3>
                    <p className="text-sm font-bold text-slate-400">{topPlayers[1].score} pts</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        <TrendingUp size={14} /> 72% WR
                    </div>
                </div>

                {/* 1st Place */}
                <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex flex-col items-center relative order-1 md:order-2 shadow-xl shadow-slate-200 transform md:-translate-y-4">
                    <div className="absolute -top-6">
                        <Crown size={40} className="text-yellow-400 fill-yellow-400 drop-shadow-lg" />
                    </div>
                    <div className="w-24 h-24 bg-emerald-500 rounded-full mb-4 flex items-center justify-center text-3xl font-black text-slate-900 border-4 border-slate-800">
                        {topPlayers[0].avatar}
                    </div>
                    <h3 className="font-bold text-xl">{topPlayers[0].name}</h3>
                    <p className="text-sm font-bold text-emerald-400">{topPlayers[0].score} pts</p>
                    <div className="mt-6 w-full bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Region</p>
                        <p className="font-bold">{topPlayers[0].region}</p>
                    </div>
                </div>

                {/* 3rd Place */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center relative order-3 mt-8 md:mt-0">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-black flex items-center justify-center absolute -top-4 shadow-sm border-2 border-white">
                        3
                    </div>
                    <div className="w-20 h-20 bg-slate-100 rounded-full mb-4 flex items-center justify-center text-2xl font-black text-slate-400">
                        {topPlayers[2].avatar}
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">{topPlayers[2].name}</h3>
                    <p className="text-sm font-bold text-slate-400">{topPlayers[2].score} pts</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        <TrendingUp size={14} /> 70% WR
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900">Leaderboard</h3>
                    <button className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors">View Full List</button>
                </div>
                <div className="divide-y divide-slate-50">
                    {recentRankings.map((player) => (
                        <div key={player.rank} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                            <div className="w-8 font-black text-slate-300 text-center">{player.rank}</div>
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                {player.name[0]}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900">{player.name}</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase">{player.tier}</p>
                            </div>
                            <div className="text-right mr-4">
                                <p className="font-bold text-slate-900">{player.score}</p>
                                <p className={`text-xs font-bold ${player.change.startsWith('+') ? 'text-emerald-500' : player.change.startsWith('-') ? 'text-rose-500' : 'text-slate-400'}`}>
                                    {player.change !== '0' ? player.change : '-'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
