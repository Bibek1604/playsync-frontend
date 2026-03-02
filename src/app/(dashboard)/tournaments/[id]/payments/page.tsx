"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Coins,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Users,
  Crown,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { tournamentApi, TournamentPayment, Tournament } from "@/features/tournaments/api/tournament.api";
import { useAuthStore } from "@/features/auth/store/auth-store";

const STATUS_ICON: Record<string, React.ReactNode> = {
  success: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />,
  pending: <Clock className="w-3.5 h-3.5 text-amber-500" />,
  failed: <XCircle className="w-3.5 h-3.5 text-red-400" />,
  refunded: <XCircle className="w-3.5 h-3.5 text-slate-400" />,
};

export default function TournamentPaymentsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuthStore();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [payments, setPayments] = useState<TournamentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    (async () => {
      setLoading(true);
      try {
        const [t, data] = await Promise.all([
          tournamentApi.getById(id),
          tournamentApi.getTournamentPayments(id),
        ]);
        setTournament(t);
        setPayments(data);
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } };
        setError(err?.response?.data?.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user, router]);

  const successPayments = payments.filter((p) => p.status === "success");
  const displayPayments = payments.filter((p) => p.status !== "pending");
  const totalCollected = successPayments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href={`/tournaments/${id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Tournament
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Coins className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Joined Players &amp; Payments</h1>
            <p className="text-sm text-slate-500">{tournament?.name ?? "Loading…"}</p>
          </div>
        </div>
        <Link
          href={`/tournaments/${id}/chat`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition"
        >
          <MessageSquare className="w-4 h-4" /> Tournament Chat
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : (
        <>
          {/* Earnings Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 opacity-80" />
                <span className="text-xs font-semibold uppercase tracking-wide opacity-80">Total Earned</span>
              </div>
              <p className="text-2xl font-bold">NPR {totalCollected.toLocaleString()}</p>
              <p className="text-xs opacity-70 mt-1">{successPayments.length} successful payment{successPayments.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-center">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wide mb-1">Total Joined</p>
              <p className="text-2xl font-bold text-slate-800">
                {successPayments.length + 1}
                <span className="text-sm font-normal text-slate-400"> / {tournament?.maxPlayers ?? "?"}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">including you as host</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-center">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wide mb-1">Entry Fee</p>
              <p className="text-2xl font-bold text-slate-800">NPR {(tournament?.entryFee ?? 0).toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">per participant</p>
            </div>
          </div>

          {/* Participants List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-sm font-semibold text-slate-600">
              <Users className="w-4 h-4" />
              <span>{successPayments.length + 1} participant{successPayments.length + 1 !== 1 ? "s" : ""}</span>
            </div>

            <div className="divide-y divide-slate-50">
              {/* Creator row — always first */}
              {tournament?.creatorId && (
                <div className="flex items-center gap-4 px-5 py-4 bg-amber-50/60">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                    {tournament.creatorId.fullName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800 text-sm">{tournament.creatorId.fullName}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                        <Crown className="w-2.5 h-2.5" /> HOST
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Auto-joined · No entry fee</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-700 text-sm">Receiving NPR {totalCollected.toLocaleString()}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <CheckCircle className="w-3.5 h-3.5" /> Creator
                    </span>
                  </div>
                </div>
              )}

              {/* Paid participants */}
              {displayPayments.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No participants have paid yet.</p>
                </div>
              ) : (
                displayPayments.map((pay) => (
                  <div key={pay._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                      {typeof pay.payerId === "object" ? pay.payerId.fullName?.[0]?.toUpperCase() : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">
                        {typeof pay.payerId === "object" ? pay.payerId.fullName : "Unknown"}
                      </p>
                      <p className="text-xs text-slate-400 font-mono truncate">{pay.transactionId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800 text-sm">NPR {pay.amount.toLocaleString()}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        pay.status === "success" ? "text-emerald-600" :
                        pay.status === "pending" ? "text-amber-600" : "text-red-500"
                      }`}>
                        {STATUS_ICON[pay.status]}
                        {pay.status.charAt(0).toUpperCase() + pay.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
