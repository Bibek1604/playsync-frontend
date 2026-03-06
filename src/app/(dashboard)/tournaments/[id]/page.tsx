"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  AlertCircle,
} from "lucide-react";

import { tournamentApi, Tournament } from "@/features/tournaments/api/tournament.api";
import { toast } from "@/lib/toast";
import { submitEsewaPaymentForm } from "@/lib/esewa";
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
  const searchParams = useSearchParams();
  const id = params.id as string;

  const user = useAuthStore((s) => s.user);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const getCurrentUserId = () => String(user?.id || (user as any)?._id || '');

  const isUserParticipant = (t: Tournament | null): boolean => {
    if (!t || !Array.isArray((t as any).participants) || !getCurrentUserId()) return false;
    const userId = getCurrentUserId();
    return (t as any).participants.some((p: any) => {
      const pUserId = typeof p?.userId === 'object' ? (p.userId?._id || p.userId?.id) : p?.userId;
      return pUserId && String(pUserId) === userId;
    });
  };

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

        console.log('[TOURNAMENT] Payment status received:', ps.status);
        console.log('[TOURNAMENT] Tournament data:', { id: t._id, creatorId: t.creatorId });

        // Determine if user is creator
        const creatorId =
          (typeof t?.creatorId === "string"
            ? t.creatorId
            : t?.creatorId?._id || (t?.creatorId as any)?.id) ||
          (t as any)?.creator ||
          (t as any)?.createdBy;

        const isCreator =
          Boolean(user?.id) &&
          Boolean(creatorId) &&
          String(creatorId) === String(user?.id);
        const participantJoined = isUserParticipant(t);

        console.log('[TOURNAMENT] Is creator check:', { userId: user?.id, creatorId, isCreator });

        // Auto-redirect to chat if creator
        if (isCreator) {
          console.log('[TOURNAMENT] ✅ User is creator - redirecting to chat');
          setTimeout(() => router.replace(`/tournaments/${id}/chat`), 100);
          return;
        }

        // Participant fallback: if user is already in participants list, unlock chat.
        if (participantJoined) {
          console.log('[TOURNAMENT] ✅ User is participant - redirecting to chat');
          setPaymentStatus('success');
          setTimeout(() => router.replace(`/tournaments/${id}/chat`), 100);
          return;
        }

        // Check payment status
        const normalizedStatus = (ps.status || '').toLowerCase();
        
        if (normalizedStatus === 'success') {
          console.log('[PAYMENT] ✅ Payment successful - redirecting to chat');
          setTimeout(() => router.replace(`/tournaments/${id}/chat`), 100);
          return;
        } else if (normalizedStatus === 'pending') {
          // Auto-verify pending payments
          console.log('[PAYMENT] 🔄 Pending payment detected - attempting auto-verification');
          try {
            await tournamentApi.verifyPayment(); // Trigger backend fallback verification
            // Re-check status after verification
            const updatedPs = await tournamentApi.getPaymentStatus(id);
            setPaymentStatus(updatedPs.status);
            const updatedStatus = (updatedPs.status || '').toLowerCase();
            
            if (updatedStatus === 'success') {
              console.log('[PAYMENT] ✅ Auto-verification successful - redirecting to chat');
              toast.success('Payment verified! Joining chat...');
              setTimeout(() => router.replace(`/tournaments/${id}/chat`), 100);
              return;
            } else {
              console.log('[PAYMENT] ⚠️ Auto-verification complete but status is:', updatedStatus);
            }
          } catch (err) {
            console.error('[PAYMENT] Auto-verification failed:', err);
          }
        } else {
          console.log('[TOURNAMENT] No auto-redirect - status:', normalizedStatus, 'isCreator:', isCreator);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  // Handle eSewa callback - verify payment when data param is present.
  useEffect(() => {
    const esewaData = searchParams.get("data");
    if (!esewaData || !user) return;

    (async () => {
      setCheckingPayment(true);
      try {
        await tournamentApi.verifyPayment(esewaData);
        toast.success("Payment verified! You can now access the chat.");

        // Refresh payment status after successful verification.
        const ps = await tournamentApi.getPaymentStatus(id);
        setPaymentStatus(ps.status);
        router.replace(`/tournaments/${id}/chat?verified=1`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Payment verification failed");
      } finally {
        setCheckingPayment(false);
      }
    })();
  }, [searchParams, user, id, router]);

  // Immediate verification when eSewa sends success - no pending state shown to user
  useEffect(() => {
    const status = (searchParams.get("status") || '').toLowerCase();
    const data = searchParams.get("data");
    if (!status || status === "failure" || data || !user) return;

    let cancelled = false;

    (async () => {
      try {
        // Immediate verification - no UI feedback during this process
        await tournamentApi.verifyPayment(); // Triggers backend fallback
        setPaymentStatus('success');
        toast.success("✓ Payment successful! Joining chat...");
        router.replace(`/tournaments/${id}/chat?verified=1`);
        return;
        
        // Quick status check - only 2 attempts, fast polling
        for (let attempt = 0; attempt < 2; attempt++) {
          if (cancelled) return;
          const ps = await tournamentApi.getPaymentStatus(id);
          const normalized = (ps.status || "").toLowerCase();

          if (normalized === "success") {
            setPaymentStatus(ps.status);
            toast.success("✓ Payment successful! Joining chat...");
            router.replace(`/tournaments/${id}/chat?verified=1`);
            return;
          }

          if (normalized === "failed") {
            setPaymentStatus(ps.status);
            toast.error("✗ Payment failed. Please try again.");
            router.replace(`/tournaments/${id}`);
            return;
          }
          
          // Quick 500ms wait between attempts
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // After quick checks, assume success and redirect
        toast.success("Payment processing complete!");
        router.replace(`/tournaments/${id}/chat`);
      } catch (err) {
        console.error('[PAYMENT] Verification error:', err);
        toast.error("Payment verification failed. Please contact support.");
        router.replace(`/tournaments/${id}`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, user, id, router]);

  // Handle eSewa failure callback.
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "failure") {
      toast.error("Payment failed. Please try again.");
      router.replace(`/tournaments/${id}`);
    }
  }, [searchParams, id, router]);

  const creatorId =
    (typeof tournament?.creatorId === "string"
      ? tournament.creatorId
      : tournament?.creatorId?._id || (tournament?.creatorId as any)?.id) ||
    (tournament as any)?.creator ||
    (tournament as any)?.createdBy;

  const creatorName =
    (typeof tournament?.creatorId === "object" &&
      (tournament?.creatorId as any)?.fullName) ||
    (typeof tournament?.creatorId === "object" &&
      (tournament?.creatorId as any)?.username) ||
    "Tournament Host";

  const normalizedPaymentStatus = (paymentStatus || "").toLowerCase();

  const isCreator =
    Boolean(user?.id) &&
    Boolean(creatorId) &&
    String(creatorId) === String(user?.id);
  const isPaid = normalizedPaymentStatus === "success" || isUserParticipant(tournament);
  // No pending state - only show success or allow new payment

  const handleRefreshPaymentStatus = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setCheckingPayment(true);
    let attempts = 0;
    const maxAttempts = 3;

    try {
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`[PAYMENT] Refresh attempt ${attempts}/${maxAttempts} for tournament ${id}`);

        try {
          const ps = await tournamentApi.getPaymentStatus(id);
          console.log(`[PAYMENT] Status response:`, ps);

          if (!ps) {
            throw new Error("Empty response from server");
          }

          setPaymentStatus(ps.status);
          const normalized = (ps.status || "").toLowerCase();

          if (normalized === "success") {
            toast.success("✓ Payment confirmed! Redirecting to chat...");
            await new Promise((resolve) => setTimeout(resolve, 800));
            router.push(`/tournaments/${id}/chat?verified=1`);
            return;
          } else if (normalized === "failed") {
            toast.error("✗ Payment failed. Please try again.");
            setCheckingPayment(false);
            return;
          } else if (normalized === "pending") {
            if (attempts < maxAttempts) {
              console.log(`[PAYMENT] Still pending, retrying in 2s...`);
              await new Promise((resolve) => setTimeout(resolve, 2000));
            } else {
              toast("Payment still processing. Please check again in a moment.");
              setCheckingPayment(false);
              return;
            }
          } else {
            // null or unknown
            toast("Payment status not yet available. Please check again.");
            setCheckingPayment(false);
            return;
          }
        } catch (apiError: any) {
          console.error(`[PAYMENT] Attempt ${attempts} failed:`, apiError);
          if (attempts < maxAttempts) {
            console.log(`[PAYMENT] Retrying...`);
            await new Promise((resolve) => setTimeout(resolve, 1500));
          } else {
            throw apiError;
          }
        }
      }
    } catch (err: any) {
      console.error("[PAYMENT] Final error:", err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not check payment status";
      toast.error(errorMsg);
    } finally {
      setCheckingPayment(false);
    }
  };

  const handlePay = async () => {
    if (!user) { router.push("/auth/login"); return; }
    setPaying(true);
    try {
      const data = await tournamentApi.initiatePayment(id);
      const submitResult = submitEsewaPaymentForm({
        paymentUrl: data.paymentUrl,
        params: data.params,
      });

      if (!submitResult.ok) {
        toast.error(submitResult.error || "Invalid eSewa payment payload from server");
        setPaying(false);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to initiate payment";
      if (String(msg).toLowerCase().includes('already joined this tournament')) {
        setPaymentStatus('success');
        toast.success('Already joined. Opening chat...');
        router.push(`/tournaments/${id}/chat`);
        return;
      }
      toast.error(msg);
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
              <p className="text-sm text-slate-500">by {creatorName}</p>
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
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium">
                    <Check className="w-4 h-4" /> Payment Confirmed
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
                    <Coins className="w-4 h-4" /> You paid NPR {t.entryFee.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-sm text-emerald-800">
                  Your payment is successful. Chat access is unlocked for this tournament.
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
