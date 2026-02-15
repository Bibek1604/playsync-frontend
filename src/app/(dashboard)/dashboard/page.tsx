"use client";
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Bell,
  Search,
  Zap,
  Target,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { ScorecardView } from "@/features/scorecard/components/ScorecardView";
import { HistoryStatsView } from "@/features/history/components/HistoryStatsView";
import { RecentGamesList } from "@/features/history/components/RecentGamesList";
import { useAuthStore } from "@/features/auth/store/auth-store";

const chartData = [
  { m: "Mon", v: 400 },
  { m: "Tue", v: 800 },
  { m: "Wed", v: 600 },
  { m: "Thu", v: 1100 },
  { m: "Fri", v: 900 },
  { m: "Sat", v: 1400 },
  { m: "Sun", v: 1200 },
];

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="flex-1 p-2 bg-[#FBFCFE] font-poppins min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
            Welcome, {user?.fullName?.split(' ')[0] || 'Player'}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Your squad is waiting for you.{" "}
            <span className="text-emerald-600 font-semibold cursor-pointer underline-offset-4 hover:underline">
              Join Match
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search tournaments..."
              className="pl-12 pr-6 py-3 bg-white border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm w-72 shadow-sm"
            />
          </div>
          <button className="p-3 bg-white border border-slate-200/60 rounded-2xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all relative shadow-sm">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Performance Chart Box */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Performance Trend
                </h3>
                <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">
                  Skill Evolution
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors">
                <Filter size={14} /> This Week
              </button>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F1F5F9"
                  />
                  <XAxis
                    dataKey="m"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                    dy={15}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                      fontFamily: "Poppins",
                    }}
                    cursor={{ stroke: "#10b981", strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#chartColor)"
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Games List */}
          <RecentGamesList />
        </div>

        {/* Vertical Stat Cards */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <ScorecardView />
          <HistoryStatsView />
        </div>
      </div>
    </div>
  );
}
