import React from 'react';
import { Calendar, Users, Clock, ChevronRight, Gamepad2 } from 'lucide-react';
import { useHistory } from '@/features/history/hooks/useHistory';
import Link from 'next/link';
import { getImageUrl } from '@/lib/constants';

// Maps backend game status → style
const statusVariants: Record<string, string> = {
    ENDED: 'bg-green-50 text-green-600 border-green-100',
    COMPLETED: 'bg-green-50 text-green-600 border-green-100',
    CANCELLED: 'bg-red-50 text-red-600 border-red-100',
    ACTIVE: 'bg-green-50 text-green-600 border-green-100',
    OPEN: 'bg-green-50 text-green-600 border-green-100',
    FULL: 'bg-amber-50 text-amber-600 border-amber-100',
};

const statusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'ENDED': return 'Ended';
        case 'CANCELLED': return 'Cancelled';
        case 'OPEN': return 'Open';
        case 'FULL': return 'Full';
        case 'ACTIVE': return 'Active';
        default: return status || 'Unknown';
    }
};

export const RecentGamesList = ({ limit = 5 }: { limit?: number }) => {
    const { history, isLoading } = useHistory({ limit });

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-20 rounded-xl animate-pulse bg-gray-50 border border-gray-100" />
                ))}
            </div>
        );
    }

    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl animate-in">
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400">
                    <Gamepad2 size={32} />
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">No activity yet</p>
                    <p className="text-sm font-medium text-gray-400 mt-1 max-w-[240px]">Join a session to start tracking your performance history.</p>
                </div>
                <Link
                    href="/games/online"
                    className="px-8 py-3 bg-green-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-green-100 hover:bg-green-700 transition-all"
                >
                    Explore Sessions
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {Array.isArray(history) && history.map((entry: any) => {
                const id = entry.gameId || entry._id;
                const title = entry.title || 'Untitled Session';
                const status = (entry.status || entry.myParticipation?.participationStatus || '').toUpperCase();
                const category = (entry.category || 'online').toLowerCase();
                const imageUrl = entry.gameInfo?.imageUrl || entry.imageUrl || null;
                const joinedAt = entry.myParticipation?.joinedAt || entry.startTime || null;
                const creatorName = entry.gameInfo?.creatorName || '';

                return (
                    <Link
                        href={`/games/${category}/${id}`}
                        key={id}
                        className="flex items-center gap-6 p-4 bg-white border border-gray-100 rounded-xl transition-all hover:bg-gray-50 hover:shadow-lg hover:shadow-gray-100 group relative overflow-hidden"
                    >
                        {/* Status bar left */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusVariants[status]?.split(' ')[1] || 'bg-gray-200'}`} />

                        {/* Game image or fallback */}
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-gray-100 border border-gray-200 shadow-inner group-hover:scale-105 transition-transform">
                            {imageUrl ? (
                                <img src={getImageUrl(imageUrl)} alt={title} className="w-full h-full object-cover" />
                            ) : (
                                <Gamepad2 size={20} className="text-gray-400" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-green-600 transition-colors truncate">
                                {title}
                            </h4>
                            <div className="flex items-center gap-4 mt-1">
                                {creatorName && (
                                    <span className="text-[10px] font-bold text-gray-400 truncate max-w-[120px]">
                                        by {creatorName}
                                    </span>
                                )}
                                {joinedAt && (
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                        <Calendar size={12} className="text-green-400" />
                                        {new Date(joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2026' === '2026' ? undefined : 'numeric' })}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Status badge */}
                        <div className="hidden sm:flex flex-col items-end gap-2">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${statusVariants[status] || 'bg-slate-100 text-slate-500'}`}>
                                {statusLabel(status)}
                            </span>
                        </div>

                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-300 group-hover:bg-green-50 group-hover:text-green-600 transition-all">
                            <ChevronRight size={16} />
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};
