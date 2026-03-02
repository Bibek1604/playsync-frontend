"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";

export default function PaymentFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pid = searchParams.get("pid");

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full mx-auto text-center space-y-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-10">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <XCircle className="w-9 h-9 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Payment Failed</h2>
        <p className="text-slate-500 text-sm">
          Your eSewa payment was not completed. You have not been added to the tournament.
        </p>
        {pid && (
          <p className="text-xs text-slate-400">Reference: {pid}</p>
        )}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.back()}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition text-sm"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/tournaments")}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition text-sm"
          >
            Back to Tournaments
          </button>
        </div>
      </div>
    </div>
  );
}
