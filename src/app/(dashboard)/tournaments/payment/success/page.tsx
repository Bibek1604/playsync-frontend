"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, AlertCircle, MessageSquare } from "lucide-react";
import { tournamentApi } from "@/features/tournaments/api/tournament.api";
import { toast } from "@/lib/toast";

const MAX_RETRIES = 6;
const RETRY_DELAYS = [2000, 3000, 4000, 5000, 6000, 7000]; // ms

/**
 * eSewa v2 appends ?data=BASE64 to the success_url.
 * If our success_url already had ?pid=UUID, the redirect URL becomes:
 *   /payment/success?pid=UUID?data=BASE64  (second ? instead of &)
 * URLSearchParams then returns: pid="UUID?data=BASE64", data=null.
 *
 * Strategy:
 * 1. Use eSewa's `data` param if URLSearchParams parsed it correctly
 * 2. Parse the raw query string to find `data=` anywhere (handles double-? case)
 * 3. Fall back to clean `pid` (before any `?`)
 */
function decodeEsewaBase64(raw: string): string | null {
  try {
    const normalized = raw.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    return decoded?.transaction_uuid ?? null;
  } catch {
    return null;
  }
}

function extractTransactionUuid(searchParams: URLSearchParams): string {
  // 1. Standard case: eSewa appended &data= properly
  const cleanData = searchParams.get("data");
  if (cleanData) {
    const fromData = decodeEsewaBase64(cleanData);
    if (fromData) return fromData;
  }

  // 2. Contaminated case: eSewa appended ?data= making pid="UUID?data=BASE64"
  //    Parse the raw browser URL to find `data=` anywhere in the query string.
  if (typeof window !== "undefined") {
    const rawSearch = window.location.href.split("?").slice(1).join("?"); // everything after first ?
    const dataMatch = rawSearch.match(/(?:^|[?&])data=([^&]+)/);
    if (dataMatch?.[1]) {
      const fromRaw = decodeEsewaBase64(decodeURIComponent(dataMatch[1]));
      if (fromRaw) return fromRaw;
    }
  }

  // 3. Fallback: clean pid (strip anything after ? if contaminated)
  const pid = searchParams.get("pid");
  if (pid) return pid.split("?")[0];

  // 4. Last resort
  return searchParams.get("transaction_uuid") ?? "";
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const transactionUuid = extractTransactionUuid(searchParams);

  // Pre-compute initial state: if no UUID in URL we already know it failed
  const initialState = transactionUuid ? "verifying" : "failed";
  const initialErrMsg = transactionUuid
    ? ""
    : "Missing payment reference — no transaction ID found in callback URL. Please contact support.";

  const [state, setState] = useState<"verifying" | "success" | "failed">(initialState);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState(initialErrMsg);
  const [attempt, setAttempt] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const redirectTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-redirect countdown to chat on success
  useEffect(() => {
    if (state === "success" && tournamentId) {
      redirectTimer.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(redirectTimer.current!);
            router.push(`/tournaments/${tournamentId}/chat?verified=1`);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => {
      if (redirectTimer.current) clearInterval(redirectTimer.current);
    };
  }, [state, tournamentId, router]);

  useEffect(() => {
    if (!transactionUuid) return; // already showing failed state from initial render

    let cancelled = false;

    const tryVerify = async (retryCount: number) => {
      try {
        const result = await tournamentApi.verifyPayment(transactionUuid);
        if (cancelled) return;
        if (result.success) {
          setState("success");
          setTournamentId(result.tournamentId);
          toast.success("Payment verified! You have joined the tournament.");
        } else {
          setState("failed");
          setErrorMsg("Payment could not be verified. Please contact support.");
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
        const status = axiosErr?.response?.status;
        const msg = axiosErr?.response?.data?.message || axiosErr?.message || "";

        // 202 = eSewa still PENDING, 404 = DB race condition — both are retriable
        const isRetriable = (status === 202 || status === 404) && retryCount < MAX_RETRIES;

        if (isRetriable) {
          setAttempt(retryCount + 1);
          setTimeout(() => {
            if (!cancelled) tryVerify(retryCount + 1);
          }, RETRY_DELAYS[retryCount] ?? 7000);
        } else {
          setState("failed");
          setErrorMsg(msg || "Payment verification failed. Please contact support.");
          toast.error("Payment verification failed");
        }
      }
    };

    tryVerify(0);
    return () => { cancelled = true; };
  }, [transactionUuid]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full mx-auto text-center space-y-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-10">
        {state === "verifying" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-800">Verifying your payment…</h2>
            <p className="text-slate-500 text-sm">
              Please wait while we confirm your transaction with eSewa.
            </p>
            {attempt > 0 && (
              <p className="text-xs text-amber-500">
                Still waiting for eSewa… attempt {attempt + 1} of {MAX_RETRIES + 1}
              </p>
            )}
          </>
        )}

        {state === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-9 h-9 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Payment Successful!</h2>
            <p className="text-slate-500 text-sm">
              You have been added to the tournament. Redirecting to chat in{" "}
              <span className="font-semibold text-indigo-600">{countdown}s</span>…
            </p>
            {tournamentId && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    if (redirectTimer.current) clearInterval(redirectTimer.current);
                    router.push(`/tournaments/${tournamentId}/chat?verified=1`);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Go to Chat Now
                </button>
                <button
                  onClick={() => {
                    if (redirectTimer.current) clearInterval(redirectTimer.current);
                    router.push(`/tournaments/${tournamentId}`);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition text-sm"
                >
                  View Tournament
                </button>
              </div>
            )}
          </>
        )}

        {state === "failed" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <AlertCircle className="w-9 h-9 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Payment Verification Failed</h2>
            <p className="text-slate-500 text-sm">{errorMsg}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push("/tournaments")}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition text-sm"
              >
                Back to Tournaments
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}