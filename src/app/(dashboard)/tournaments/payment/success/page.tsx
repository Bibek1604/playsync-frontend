'use client';

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/features/tournaments/api/tournament-service';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const data = searchParams.get('data');

  const verifyMutation = useMutation({
    mutationFn: paymentService.verifyPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });

  useEffect(() => {
    if (data && !verifyMutation.isPending && !verifyMutation.isSuccess && !verifyMutation.isError) {
      verifyMutation.mutate(data);
    }
  }, [data, verifyMutation]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Invalid Request</h1>
        <p className="text-gray-500 mt-2">No payment data was provided.</p>
        <button
          onClick={() => router.push('/tournaments')}
          className="mt-6 px-6 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
        >
          Back to Tournaments
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh] max-w-md mx-auto">
      {verifyMutation.isPending ? (
        <>
          <Loader2 className="w-16 h-16 text-green-600 animate-spin mb-4" />
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Verifying Payment</h1>
          <p className="text-gray-500 mt-2">Please wait while we verify your transaction securely with eSewa.</p>
        </>
      ) : verifyMutation.isError ? (
        <>
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Payment Failed</h1>
          <p className="text-gray-500 mt-2">We could not verify your payment. Please try again or contact support.</p>
          <button
            onClick={() => router.push('/tournaments')}
            className="mt-8 px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors w-full"
          >
            Back to Tournaments
          </button>
        </>
      ) : (
        <>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Payment Successful!</h1>
          <p className="text-gray-500 mt-2">Your registration is confirmed. You can now access the tournament chat.</p>
          <button
            onClick={() => router.push('/tournaments')}
            className="mt-8 px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors w-full shadow-lg shadow-green-200"
          >
            View Tournaments
          </button>
        </>
      )}
    </div>
  );
}