"use client";

import React, { useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  Activity,
  ArrowUpRight,
  Zap,
  Target,
  Gamepad2,
  Trophy,
  BarChart3,
  Star,
  Users,
  ChevronRight,
  Shield,
  Wifi,
  WifiOff,
} from "lucide-react";
import { RecentGamesList } from "@/features/history/components/RecentGamesList";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { scorecardService } from "@/features/scorecard/api/scorecard-service";
import { historyService } from "@/features/history/api/history-service";
import { leaderboardService } from "@/features/leaderboard/api/leaderboard-service";
import { adminService } from "@/features/admin/api/admin-service";
import { Button } from "@/components/ui";
import Link from "next/link";

// ── Custom Tooltip ──
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-lg shadow-md p-3 animate-in">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-lg font-bold text-green-600">
          {(payload[0].value || 0).toLocaleString()} <span className="text-xs font-semibold text-gray-400">XP</span>
        </p>
      </div>
    );
  }
  return null;
};

// ── Skeleton ──
const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 rounded-xl p-6 h-[140px] animate-pulse shadow-sm" />
);

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const [trendDays, setTrendDays] = React.useState(7);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => { setMounted(true); }, []);

  // ── Data Fetching ──
  const { data: scorecard, isLoading: scorecardLoading } = useQuery({
    queryKey: ['scorecard'],
    queryFn: () => scorecardService.getMyScorecard(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const { data: historyStats, isLoading: statsLoading } = useQuery({
    queryKey: ['history-stats'],
    queryFn: () => historyService.getStats(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const { data: trendData } = useQuery({
    queryKey: ['scorecard-trend', trendDays],
    queryFn: () => scorecardService.getTrend(trendDays),
    enabled: isAuthenticated,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => leaderboardService.getLeaderboard({ limit: 50 }),
    enabled: isAuthenticated,
  });

  const isAdmin = mounted && (user as any)?.role === 'admin';

  const { data: adminStats, isLoading: adminStatsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getStats,
    enabled: isAdmin,
    staleTime: 30_000,
  });

  // ── Process chart data ──
  const processedTrendData = React.useMemo(() =>
    (trendData || []).map((item: { date: string; points: number }) => ({
      name: new Date(item.date).toLocaleDateString('en-US', {
        weekday: trendDays <= 7 ? 'short' : undefined,
        day: trendDays > 7 ? 'numeric' : undefined,
        month: trendDays > 7 ? 'short' : undefined,
      }),
      value: item.points,
    })),
    [trendData, trendDays]);

  const myRank = React.useMemo(() => {
    const userId = (user as any)?._id || user?.id;
    const idx = leaderboard.findIndex((p: any) => p.userId === userId);
    return idx >= 0 ? idx + 1 : scorecard?.rank ?? null;
  }, [leaderboard, user, scorecard]);

  // ── UI States ──
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = mounted ? (user?.fullName?.split(' ')[0] || 'Player') : 'Player';

  const xpPoints = scorecard?.xp ?? 0;
  const level = scorecard?.level ?? 1;
  const totalSessions = historyStats?.totalGames ?? 0;
  const completedSessions = historyStats?.completedGames ?? 0;
  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  const statCards = [
    {
      label: 'Growth Score',
      value: scorecardLoading ? '—' : xpPoints.toLocaleString(),
      icon: TrendingUp,
      color: 'green',
      sub: `Level ${level}`,
      badge: myRank ? `#${myRank} Rank` : null,
    },
    {
      label: 'Sessions Joined',
      value: statsLoading ? '—' : totalSessions.toString(),
      icon: Gamepad2,
      color: 'green',
      sub: `${scorecard?.gamesPlayed ?? 0} Recorded`,
      badge: null,
    },
    {
      label: 'Completion Rate',
      value: statsLoading ? '—' : `${Number(completionRate).toFixed(2)}%`,
      icon: Target,
      color: 'green',
      sub: `${completedSessions} Finished`,
      badge: completionRate >= 80 ? 'Elite' : null,
    },
    {
      label: 'Overall Status',
      value: 'Pro Active',
      icon: Trophy,
      color: 'green',
      sub: 'Top Tier Player',
      badge: null,
    },
  ];

  const colorMap: any = {
    green: 'text-green-600 bg-green-50 border-green-100',
  };

  return (
    <div className="space-y-10 py-6">

      {/* ── Hero Welcome ── */}
      <div className="bg-white border border-gray-100 rounded-xl p-8 md:p-10 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-[400px] h-full bg-gray-50/50 pointer-events-none skew-x-12 translate-x-32" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-100 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 text-green-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Real-time Analytics
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-gray-900">
              {greeting}, {firstName}!
            </h1>
            <p className="text-gray-500 font-medium text-lg max-w-xl">
              Welcome back to your workspace. Your performance today is <span className="text-green-600 font-bold underline decoration-green-200 underline-offset-4">Top 5%</span> in the region.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/games/online">
              <Button size="lg" className="rounded-lg px-8 shadow-sm">
                Play Now
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Admin Platform Stats Banner (admin only) ── */}
      {isAdmin && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Shield size={16} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Platform Overview</h3>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                  Live Admin Stats
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-all"
            >
              Open Admin Panel <ChevronRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-gray-50" style={{ borderTop: '1px solid #f9fafb' }}>
            {[
              { icon: Users, label: 'Total Users', value: adminStats?.totalUsers, color: 'text-green-600 bg-green-50', border: 'border-green-100' },
              { icon: Gamepad2, label: 'Total Games', value: adminStats?.totalGames, color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' },
              { icon: Wifi, label: 'Online Games', value: adminStats?.totalOnlineGames, color: 'text-cyan-600 bg-cyan-50', border: 'border-cyan-100' },
              { icon: WifiOff, label: 'Offline Games', value: adminStats?.totalOfflineGames, color: 'text-purple-600 bg-purple-50', border: 'border-purple-100' },
              { icon: Activity, label: 'Active Now', value: adminStats?.activeGames, color: 'text-amber-600 bg-amber-50', border: 'border-amber-100' },
              { icon: Users, label: 'Total Players', value: adminStats?.totalParticipantsAcrossAllGames, color: 'text-rose-600 bg-rose-50', border: 'border-rose-100' },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`flex flex-col items-start gap-2.5 px-6 py-5 hover:bg-gray-50/60 transition-colors border-r border-b border-gray-50 last:border-r-0`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${item.color} ${item.border}`}>
                  <item.icon size={16} />
                </div>
                {adminStatsLoading ? (
                  <div className="h-8 w-14 bg-gray-100 rounded-lg animate-pulse" />
                ) : (
                  <p className="text-2xl font-extrabold text-gray-900 leading-none tabular-nums">
                    {(item.value ?? 0).toLocaleString()}
                  </p>
                )}
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Metric Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {(scorecardLoading || statsLoading)
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((stat, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${colorMap[stat.color]}`}>
                  <stat.icon size={22} strokeWidth={2.5} />
                </div>
                {stat.badge && (
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${colorMap[stat.color]}`}>
                    {stat.badge}
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-gray-400 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">
                {stat.value}
              </h3>
              <p className="text-xs font-semibold text-gray-500">{stat.sub}</p>
            </div>
          ))}
      </div>

      {/* ── Data Visualization Section ── */}
      <div className="grid grid-cols-12 gap-8">

        {/* Growth Chart */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm overflow-hidden relative group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-green-50 text-green-600 flex items-center justify-center border border-green-100 shadow-sm">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Performance Overview</h3>
                  <p className="text-sm font-medium text-gray-400">XP Progression tracking</p>
                </div>
              </div>

              <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                {[7, 30].map(d => (
                  <button
                    key={d}
                    onClick={() => setTrendDays(d)}
                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${trendDays === d
                      ? 'bg-white text-green-600 shadow-sm hover:bg-white'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                      }`}
                  >
                    Last {d}D
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processedTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }}
                    dy={10}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#16a34a', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#16a34a"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#chartGradient)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent History Table View */}
          <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <Activity className="text-green-600" />
                Recent History
              </h3>
              <Link href="/analytics" className="text-sm font-bold text-green-600 hover:underline">View All</Link>
            </div>
            <RecentGamesList limit={5} />
          </div>
        </div>

        {/* Right Stats Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">

          {/* Quick Profile Overview */}
          <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-green-600 to-green-400 flex items-center justify-center shadow-md mb-6 ring-4 ring-green-50">
                <span className="text-3xl font-black text-white">
                  {user?.fullName?.[0]?.toUpperCase()}
                </span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">{user?.fullName}</h4>
              <p className="text-gray-400 text-sm font-medium mb-6">{user?.email}</p>

              <div className="grid grid-cols-2 w-full gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                  <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Rank</p>
                  <p className="text-xl font-black text-green-600">#{myRank || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                  <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Status</p>
                  <p className="text-xl font-black text-green-600">Elite</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100 cursor-pointer hover:bg-green-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <Star size={16} fill="currentColor" />
                  </div>
                  <span className="text-sm font-bold text-gray-800">Premium Member</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 font-display">Discovery Stats</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center transition-all group-hover:bg-green-100">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Squad Invites</p>
                  <p className="text-sm font-bold text-gray-900">4 New Invites</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center transition-all group-hover:bg-green-100">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Win Ratio</p>
                  <p className="text-sm font-bold text-gray-900">{Number(scorecard?.winRate || 0).toFixed(2)}% Average</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
