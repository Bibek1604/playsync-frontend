import React from 'react';
import { Activity, CheckCircle, XCircle, PlayCircle, ArrowRight, ChevronRight, PieChart } from 'lucide-react';
import { useHistory } from '@/features/history/hooks/useHistory';
import { Card, Button } from '@/components/ui';

export const HistoryStatsView = () => {
    const { stats, isLoading } = useHistory();

    if (isLoading) return <div className="animate-pulse h-64 bg-slate-50 border border-slate-100 rounded-3xl p-8" />;

    const safeStats = stats || {
        completedGames: 0,
        activeGames: 0,
        cancelledGames: 0,
        totalGames: 0
    };

    const completionRate = safeStats.totalGames > 0
        ? Math.round((safeStats.completedGames / safeStats.totalGames) * 100)
        : 0;

    return (
        <Card className="flex flex-col h-full bg-white p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Engagement</p>
                        <h4 className="text-lg font-bold text-slate-900">Activity Stats</h4>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <PieChart size={18} />
                </div>
            </div>

            {/* Circular Progress Display */}
            <div className="relative mb-10 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-[10px] border-slate-50 flex items-center justify-center relative bg-white shadow-inner">
                    <svg className="absolute w-full h-full -rotate-90 scale-x-[-1]">
                        <circle
                            cx="64"
                            cy="64"
                            r="54"
                            fill="transparent"
                            stroke="#10b98110"
                            strokeWidth="10"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="54"
                            fill="transparent"
                            stroke="#10b981"
                            strokeWidth="10"
                            className="transition-all duration-1000 ease-out"
                            strokeDasharray={2 * Math.PI * 54}
                            strokeDashoffset={2 * Math.PI * 54 * (1 - completionRate / 100)}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="text-center z-10">
                        <span className="text-2xl font-black text-slate-900">{completionRate}%</span>
                        <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Goal Metric</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group transition-all hover:border-emerald-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-slate-200 text-emerald-500 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <CheckCircle size={16} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Completed</span>
                    </div>
                    <span className="text-lg font-black text-slate-900 tracking-tight">{safeStats.completedGames}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group transition-all hover:border-emerald-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-slate-200 text-emerald-500 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <PlayCircle size={16} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Active Lock</span>
                    </div>
                    <span className="text-lg font-black text-slate-900 tracking-tight">{safeStats.activeGames}</span>
                </div>
            </div>

            <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Cumulative History</p>
                    <span className="text-2xl font-black text-slate-900">{safeStats.totalGames} <span className="text-xs text-slate-500 font-bold uppercase tracking-widest ml-1">Matches</span></span>
                </div>
                <button className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                    <ArrowRight size={20} />
                </button>
            </div>
        </Card>
    );
};
