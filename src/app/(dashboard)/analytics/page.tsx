"use client";

import React, { useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    LineChart,
    Line,
    AreaChart,
    Area,
} from "recharts";
import {
    TrendingUp,
    Activity,
    Trophy,
    Target,
    Gamepad2,
    Users,
    Star,
    Zap,
    CheckCircle2,
    AlertCircle,
    Clock,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Crown,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { scorecardService } from "@/features/scorecard/api/scorecard-service";
import { historyService } from "@/features/history/api/history-service";
import { Button, Card, Badge } from "@/components/ui";
import Link from "next/link";

// ── Custom Components ──

const CustomTooltip = ({ active, payload, label, prefix = "" }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-4 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">{label}</p>
                <p className="text-xl font-bold text-gray-900">
                    {prefix}{payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export default function AnalyticsPage() {
    const { user, isAuthenticated } = useAuthStore();
    const [trendDays, setTrendDays] = React.useState(30);
    const [mounted, setMounted] = React.useState(false);

    useEffect(() => { setMounted(true); }, []);

    // ── Data Fetching ──
    const { data: scorecard, isLoading: scorecardLoading } = useQuery({
        queryKey: ['scorecard-analytics'],
        queryFn: () => scorecardService.getMyScorecard(),
        enabled: isAuthenticated,
    });

    const { data: historyStats, isLoading: statsLoading } = useQuery({
        queryKey: ['history-stats-analytics'],
        queryFn: () => historyService.getStats(),
        enabled: isAuthenticated,
    });

    const { data: trendData, isLoading: isTrendLoading } = useQuery({
        queryKey: ['scorecard-trend-analytics', trendDays],
        queryFn: () => scorecardService.getTrend(trendDays),
        enabled: isAuthenticated,
    });

    // ── Process Data for Charts ──
    const processedTrendData = React.useMemo(() =>
        (trendData || []).map((item: { date: string; points: number }) => ({
            name: new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            }),
            value: item.points,
        })),
        [trendData]);

    const winLossData = React.useMemo(() => [
        { name: 'Wins', value: scorecard?.wins || 0, color: '#10b981' },
        { name: 'Losses', value: scorecard?.losses || 0, color: '#ef4444' },
    ], [scorecard]);

    const participationData = React.useMemo(() => [
        { name: 'Completed', value: historyStats?.completedGames || 0, color: '#16a34a' },
        { name: 'Active', value: historyStats?.activeGames || 0, color: '#22c55e' },
        { name: 'Left Early', value: historyStats?.leftEarly || 0, color: '#94a3b8' },
    ], [historyStats]);

    const pointsBreakdown = React.useMemo(() => [
        { name: 'Wins', value: scorecard?.breakdown?.pointsFromWins || 0 },
        { name: 'Games', value: scorecard?.breakdown?.pointsFromGames || 0 },
        { name: 'XP', value: scorecard?.breakdown?.pointsFromXP || 0 },
    ], [scorecard]);

    if (!mounted) return null;

    return (
        <div className="space-y-12 py-8 animate-in max-w-7xl mx-auto">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-green-600 mb-4">
                        <Activity size={12} className="fill-current" />
                        Performance Insights
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                        Workspace <span className="text-green-600">Analytics</span>
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Deep dive into your gaming performance and XP progression metrics.
                    </p>
                </div>

                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 shadow-sm">
                    {[7, 30, 90].map(d => (
                        <button
                            key={d}
                            onClick={() => setTrendDays(d)}
                            className={`px-8 py-2.5 rounded-lg text-xs font-bold transition-all ${trendDays === d
                                ? 'bg-white text-green-600 shadow-sm border border-gray-100 hover:bg-white'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                                }`}
                        >
                            {d} Days
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Highlights Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card variant="elevated" className="relative group overflow-hidden border-gray-100 shadow-sm">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50/20 rounded-full -mr-8 -mt-8 pointer-events-none" />
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                            <Zap size={22} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total XP</p>
                            <h3 className="text-2xl font-bold text-gray-900">{(scorecard?.xp || 0).toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                        <ArrowUpRight size={14} />
                        <span>+12% this week</span>
                    </div>
                </Card>

                <Card variant="elevated" className="border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                            <Target size={22} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Win Rate</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {Number(scorecard?.winRate || 0).toFixed(2)}%
                            </h3>
                        </div>
                    </div>
                    <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                        <div
                            className="h-full bg-green-600 rounded-full shadow-sm"
                            style={{ width: `${Number(scorecard?.winRate || 0).toFixed(2)}%` }}
                        />
                    </div>
                </Card>

                <Card variant="elevated" className="border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                            <Gamepad2 size={22} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Games</p>
                            <h3 className="text-2xl font-bold text-gray-900">{scorecard?.gamesPlayed || 0}</h3>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-gray-400">
                        <span className="text-green-600">{historyStats?.completedGames || 0}</span> Finished successfully
                    </p>
                </Card>

                <Card variant="elevated" className="border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                            <Trophy size={22} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Rank</p>
                            <h3 className="text-2xl font-bold text-gray-900">#{scorecard?.rank || '—'}</h3>
                        </div>
                    </div>
                    <Badge variant="warning" dot className="rounded-lg">Master Tier</Badge>
                </Card>
            </div>

            {/* ── Main Analytics Section ── */}
            <div className="grid grid-cols-12 gap-8">

                {/* XP Trend - Large Chart */}
                <div className="col-span-12 lg:col-span-8">
                    <Card className="p-8 h-full border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-lg bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-100">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">XP Progression</h3>
                                    <p className="text-sm font-medium text-gray-400">Your points growth over the selected period</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={processedTrendData}>
                                    <defs>
                                        <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#16a34a', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#16a34a"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorXp)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Breakdown Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-8">

                    {/* Victory Ratio */}
                    <Card className="p-8 flex flex-col items-center text-center border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Victory Ratio</h3>
                        <p className="text-sm font-medium text-gray-400 mb-8">Performance breakdown by result</p>

                        <div className="h-[220px] w-full relative">
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-3xl font-bold text-gray-900 leading-none">
                                    {Number(scorecard?.winRate || 0).toFixed(2)}%
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Win Rate</p>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={winLossData}
                                        innerRadius={70}
                                        outerRadius={85}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                        startAngle={90}
                                        endAngle={450}
                                    >
                                        {winLossData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 w-full gap-4 mt-8 pt-6 border-t border-gray-50">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-xs font-bold text-gray-700">{scorecard?.wins || 0}</span>
                                </div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Wins</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-xs font-bold text-gray-700">{scorecard?.losses || 0}</span>
                                </div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Losses</p>
                            </div>
                        </div>
                    </Card>

                    {/* Points Multiplier */}
                    <Card className="p-8 border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Star className="text-amber-400" fill="currentColor" size={20} />
                            Contribution Sources
                        </h3>
                        <div className="space-y-6">
                            {pointsBreakdown.map((item, i) => {
                                const maxVal = Math.max(...pointsBreakdown.map(p => p.value));
                                const percentage = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{item.name}</span>
                                            <span className="text-sm font-bold text-green-600">{item.value.toLocaleString()}</span>
                                        </div>
                                        <div className="h-2 bg-gray-50 rounded-full border border-gray-100 overflow-hidden">
                                            <div className="h-full bg-green-600 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>

            {/* ── Lower Section ── */}
            <div className="grid grid-cols-12 gap-8">

                {/* Participation Distribution */}
                <div className="col-span-12 lg:col-span-5">
                    <Card className="p-8 h-full border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <Users className="text-green-600" />
                            Engagement Status
                        </h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-6">
                                {participationData.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-100 bg-gray-50 transition-all group-hover:scale-110" style={{ color: item.color }}>
                                            {i === 0 ? <CheckCircle2 size={18} /> : i === 1 ? <Activity size={18} /> : <AlertCircle size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.name}</p>
                                            <p className="text-lg font-bold text-gray-900">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={participationData}
                                            innerRadius={0}
                                            outerRadius={80}
                                            dataKey="value"
                                            stroke="#fff"
                                            strokeWidth={4}
                                        >
                                            {participationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Benchmarks Section */}
                <div className="col-span-12 lg:col-span-7">
                    <div className="bg-gray-900 rounded-xl p-10 text-white h-full relative overflow-hidden shadow-xl">
                        <div className="absolute inset-0 opacity-10" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-2xl font-bold tracking-tight">System Benchmarks</h3>
                                <Badge variant="primary" size="lg" className="rounded-lg bg-green-600 hover:bg-green-700">Top Performance</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <Crown size={12} className="text-amber-400" />
                                        Mastery Level
                                    </p>
                                    <div className="flex items-end gap-3">
                                        <span className="text-5xl font-bold text-white">{scorecard?.level || 1}</span>
                                        <span className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-tight">Growth Level Reached</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                        <div className="flex justify-between items-center mb-2 text-xs font-bold text-gray-400">
                                            <span>Progress to Level {(scorecard?.level || 1) + 1}</span>
                                            <span>74.25%</span>
                                        </div>
                                        <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5">
                                            <div className="h-full bg-green-600 rounded-full" style={{ width: '74.25%' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex flex-col md:flex-row items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-xl">
                                <div className="w-16 h-16 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 border border-green-500/30">
                                    <Trophy size={32} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mb-1">Exclusive Milestone Reached!</h4>
                                    <p className="text-sm text-gray-400">You've surpassed the <span className="text-green-400 font-bold">10,000 XP</span> mark this month. Keep up the high engagement to unlock the Elite Badge.</p>
                                </div>
                                <Button className="md:ml-auto rounded-lg px-6">
                                    Claim Points
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
