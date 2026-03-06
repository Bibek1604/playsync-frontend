'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tournamentService, paymentService } from '@/features/tournaments/api/tournament-service';
import { Trophy, Plus, CreditCard, Loader2, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/store/auth-store';

export default function AdminTournamentsPage() {
    const { user, isHydrated, isAuthenticated } = useAuthStore();
    const isReady = isHydrated && isAuthenticated && (user as any)?.role === 'admin';
    const queryClient = useQueryClient();

    const [view, setView] = useState<'active' | 'create' | 'transactions'>('active');

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const v = new URLSearchParams(window.location.search).get('view');
            if (v && ['active', 'create', 'transactions'].includes(v)) {
                setView(v as any);
            }
        }
    }, []);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
    const [location, setLocation] = useState('');
    const [maxPlayers, setMaxPlayers] = useState<number | ''>('');
    const [entryFee, setEntryFee] = useState<number | ''>('');
    const [prizeDetails, setPrizeDetails] = useState('');
    const [startTime, setStartTime] = useState('');

    const createMutation = useMutation({
        mutationFn: tournamentService.create,
        onSuccess: () => {
            toast.success('Tournament created successfully!');
            queryClient.invalidateQueries({ queryKey: ['tournaments'] });
            // reset
            setTitle(''); setDescription(''); setLocation(''); setMaxPlayers(''); setEntryFee(''); setPrizeDetails(''); setStartTime('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create tournament');
        }
    });

    const { data: adminTransactions, isLoading: txLoading } = useQuery({
        queryKey: ['admin-transactions'],
        queryFn: paymentService.getAdminTransactions,
        enabled: isReady && view === 'transactions'
    });

    const { data: rawTournaments, isLoading: tournamentsLoading } = useQuery({
        queryKey: ['tournaments'],
        queryFn: () => tournamentService.getAll(),
        enabled: isReady && view === 'active'
    });

    // Ensure tournaments is always an array
    const tournaments = Array.isArray(rawTournaments) ? rawTournaments : [];

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !maxPlayers || !entryFee || !prizeDetails || !startTime) {
            toast.error('Please fill all required fields'); return;
        }
        if (type === 'OFFLINE' && !location) {
            toast.error('Location is required for offline tournaments'); return;
        }
        createMutation.mutate({
            name: title,
            description,
            type,
            location,
            maxPlayers: Number(maxPlayers),
            entryFee: Number(entryFee),
            prize: prizeDetails,
            startDate: new Date(startTime).toISOString()
        });
    };

    if (!isReady) {
        return <div className="text-center p-12">Checking admin credentials...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in p-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tournament Manager</h1>
                    <p className="text-gray-500 mt-1">Create tournaments and audit player payments.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setView('active')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${view === 'active' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Active Tournaments
                    </button>
                    <button
                        onClick={() => setView('create')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${view === 'create' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Create Tournament
                    </button>
                    <button
                        onClick={() => setView('transactions')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${view === 'transactions' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Transactions Audit
                    </button>
                </div>
            </div>

            {view === 'active' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Platform Tournaments</h3>
                        </div>
                        {tournamentsLoading ? (
                            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                            <th className="p-4 pl-6 border-b border-gray-100">Tournament Name</th>
                                            <th className="p-4 border-b border-gray-100">Type</th>
                                            <th className="p-4 border-b border-gray-100">Players</th>
                                            <th className="p-4 border-b border-gray-100">Status</th>
                                            <th className="p-4 pr-6 border-b border-gray-100 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-sm">
                                        {tournaments?.map((t: any) => (
                                            <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4 pl-6 font-bold text-gray-900">{t.title || t.name}</td>
                                                <td className="p-4 text-gray-500 font-medium">{(t.type || 'ONLINE').toUpperCase()}</td>
                                                <td className="p-4 text-gray-500 font-medium">{t.currentPlayers} / {t.maxPlayers}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${t.status === 'open' || t.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {t.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 pr-6 text-right">
                                                    <a href={`/tournaments/${t._id}/chat`} className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-indigo-100 transition-colors">
                                                        Open Chat
                                                    </a>
                                                    <a href={`/tournaments/${t._id}`} className="ml-2 inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-gray-100 transition-colors">
                                                        View
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!tournaments || tournaments.length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="p-12 text-center text-gray-500">No tournaments found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {view === 'create' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col gap-6 max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">New Tournament</h2>
                            <p className="text-sm text-gray-500">Launch an online or LAN tournament</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Tournament Name *</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-medium"
                                placeholder="e.g. Summer Championship" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Type *</label>
                                <select value={type} onChange={e => setType(e.target.value as any)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 transition-all font-medium">
                                    <option value="ONLINE">Online</option>
                                    <option value="OFFLINE">Offline (LAN)</option>
                                </select>
                            </div>
                            {type === 'OFFLINE' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Location *</label>
                                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 transition-all font-medium" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Description *</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 transition-all font-medium resize-none" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Max Players *</label>
                                <input type="number" min="2" value={maxPlayers} onChange={e => setMaxPlayers(e.target.value as any)} required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 transition-all font-medium" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Entry Fee (NPR) *</label>
                                <input type="number" min="0" value={entryFee} onChange={e => setEntryFee(e.target.value as any)} required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 transition-all font-medium" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Start Time *</label>
                                <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 transition-all font-medium" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Prize Details *</label>
                            <input type="text" value={prizeDetails} onChange={e => setPrizeDetails(e.target.value)} required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 transition-all font-medium"
                                placeholder="e.g. 50000 NPR Pool for Top 3" />
                        </div>

                        <button type="submit" disabled={createMutation.isPending}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl uppercase tracking-widest transition-colors disabled:opacity-50">
                            {createMutation.isPending ? 'Creating...' : 'Create Tournament'}
                        </button>
                    </form>
                </div>
            )}

            {view === 'transactions' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="p-4 bg-green-100 text-green-600 rounded-2xl">
                                <CreditCard size={32} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Collected</p>
                                <p className="text-3xl font-black text-gray-900 mt-1">Rs. {adminTransactions?.totalCollected?.toLocaleString() || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Payment Audit Log</h3>
                        </div>
                        {txLoading ? (
                            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                            <th className="p-4 pl-6 border-b border-gray-100">Date</th>
                                            <th className="p-4 border-b border-gray-100">Player</th>
                                            <th className="p-4 border-b border-gray-100">Tournament</th>
                                            <th className="p-4 border-b border-gray-100">Txn UUID</th>
                                            <th className="p-4 border-b border-gray-100 text-right">Amount</th>
                                            <th className="p-4 pr-6 border-b border-gray-100 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-sm">
                                        {adminTransactions?.transactions?.map((tx: any) => (
                                            <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4 pl-6 text-gray-500 font-medium">{new Date(tx.createdAt).toLocaleString()}</td>
                                                <td className="p-4 font-bold text-gray-900">{tx.payerId?.fullName || 'Unknown'}</td>
                                                <td className="p-4 text-gray-500">{tx.tournamentId?.title || 'Unknown'}</td>
                                                <td className="p-4 font-mono text-xs text-gray-400">{tx.transactionId}</td>
                                                <td className="p-4 text-right font-black text-gray-900">Rs. {tx.amount}</td>
                                                <td className="p-4 pr-6 text-right">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${tx.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : tx.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!adminTransactions?.transactions || adminTransactions.transactions.length === 0) && (
                                            <tr>
                                                <td colSpan={6} className="p-12 text-center text-gray-500">No transactions found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
