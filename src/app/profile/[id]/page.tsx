"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { API_URL, getImageUrl } from '@/lib/constants';
import { Card, Avatar, Badge, Skeleton, Button } from '@/components/ui';
import { toast } from '@/lib/toast';
import { Trophy, Target, Monitor, TrendingUp, Calendar, MapPin, Edit3, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/features/auth/store/auth-store';

export default function ProfilePage() {
    const { id } = useParams();
    const currentUser = useAuthStore((state) => state.user);
    const isOwner = currentUser?.id === id || (currentUser as any)?._id === id;

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/v1/users/${id}`);
                if (response.data.success) {
                    setProfile(response.data.data);
                }
            } catch (err: any) {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-8">
                <Skeleton className="h-60 rounded-3xl w-full" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="h-96 rounded-3xl" />
                    <div className="lg:col-span-2 space-y-8">
                        <Skeleton className="h-40 rounded-3xl" />
                        <Skeleton className="h-80 rounded-3xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return <div className="p-12 text-center text-zinc-500">User not found</div>;
    }

    const stats = [
        { label: 'Total Games', value: profile.totalGames || 0, icon: <Monitor size={18} className="text-green-600" />, color: 'bg-green-50 text-green-600' },
        { label: 'Wins', value: profile.wins || 0, icon: <Trophy size={18} className="text-green-600" />, color: 'bg-green-50 text-green-600' },
        { label: 'Losses', value: profile.losses || 0, icon: <Target size={18} className="text-red-500" />, color: 'bg-red-50 text-red-600' },
        { label: 'Win Rate', value: `${(profile.winRate || 0).toFixed(1)}%`, icon: <TrendingUp size={18} className="text-green-600" />, color: 'bg-green-50 text-green-600' },
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-8 min-h-screen bg-gray-50">
            {/* Premium Header/Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-64 md:h-80 rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-indigo-500/10"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-600 to-green-500" />
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                <div className="absolute inset-0 bg-black/20" />

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col md:flex-row items-end justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full md:w-auto">
                        <div className="relative group/avatar">
                            <Avatar
                                src={getImageUrl(profile.avatar)}
                                fallback={profile.fullName}
                                size="xl"
                                className="w-32 h-32 md:w-40 md:h-40 border-8 border-white shadow-2xl"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                        </div>

                        <div className="text-center md:text-left space-y-2 mb-2">
                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                                {profile.fullName}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <Badge variant="success" className="bg-white/20 text-white border-white/20 backdrop-blur-md">
                                    Lvl {profile.level || 1}
                                </Badge>
                                <Badge variant="primary" className="bg-amber-400 text-amber-950 border-none shadow-lg">
                                    <Zap size={10} className="mr-1 fill-current" /> {profile.xp || 0} XP
                                </Badge>
                                {profile.role === 'admin' && (
                                    <Badge className="bg-rose-500 text-white border-none shadow-lg">ADMIN</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {isOwner && (
                        <Button className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md mb-2 rounded-2xl group">
                            <Edit3 size={18} className="mr-2 group-hover:rotate-12 transition-transform" /> Edit Profile
                        </Button>
                    )}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Info & About */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-8 space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Globe size={18} className="text-green-600" /> About Explorer
                        </h3>

                        <p className="text-gray-500 text-sm leading-relaxed italic">
                            "{profile.bio || 'This player prefer to let their gameplay do the talking. No bio provided yet.'}"
                        </p>

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <MapPin size={16} />
                                </div>
                                <span className="text-sm font-medium">{profile.place || 'Somewhere in the World'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Calendar size={16} />
                                </div>
                                <span className="text-sm font-medium">Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                            <Zap size={18} className="text-green-600" /> Level Progress
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Current Status</p>
                                    <p className="text-2xl font-black text-gray-900">Level {profile.level || 1}</p>
                                </div>
                                <p className="text-green-600 text-xs font-bold">{profile.xp % 100} / 100 XP to next</p>
                            </div>

                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${profile.xp % 100}%` }}
                                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                                />
                            </div>

                            <p className="text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest pt-2">
                                Gaming Journey
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Stats & Recent Activity */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="p-6 text-center space-y-3 h-full flex flex-col justify-center items-center group">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform ${stat.color}`}>
                                        {stat.icon}
                                    </div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{stat.label}</p>
                                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <Card className="p-8 space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Match History</h3>
                            <Button variant="outline" size="sm" className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 h-auto rounded-xl">
                                View All
                            </Button>
                        </div>

                        <div className="space-y-6 py-4">
                            {/* Empty state or list would go here */}
                            <div className="p-12 text-center space-y-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto opacity-50">
                                    <Monitor size={24} className="text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">No Recent Matches</p>
                                    <p className="text-xs text-gray-500 mt-1">Ready to start a new adventure? Join a game now.</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
