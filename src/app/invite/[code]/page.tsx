"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/lib/constants';
import { Card, Button, Avatar, Badge, Skeleton } from '@/components/ui';
import { toast } from '@/lib/toast';
import { Users, Calendar, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InvitePage() {
    const { code } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [inviteData, setInviteData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInviteDetails = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/v1/games/invite/${code}`);
                if (response.data.success) {
                    setInviteData(response.data.data);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Invalid or expired invite link');
                toast.error(err.response?.data?.message || 'Invalid or expired invite link');
            } finally {
                setLoading(false);
            }
        };

        if (code) {
            fetchInviteDetails();
        }
    }, [code]);

    const handleJoin = async () => {
        setJoining(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to join the game');
                router.push(`/auth/login?redirect=/invite/${code}`);
                return;
            }

            const response = await axios.post(
                `${API_URL}/api/v1/games/invite/${code}/join`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('Successfully joined the game!');
                router.push(`/games/${response.data.data.game.id}`);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to join game');
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
                <Card className="w-full max-w-md p-8 space-y-6">
                    <Skeleton className="w-20 h-20 rounded-full mx-auto" />
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                    <div className="space-y-3 pt-4">
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                </Card>
            </div>
        );
    }

    if (error || !inviteData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="w-full max-w-md p-10 text-center space-y-6">
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle size={32} />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-gray-900">Invite Invalid</h1>
                            <p className="text-gray-500">{error || 'This invite link is no longer active.'}</p>
                        </div>
                        <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
                            Back to Dashboard
                        </Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    const { game } = inviteData;

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                <Card className="w-full max-w-md overflow-hidden p-0 border border-gray-100 shadow-xl">
                    {/* Green Banner */}
                    <div className="h-32 bg-gradient-to-r from-green-700 to-green-500 relative">
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                            <Avatar src={game.imageUrl} fallback={game.title} size="xl" className="border-4 border-white shadow-xl" />
                        </div>
                    </div>

                    <div className="pt-14 pb-8 px-8 text-center space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-gray-900 truncate">{game.title}</h1>
                            <div className="flex items-center justify-center gap-2">
                                <Badge variant="success">Active Invite</Badge>
                                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span className="text-sm font-medium text-gray-500">{game.status}</span>
                            </div>
                        </div>

                        <p className="text-gray-500 text-sm line-clamp-2">
                            {game.description || 'You have been invited to join this exciting game session on PlaySync.'}
                        </p>

                        <div className="grid grid-cols-2 gap-4 py-4 px-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="text-center space-y-1">
                                <div className="flex items-center justify-center gap-1.5 text-gray-400">
                                    <Users size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Players</span>
                                </div>
                                <p className="font-bold text-gray-900">
                                    {game.currentPlayers} / {game.maxPlayers}
                                </p>
                            </div>
                            <div className="text-center space-y-1">
                                <div className="flex items-center justify-center gap-1.5 text-gray-400">
                                    <Calendar size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Status</span>
                                </div>
                                <p className="font-bold text-gray-900">Join Now</p>
                            </div>
                        </div>

                        <Button
                            onClick={handleJoin}
                            isLoading={joining}
                            className="w-full h-14 text-lg rounded-xl"
                        >
                            Accept Invite <ArrowRight className="ml-2" size={20} />
                        </Button>

                        <p className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1">
                            <ShieldCheck size={12} /> Secure Join • PlaySync Platform
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
