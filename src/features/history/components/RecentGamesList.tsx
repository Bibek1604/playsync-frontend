import React from 'react';
import { Calendar, Users, MapPin, Clock } from 'lucide-react';
import { useHistory } from '@/features/history/hooks/useHistory';
import Link from 'next/link';

export const RecentGamesList = () => {
    const { history, isLoading } = useHistory({ limit: 5 }); // limit to 5 recent games

    if (isLoading) return <div className="animate-pulse h-64 bg-slate-50 rounded-[2rem] mt-8" />;

    if (!history || history.length === 0) {
        return (
            <div className="mt-8 bg-white border border-slate-100 rounded-[2rem] p-8 text-center bg-slate-50">
                <p className="text-slate-400 font-medium">No recent games found.</p>
                <Link href="/games/online" className="text-emerald-500 font-bold hover:underline mt-2 inline-block">Join a Game</Link>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                <Link href="/history" className="text-xs font-bold text-slate-400 hover:text-emerald-500 uppercase tracking-widest">View All</Link>
            </div>

            <div className="space-y-4">
                {Array.isArray(history) && history.map((game: any) => (
                    <Link href={`/games/${game.category?.toLowerCase() || 'online'}/${game._id}`} key={game._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50/50 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm text-slate-300">
                                {game.imageUrl ? (
                                    <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <Clock size={20} />
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{game.title}</h4>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <span className="flex items-center gap-1"><MapPin size={12} /> {game.location || 'Online'}</span>
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(game.startTime).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${game.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' :
                                game.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                {game.status}
                            </span>
                            <p className="text-xs text-slate-400 font-bold mt-2">
                                {game.currentPlayers}/{game.maxPlayers} Players
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
