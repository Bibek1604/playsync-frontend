"use client";
import React from "react";
import { Users, Filter, Search, Sword, Target, Mic } from "lucide-react";

const squads = [
    {
        id: 1,
        name: "Apex Predators",
        game: "Apex Legends",
        rank: "Diamond",
        members: 2,
        maxMembers: 3,
        region: "NA",
        mic: true,
        tags: ["Aggressive", "Ranked"],
    },
    {
        id: 2,
        name: "Tactical Ops",
        game: "Valorant",
        rank: "Ascendant",
        members: 4,
        maxMembers: 5,
        region: "EU",
        mic: true,
        tags: ["Chill", "Strategy"],
    },
    {
        id: 3,
        name: "Warzone Winners",
        game: "Call of Duty",
        rank: "Gold",
        members: 3,
        maxMembers: 4,
        region: "NA",
        mic: false,
        tags: ["Casual", "Resurgence"],
    },
    {
        id: 4,
        name: "Rocket League Duo",
        game: "Rocket League",
        rank: "Champ II",
        members: 1,
        maxMembers: 2,
        region: "EU",
        mic: true,
        tags: ["2v2", "Competitive"],
    },
];

export default function SquadsPage() {
    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Squad Finder
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        Find the perfect teammates for your next match.
                    </p>
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200 flex items-center gap-2">
                    <Users size={20} />
                    Create Squad
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="Search squads by game, tag, or name..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    <button className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 whitespace-nowrap">
                        <Filter size={16} /> Filters
                    </button>
                    <select className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-sm transition-colors outline-none cursor-pointer">
                        <option>All Games</option>
                        <option>Valorant</option>
                        <option>Apex Legends</option>
                        <option>CS:GO</option>
                    </select>
                </div>
            </div>

            {/* Squads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {squads.map((squad) => (
                    <div
                        key={squad.id}
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-500 shadow-lg shadow-slate-200">
                                    <Sword size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">
                                        {squad.name}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        {squad.game}
                                    </p>
                                </div>
                            </div>
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                                {squad.members}/{squad.maxMembers}
                            </span>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
                                    <Target size={16} className="text-indigo-500" />
                                    <span>{squad.rank}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
                                    <Mic size={16} className={squad.mic ? "text-slate-900" : "text-slate-400"} />
                                    <span>{squad.mic ? "Mic On" : "No Mic"}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
                                    <span className="text-xs font-bold text-slate-400">
                                        {squad.region}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {squad.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-slate-50 text-slate-500 rounded-md border border-slate-100"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-emerald-200/50">
                            Join Squad
                        </button>
                    </div>
                ))}

                {/* Create New Prompt Card */}
                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group h-full min-h-[300px]">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4 group-hover:scale-110 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all">
                        <Users size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                        Start a New Squad
                    </h3>
                    <p className="text-slate-500 text-sm max-w-[200px]">
                        Can't find what you're looking for? distinct yourself.
                    </p>
                </div>
            </div>
        </div>
    );
}
