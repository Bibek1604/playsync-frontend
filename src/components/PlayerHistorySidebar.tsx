/**
 * Player History Sidebar Component
 * Shows list of games the player has joined with real-time updates
 */

'use client';

import { useState } from 'react';
import { useHistory } from '@/features/history/hooks/useHistory';
import Link from 'next/link';
import { Clock, Trophy, Users, TrendingUp, X, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/lib/constants';

interface PlayerHistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PlayerHistorySidebar({ isOpen, onClose }: PlayerHistorySidebarProps) {
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

    const { history, stats, isLoading, error } = useHistory({
        status: filter === 'active' ? undefined : filter === 'completed' ? 'ENDED' : undefined,
        sort: 'recent',
        limit: 20
    });

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            ENDED: 'bg-slate-500',
            OPEN: 'bg-emerald-500',
            FULL: 'bg-green-600',
            CANCELLED: 'bg-red-500',
        };
        return colors[status] || 'bg-slate-400';
    };

    const getStatusText = (status: string) => {
        const text: Record<string, string> = {
            ENDED: 'Completed',
            OPEN: 'Active',
            FULL: 'In Progress',
            CANCELLED: 'Cancelled',
        };
        return text[status] || status;
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    fixed top-0 right-0 h-full w-96 max-w-full bg-white shadow-2xl z-50
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* Header */}
                <div className="bg-emerald-600 text-white p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">My Game History</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
                            aria-label="Close sidebar"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Stats Overview */}
                    {stats && (
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-emerald-700 rounded-lg p-3 text-center">
                                <Trophy size={20} className="mx-auto mb-1" />
                                <p className="text-2xl font-bold">{stats.totalGames || 0}</p>
                                <p className="text-xs opacity-90">Total</p>
                            </div>
                            <div className="bg-emerald-700 rounded-lg p-3 text-center">
                                <TrendingUp size={20} className="mx-auto mb-1" />
                                <p className="text-2xl font-bold">{stats.activeGames || 0}</p>
                                <p className="text-xs opacity-90">Active</p>
                            </div>
                            <div className="bg-emerald-700 rounded-lg p-3 text-center">
                                <Clock size={20} className="mx-auto mb-1" />
                                <p className="text-2xl font-bold">{stats.completedGames || 0}</p>
                                <p className="text-xs opacity-90">Done</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50">
                    <button
                        onClick={() => setFilter('active')}
                        className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors ${filter === 'active'
                            ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Active ({stats?.activeGames || 0})
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors ${filter === 'completed'
                            ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Completed ({stats?.completedGames || 0})
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors ${filter === 'all'
                            ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        All ({stats?.totalGames || 0})
                    </button>
                </div>

                {/* Games List */}
                <div className="overflow-y-auto h-[calc(100vh-320px)] p-4">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <X size={32} className="text-red-500" />
                            </div>
                            <p className="text-red-600 font-semibold">Failed to load history</p>
                            <p className="text-sm text-slate-500 mt-1">{(error as Error).message}</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Clock size={32} className="text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-semibold">No games found</p>
                            <p className="text-sm text-slate-500 mt-1">
                                {filter === 'active' ? 'Join a game to get started!' : 'No completed games yet'}
                            </p>
                            <Link
                                href="/games"
                                onClick={onClose}
                                className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                            >
                                Browse Games
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((game: any) => (
                                <Link
                                    key={game.gameId}
                                    href={`/games/${game.category?.toLowerCase()}/${game.gameId}`}
                                    onClick={onClose}
                                    className="block bg-white border border-slate-200 rounded-lg p-4 hover:border-emerald-300 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-start gap-3">
                                        {game.gameInfo?.imageUrl && (
                                            <img
                                                src={getImageUrl(game.gameInfo.imageUrl)}
                                                alt={game.title}
                                                className="w-14 h-14 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors truncate">
                                                {game.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`w-2 h-2 rounded-full ${getStatusColor(game.status)}`} />
                                                <span className="text-xs text-slate-600 font-semibold">
                                                    {getStatusText(game.status)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Users size={12} />
                                                    <span>{game.gameInfo?.currentPlayers}/{game.gameInfo?.maxPlayers}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    <span>{new Date(game.myParticipation.joinedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-50 border-t border-slate-200">
                    <Link
                        href="/history"
                        onClick={onClose}
                        className="block w-full px-4 py-3 bg-emerald-600 text-white text-center rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                    >
                        View Full History
                    </Link>
                </div>
            </div>
        </>
    );
}
