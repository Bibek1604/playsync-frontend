/**
 * Player History Page Component
 * Comprehensive game history display with stats and filtering
 */

'use client';

import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, Trophy, ChevronRight, Gamepad2, AlertCircle } from 'lucide-react';
import { useHistory } from '@/features/history/hooks/useHistory';
import Link from 'next/link';
import { getImageUrl } from '@/lib/constants';

type StatusFilter = 'all' | 'OPEN' | 'FULL' | 'ENDED' | 'CANCELLED';
type CategoryFilter = 'all' | 'ONLINE' | 'OFFLINE';
type SortOption = 'recent' | 'oldest' | 'mostActive';

export default function PlayerHistoryPage() {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
    const [sortOption, setSortOption] = useState<SortOption>('recent');
    const [currentPage, setCurrentPage] = useState(1);

    const { history, pagination, stats, count, isLoading, error } = useHistory({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        sort: sortOption,
        page: currentPage,
        limit: 10
    });

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            ENDED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            OPEN: 'bg-green-100 text-green-700 border-green-200',
            FULL: 'bg-purple-100 text-purple-700 border-purple-200',
            CANCELLED: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    if (error) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600 font-semibold">Failed to load history</p>
                    <p className="text-red-500 text-sm mt-1">{(error as Error).message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header with Stats */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-6">Game History</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <Trophy size={20} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Total Games</p>
                                <p className="text-2xl font-bold text-slate-900">{stats?.totalGames || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <TrendingUp size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Active</p>
                                <p className="text-2xl font-bold text-slate-900">{stats?.activeGames || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <Clock size={20} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Completed</p>
                                <p className="text-2xl font-bold text-slate-900">{stats?.completedGames || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users size={20} className="text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Left Early</p>
                                <p className="text-2xl font-bold text-slate-900">{stats?.leftEarly || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-600">Filters:</span>
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value as StatusFilter);
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="all">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="FULL">Full</option>
                        <option value="ENDED">Ended</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value as CategoryFilter);
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="all">All Categories</option>
                        <option value="ONLINE">Online</option>
                        <option value="OFFLINE">Offline</option>
                    </select>

                    <select
                        value={sortOption}
                        onChange={(e) => {
                            setSortOption(e.target.value as SortOption);
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="oldest">Oldest First</option>
                        <option value="mostActive">Most Active</option>
                    </select>
                </div>
            </div>

            {/* History List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : history.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No games found</h3>
                    <p className="text-slate-500 mb-6">
                        {statusFilter !== 'all' || categoryFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Start playing to see your history here'}
                    </p>
                    <Link
                        href="/games"
                        className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                    >
                        Browse Games
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((game: any) => (
                        <Link
                            key={game.gameId}
                            href={`/games/${game.category?.toLowerCase()}/${game.gameId}`}
                            className="block bg-white border border-slate-200 rounded-lg p-6 hover:border-emerald-300 hover:shadow-md transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                {/* Left: Game Info */}
                                <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                        {game.gameInfo?.imageUrl && (
                                            <img
                                                src={getImageUrl(game.gameInfo.imageUrl)}
                                                alt={game.title}
                                                className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors">
                                                {game.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Created by {game.gameInfo?.creatorName || 'Unknown'}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getStatusColor(game.status)}`}>
                                                    {game.status}
                                                </span>
                                                <span className="px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                    {game.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Participation Stats */}
                                <div className="flex flex-col gap-2 md:text-right md:min-w-[200px]">
                                    <div className="flex md:justify-end items-center gap-2 text-sm">
                                        <Calendar size={14} className="text-slate-400" />
                                        <span className="text-slate-600">
                                            Joined: {new Date(game.myParticipation.joinedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex md:justify-end items-center gap-2 text-sm">
                                        <Clock size={14} className="text-slate-400" />
                                        <span className="text-slate-600">
                                            Duration: {formatDuration(game.myParticipation.durationMinutes)}
                                        </span>
                                    </div>
                                    <div className="flex md:justify-end items-center gap-2 text-sm">
                                        <Users size={14} className="text-slate-400" />
                                        <span className="text-slate-600">
                                            {game.gameInfo?.currentPlayers}/{game.gameInfo?.maxPlayers} players
                                        </span>
                                    </div>
                                    <div className={`px-2 py-1 rounded-md text-xs font-bold inline-block ${game.myParticipation.participationStatus === 'ACTIVE'
                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                        : 'bg-orange-100 text-orange-700 border border-orange-200'
                                        }`}>
                                        {game.myParticipation.participationStatus}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <span className="px-4 py-2 text-sm font-semibold text-slate-600">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={!pagination.hasNext}
                        className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
