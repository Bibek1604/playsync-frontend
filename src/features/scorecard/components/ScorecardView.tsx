import React from 'react';
import { Trophy, Shield, Target, Award, ArrowUpRight } from 'lucide-react';
import { useScorecard } from '@/features/scorecard/hooks/useScorecard';
import { Card, Badge, Button } from '@/components/ui';

export const ScorecardView = () => {
    const { scorecard, isLoading } = useScorecard();

    if (isLoading) return <div className="animate-pulse h-64 bg-slate-50 rounded-3xl border border-slate-100" />;
    if (!scorecard) return null;

    return (
        <Card className="flex flex-col h-full bg-white relative overflow-hidden p-8">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Trophy size={80} className="text-emerald-500" />
            </div>

            <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Award size={14} className="text-emerald-500" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rank Status</p>
                    </div>
                    <h4 className="text-3xl font-black text-slate-900">#{scorecard.rank ?? '--'}</h4>
                </div>
            </div>

            {/* XP Visualization */}
            <div className="mb-10 space-y-4 relative z-10">
                <div className="flex items-end gap-2">
                    <h2 className="text-5xl font-black text-emerald-600 leading-none">
                        {(scorecard.xp || 0).toLocaleString('en-US')}
                    </h2>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest pb-1">XP</span>
                </div>

                <div className="flex items-center justify-between">
                    <Badge variant="primary" size="sm" className="bg-emerald-600 text-white border-none shadow-lg shadow-emerald-500/20">Level {scorecard.level}</Badge>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {Math.floor((scorecard.xp % 1000) / 10)}% Progress
                    </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-2.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                    <div
                        className="bg-emerald-500 h-full transition-all duration-1000 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                        style={{ width: `${(scorecard.xp % 1000) / 10}%` }}
                    />
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors group">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Target size={14} className="group-hover:text-emerald-500 transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Matches</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{scorecard.gamesPlayed || 0}</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors group">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Shield size={14} className="text-red-400 group-hover:text-emerald-500 transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Victories</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{scorecard.wins || 0}</p>
                </div>
            </div>

            <Button variant="outline" isFullWidth rightIcon={ArrowUpRight} className="mt-auto py-5 border-slate-100 text-slate-600 hover:text-emerald-600 hover:border-emerald-200">
                Performance Report
            </Button>
        </Card>
    );
};
