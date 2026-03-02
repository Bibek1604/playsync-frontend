"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Coins,
  Trophy,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { tournamentApi, TournamentPayment } from "@/features/tournaments/api/tournament.api";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useRouter } from "next/navigation";

const STATUS_ICON: Record<string, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  pending: <Clock className="w-4 h-4 text-amber-500" />,
  failed: <XCircle className="w-4 h-4 text-red-400" />,
  refunded: <XCircle className="w-4 h-4 text-slate-400" />,
};

const STATUS_LABEL: Record<string, string> = {
  success: "Paid",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
};

const STATUS_STYLE: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-slate-50 text-slate-600",
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-NP", {
    day: "numeric", month: "short", year: "numeric",
  }) + " " + new Date(d).toLocaleTimeString("en-NP", { hour: "2-digit", minute: "2-digit" });
}

export default function TournamentDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<{ payments: TournamentPayment[]; totalCollected: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    (async () => {
      setLoading(true);
      try {
        const res = await tournamentApi.getDashboardTransactions();
        setData(res);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/tournaments" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Tournaments
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transaction Dashboard</h1>
          <p className="text-sm text-slate-500">Revenue from your tournaments</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <>
          {/* Summary Card */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 rounded-2xl p-5 space-y-1">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Total Collected</p>
              <p className="text-2xl font-bold text-emerald-800">NPR {data?.totalCollected?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-5 space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Transactions</p>
              <p className="text-2xl font-bold text-slate-800">{data?.payments?.length || 0}</p>
            </div>
            <div className="bg-indigo-50 rounded-2xl p-5 space-y-1">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Players Paid</p>
              <p className="text-2xl font-bold text-indigo-800">
                {data?.payments?.filter((p) => p.status === "success").length || 0}
              </p>
            </div>
          </div>

          {/* Table */}
          {!data?.payments?.length ? (
            <div className="text-center py-16 text-slate-400">
              <Coins className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No transactions yet</p>
              <p className="text-sm">Payments will appear here once players start joining your tournaments.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">Tournament</th>
                      <th className="px-4 py-3 text-left">Player</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-left">Transaction ID</th>
                      <th className="px-4 py-3 text-left">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.payments.map((pay) => (
                      <tr key={pay._id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="font-medium text-slate-700 truncate max-w-[140px]">
                              {typeof pay.tournamentId === "object" ? pay.tournamentId.name : pay.tournamentId}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                              {typeof pay.payerId === "object" ? pay.payerId.username?.[0]?.toUpperCase() : "?"}
                            </div>
                            <span className="text-slate-600">
                              {typeof pay.payerId === "object" ? pay.payerId.username : pay.payerId}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">
                          NPR {pay.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[pay.status]}`}>
                            {STATUS_ICON[pay.status]}
                            {STATUS_LABEL[pay.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400 max-w-[140px] truncate">
                          {pay.transactionId}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {pay.paidAt ? fmt(pay.paidAt) : fmt(pay.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
