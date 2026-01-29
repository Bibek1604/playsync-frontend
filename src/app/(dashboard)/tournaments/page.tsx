"use client";
import React from "react";
import { Trophy, Calendar, Users, DollarSign, ArrowRight, Star } from "lucide-react";

const tournaments = [
    {
        id: 1,
        title: "Valorant Champions 2024",
        game: "Valorant",
        date: "Aug 15 - Aug 25",
        prize: "$5,000",
        teams: 16,
        maxTeams: 32,
        status: "Registering",
        imageColor: "bg-rose-500",
    },
    {
        id: 2,
        title: "Apex Legends Global Series",
        game: "Apex Legends",
        date: "Sep 10 - Sep 12",
        prize: "$12,000",
        teams: 42,
        maxTeams: 60,
        status: "Live",
        imageColor: "bg-emerald-500",
    },
    {
        id: 3,
        title: "Rocket League Monthly",
        game: "Rocket League",
        date: "Oct 01 - Oct 05",
        prize: "$2,000",
        teams: 8,
        maxTeams: 16,
        status: "Registering",
        imageColor: "bg-indigo-500",
    },
];

export default function TournamentsPage() {
    return (
        <div className="space-y-10">
            {/* Hero Section */}
            <div className="relative rounded-[2.5rem] bg-slate-900 text-white p-10 overflow-hidden shadow-2xl shadow-slate-200">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm border border-white/10">
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-white/80">Featured Event</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black leading-tight">
                            Summer Championship <span className="text-emerald-400">Series</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed">
                            Compete against the best players in the region for a massive prize pool and exclusive rewards. Registration closes soon.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]">
                                Register Now
                            </button>
                            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/10 backdrop-blur-sm">
                                View Details
                            </button>
                        </div>
                    </div>
                    {/* Visual Element (Abstract Trophy/Graphic) */}
                    <div className="hidden md:flex items-center justify-center w-64 h-64 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] border border-white/5 shadow-2xl rotate-3 transform hover:rotate-6 transition-all duration-500 group">
                        <Trophy size={80} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)] group-hover:scale-110 transition-transform" />
                    </div>
                </div>
            </div>

            {/* Tournaments List */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Upcoming Tournaments</h2>
                    <a href="#" className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                        View All <ArrowRight size={16} />
                    </a>
                </div>

                <div className="grid gap-4">
                    {tournaments.map(tournament => (
                        <div key={tournament.id} className="group flex flex-col md:flex-row items-center gap-6 bg-white p-4 pr-8 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                            {/* Image / Icon */}
                            <div className={`w-full md:w-32 h-32 ${tournament.imageColor} rounded-[1.5rem] flex items-center justify-center text-white shrink-0 shadow-lg`}>
                                <Trophy size={32} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-2 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">{tournament.game}</span>
                                    {tournament.status === 'Live' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                    {tournament.title}
                                </h3>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-slate-400" />
                                        {tournament.date}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-slate-400" />
                                        {tournament.teams}/{tournament.maxTeams} Teams
                                    </div>
                                </div>
                            </div>

                            {/* Prize & Action */}
                            <div className="flex flex-col items-center md:items-end gap-3 min-w-[120px]">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prize Pool</p>
                                    <p className="text-2xl font-black text-slate-900">{tournament.prize}</p>
                                </div>
                                <button className="px-6 py-2 bg-slate-50 text-slate-900 font-bold rounded-xl hover:bg-slate-900 hover:text-white transition-colors w-full md:w-auto">
                                    Join
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
