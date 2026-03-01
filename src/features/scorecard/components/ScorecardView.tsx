import React from 'react';
import { Trophy, TrendingUp, Award, Zap } from 'lucide-react';
import { useScorecard } from '@/features/scorecard/hooks/useScorecard';

export const ScorecardView = () => {
    const { scorecard, isLoading } = useScorecard();

    if (isLoading) return <div className="animate-pulse h-48 bg-slate-100 rounded-[2rem]" />;
    if (!scorecard) return null;

    return (
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-slate-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl translate-x-10 -translate-y-10" />

            <div className="flex items-start justify-between mb-6">
                <Trophy size={32} className="text-emerald-400" />
                <div className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Rank #{scorecard.rank ?? '-'}</span>
                </div>
            </div>

            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                Total Points
            </h4>
            <div className="flex items-baseline gap-2 mt-2">
                <p className="text-4xl font-semibold">{scorecard.points?.toLocaleString() ?? 0}</p>
                <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1">
                    <TrendingUp size={14} /> Top 10%
                </span>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Games</p>
                    <p className="text-lg font-bold">{scorecard.gamesPlayed ?? 0}</p>
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Win Rate</p>
                    <p className="text-lg font-bold">{scorecard.winRate ?? 0}%</p>
                </div>
            </div>
        </div>
    );
};
