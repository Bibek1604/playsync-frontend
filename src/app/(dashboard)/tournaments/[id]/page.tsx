"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  ArrowLeft,
  Users,
  MapPin,
  Calendar,
  Coins,
  Gift,
  Wifi,
  WifiOff,
  MessageSquare,
  Loader2,
  ShieldCheck,
  Lock,
  Check,
  Crown,
  BadgeCheck,
} from "lucide-react";
import { tournamentApi, Tournament } from "@/features/tournaments/api/tournament.api";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/features/auth/store/auth-store";

const STATUS_LABELS: Record<string, string> = {
  open: "Open for Registration",
  full: "Tournament Full",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_STYLES: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700",
  full: "bg-amber-100 text-amber-700",
  ongoing: "bg-blue-100 text-blue-700",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-100 text-red-600",
};

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const user = useAuthStore((s) => s.user);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // hidden eSewa form ref
  const formRef = useRef<HTMLFormElement>(null);
  const [esewaParams, setEsewaParams] = useState<{ url: string; params: Record<string, string> } | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [t, ps] = await Promise.all([
          tournamentApi.getById(id),
          user ? tournamentApi.getPaymentStatus(id) : Promise.resolve({ status: null }),
        ]);
        setTournament(t);
        setPaymentStatus(ps.status);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  // Auto-submit eSewa form once params are set
  useEffect(() => {
    if (esewaParams && formRef.current) {
      formRef.current.submit();
    }
  }, [esewaParams]);

  const isCreator = user && tournament?.creatorId._id === user.id;
  const isPaid = paymentStatus === "success";

  const handlePay = async () => {
    if (!user) { router.push("/auth/login"); return; }
    setPaying(true);
    try {
      const data = await tournamentApi.initiatePayment(id);
      setEsewaParams({ url: data.paymentUrl, params: data.params });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to initiate payment");
      setPaying(false);
    }
  };

  const handleGoToChat = () => {
    router.push(`/tournaments/${id}/chat`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!tournament) {
    return <div className="text-center py-32 text-slate-400">Tournament not found.</div>;
  }

  const t = tournament;
  const fillPct = Math.round((t.currentPlayers / t.maxPlayers) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hidden eSewa form — auto-submitted */}
      {esewaParams && (
        <form
          ref={formRef}
          action={esewaParams.url}
          method="POST"
          style={{ display: "none" }}
        >
          {Object.entries(esewaParams.params).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
        </form>
      )}

      {/* Back */}
      <Link href="/tournaments" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Tournaments
      </Link>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-3 bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-500" />
        <div className="p-6 space-y-4">
          {/* Top Row */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[t.status]}`}>
                  {STATUS_LABELS[t.status]}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  {t.type === "online" ? <><Wifi className="w-3.5 h-3.5 text-emerald-500" /> Online</> : <><WifiOff className="w-3.5 h-3.5 text-indigo-500" /> Offline</>}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800">{t.name}</h1>
              <p className="text-sm text-slate-500">by {t.creatorId?.username}</p>
            </div>
            <Trophy className="w-8 h-8 text-emerald-400" />
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">{t.description}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Stat icon={<Gift className="text-emerald-500" />} label="Prize" value={t.prize} />
            <Stat icon={<Coins className="text-amber-500" />} label="Entry Fee" value={`NPR ${t.entryFee.toLocaleString()}`} />
            <Stat icon={<Users className="text-blue-500" />} label="Players" value={`${t.currentPlayers}/${t.maxPlayers}`} />
            <Stat icon={<Calendar className="text-slate-400" />} label="Start Date" value={new Date(t.startDate).toLocaleDateString("en-NP", { day: "numeric", month: "short", year: "numeric" })} />
            {t.location && <Stat icon={<MapPin className="text-rose-400" />} label="Location" value={t.location} />}
          </div>

          {/* Players progress bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Registration Progress</span>
              <span>{fillPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            {isCreator ? (
              <div className="space-y-4">
                {/* Host auto-join banner */}
                <div className="flex items-start gap-3 p-4 bg-linear-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Crown className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800 text-sm">You&apos;re the Host</p>
                      <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                        <BadgeCheck className="w-3 h-3" /> Auto-Joined
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      You&apos;re automatically in this tournament — no entry fee required. You&apos;ll receive all collected entry fees.
                    </p>
                    <p className="text-xs font-semibold text-emerald-600 mt-1.5">
                      {t.currentPlayers} player{t.currentPlayers !== 1 ? "s" : ""} joined · NPR {(t.currentPlayers * t.entryFee).toLocaleString()} collected
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleGoToChat}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition text-sm"
                  >
                    <MessageSquare className="w-4 h-4" /> Tournament Chat
                  </button>
                  <Link
                    href={`/tournaments/${id}/payments`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition text-sm"
                  >
                    <Users className="w-4 h-4" /> View Joined Players &amp; Payments
                  </Link>
                </div>
              </div>
            ) : isPaid ? (
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium">
                  <Check className="w-4 h-4" /> Payment Confirmed
                </div>
                <button
                  onClick={handleGoToChat}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition text-sm"
                >
                  <MessageSquare className="w-4 h-4" /> Go to Chat
                </button>
              </div>
            ) : t.status === "full" ? (
              <button disabled className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-400 font-semibold rounded-xl cursor-not-allowed text-sm">
                <Users className="w-4 h-4" /> Tournament Full
              </button>
            ) : t.status !== "open" ? (
              <button disabled className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-400 font-semibold rounded-xl cursor-not-allowed text-sm">
                Tournament {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
              </button>
            ) : (
              <button
                onClick={handlePay}
                disabled={paying}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold rounded-xl transition text-sm shadow-lg"
              >
                {paying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                {paying ? "Redirecting to eSewa…" : `Pay NPR ${t.entryFee.toLocaleString()} via eSewa & Join`}
              </button>
            )}

            {/* Payment gated notice */}
            {!isCreator && !isPaid && t.status === "open" && (
              <div className="mt-3 flex items-start gap-2 text-xs text-slate-400">
                <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                Chat access is unlocked after successful payment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50">
      <span className="w-4 h-4 mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}
