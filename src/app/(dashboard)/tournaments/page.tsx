'use client';

import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { tournamentService, paymentService } from '@/features/tournaments/api/tournament-service';
import { Trophy, MapPin, Users, Coins, ArrowRight, ShieldCheck, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TournamentsPage() {
    const { data: tournaments, isLoading, error } = useQuery({
        queryKey: ['tournaments'],
        queryFn: tournamentService.getAll,
    });

    const initiatePaymentMutation = useMutation({
        mutationFn: paymentService.initiatePayment,
        onSuccess: (data) => {
            // eSewa Form submission
            const form = document.createElement('form');
            form.setAttribute('method', 'POST');
            form.setAttribute('action', 'https://rc-epay.esewa.com.np/api/epay/main/v2/form');

            const params: Record<string, string> = {
                amount: data.amount.toString(),
                tax_amount: '0',
                total_amount: data.amount.toString(),
                transaction_uuid: data.transactionId,
                product_code: data.productCode,
                product_delivery_charge: '0',
                product_service_charge: '0',
                success_url: `${window.location.origin}/tournaments/payment/success`,
                failure_url: `${window.location.origin}/tournaments?payment=failed`,
                signed_field_names: data.signedFieldNames,
                signature: data.signature,
            };

            for (const key in params) {
                const hiddenField = document.createElement('input');
                hiddenField.setAttribute('type', 'hidden');
                hiddenField.setAttribute('name', key);
                hiddenField.setAttribute('value', params[key]);
                form.appendChild(hiddenField);
            }

            document.body.appendChild(form);
            form.submit();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to initiate payment');
        }
    });

    const handlePayAndJoin = (tournamentId: string) => {
        const toastId = toast.loading('Initiating secure payment...', { position: 'bottom-right' });
        initiatePaymentMutation.mutate(tournamentId, {
            onSettled: () => toast.dismiss(toastId)
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 font-bold">
                Failed to load active tournaments.
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header section with solid modern aesthetics */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl shadow-xl shadow-gray-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full w-fit">
                        <Sparkles size={14} />
                        <span className="text-xs font-black uppercase tracking-widest">Premium Events</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Active Tournaments</h1>
                    <p className="text-gray-400 font-medium">Join exclusive tournaments and compete for guaranteed prize pools.</p>
                </div>
            </div>

            {/* Tournaments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments?.map((t) => {
                    const isClosed = t.status === 'CLOSED';
                    const isFull = t.status === 'FULL' || t.currentPlayers >= t.maxPlayers;

                    return (
                        <div key={t._id} className="group relative bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:border-gray-200 transition-all duration-300 flex flex-col">
                            {/* Card Header (Banner) */}
                            <div className="h-32 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />

                                <div className="p-6 text-center z-10">
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-1">{t.title}</h3>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg shadow-sm font-bold text-[10px] text-gray-600 uppercase tracking-widest">
                                        <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'ONLINE' ? 'bg-green-500' : 'bg-purple-500'}`} />
                                        {t.type}
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 flex-1 flex flex-col gap-4">
                                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{t.description}</p>

                                <div className="space-y-3 mt-auto pt-4 border-t border-gray-50">
                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Trophy size={16} className="text-yellow-500" />
                                            <span className="font-bold text-gray-900 truncate">Rs. {t.prizeDetails}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Coins size={16} className="text-green-500" />
                                            <span className="font-bold">Rs. {t.entryFee} Entry</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Users size={16} className="text-blue-500" />
                                            <span className="font-bold">{t.currentPlayers} / {t.maxPlayers}</span>
                                        </div>
                                        {t.type === 'OFFLINE' && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin size={16} className="text-rose-500" />
                                                <span className="font-bold truncate">{t.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer (Action) */}
                            <div className="p-4 bg-gray-50 mt-auto border-t border-gray-100 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {t.isPaid ? (
                                        <span className="text-green-600 flex items-center gap-1"><ShieldCheck size={14} /> Paid</span>
                                    ) : (
                                        <span className="flex items-center gap-1"><AlertCircle size={14} className="text-amber-500" /> Not Paid</span>
                                    )}
                                </div>

                                {t.isPaid ? (
                                    <button
                                        onClick={() => window.location.href = `/tournaments/${t._id}/chat`}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
                                    >
                                        Go to Chat
                                        <ArrowRight size={16} />
                                    </button>
                                ) : isClosed ? (
                                    <button disabled className="px-5 py-2.5 bg-gray-200 text-gray-400 text-sm font-bold rounded-xl cursor-not-allowed">
                                        Closed
                                    </button>
                                ) : isFull ? (
                                    <button disabled className="px-5 py-2.5 bg-amber-100 text-amber-600 text-sm font-bold rounded-xl cursor-not-allowed">
                                        Full
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handlePayAndJoin(t._id)}
                                        disabled={initiatePaymentMutation.isPending}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 whitespace-nowrap"
                                    >
                                        <img src="https://esewa.com.np/common/images/esewa-logo.png" alt="eSewa" className="h-3 object-contain brightness-0 invert" />
                                        Pay & Join
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {tournaments?.length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                        <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">No Active Tournaments</h3>
                        <p className="text-gray-500 mt-2 font-medium">There are currently no tournaments open for registration.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
