import React from 'react';
import { Activity, CheckCircle, XCircle, PlayCircle } from 'lucide-react';
import { useHistory } from '@/features/history/hooks/useHistory';

export const HistoryStatsView = () => {
    const { stats, isLoading } = useHistory();

    if (isLoading) return <div className="animate-pulse h-64 bg-slate-50 border border-slate-100 rounded-[2rem] p-8 shadow-sm" />;

    // Safety check for null/undefined stats which happened during dev
    const safeStats = stats || {
        completedGames: 0,
        activeGames: 0,
        cancelledGames: 0,
        totalGames: 0
    };

    return (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm h-full">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                    <Activity size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                        Participation
                    </h4>
                    <p className="text-xs font-medium text-slate-400">
                        Lifetime Stats
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-700">
                        <CheckCircle size={16} className="text-emerald-500" />
                        <span className="text-sm font-bold">Completed</span>
                    </div>
                    <span className="text-lg font-black text-emerald-600">{safeStats.completedGames}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-700">
                        <PlayCircle size={16} className="text-blue-500" />
                        <span className="text-sm font-bold">Active</span>
                    </div>
                    <span className="text-lg font-black text-blue-600">{safeStats.activeGames}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-700">
                        <XCircle size={16} className="text-red-500" />
                        <span className="text-sm font-bold">Cancelled</span>
                    </div>
                    <span className="text-lg font-black text-red-600">{safeStats.cancelledGames}</span>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Games</span>
                <span className="text-xl font-black text-slate-900">{safeStats.totalGames}</span>
            </div>
        </div>
    );
};
