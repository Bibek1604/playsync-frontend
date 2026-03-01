'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Gamepad2, Globe, Search, Plus, Loader2, Trash2,
    Clock, MapPin, Users, Play, FolderOpen,
    ChevronRight, LayoutGrid, List, Sparkles,
    ShieldCheck, Activity
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService } from '@/features/games/api/game-service';
import CreateGameModal from '@/features/games/components/CreateGameModal';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { getSocket } from '@/lib/socket';
import { toast } from '@/lib/toast';
import { ConfirmModal, useModal, Card, Button, Badge, IconButton } from '@/components/ui';
import { getImageUrl } from '@/lib/constants';

interface GamesPageProps {
    category: 'ONLINE' | 'OFFLINE';
}

export default function GamesPage({ category }: GamesPageProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [unreadGames, setUnreadGames] = useState<Set<string>>(new Set());
    const processedMessages = useRef<Set<string>>(new Set());
    const deleteModal = useModal();
    const [gameToDelete, setGameToDelete] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [useNearby, setUseNearby] = useState(false);
    const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [geoError, setGeoError] = useState<string | null>(null);

    const isOnline = category === 'ONLINE';

    // --- Configuration ---
    const headerTitle = isOnline ? 'Online Hub' : 'Local Arena';
    const headerSubtitle = isOnline ? 'Real-time multiplayer lobbies' : 'Your private gaming sessions';
    const createButtonText = isOnline ? 'Host Lobby' : 'New Session';
    const HeaderIcon = isOnline ? Globe : Gamepad2;

    // --- Geolocation ---
    const requestLocation = () => {
        if (!navigator.geolocation) {
            setGeoError('Geolocation not supported');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setUseNearby(true);
                setGeoError(null);
                toast.success('Location synchronized');
            },
            (err) => {
                console.error('Geo Error:', err);
                setGeoError('Access denied or unavailable');
                setUseNearby(false);
                toast.error('Location sync failed');
            },
            { enableHighAccuracy: true }
        );
    };

    // --- Data Fetching ---
    const { data, isLoading } = useQuery({
        queryKey: ['games', category, searchQuery, useNearby, userCoords],
        queryFn: () => gameService.getAll({
            category,
            search: searchQuery,
            latitude: useNearby ? userCoords?.lat : undefined,
            longitude: useNearby ? userCoords?.lng : undefined,
            radius: useNearby ? 10 : undefined, // 10km as requested
            sortBy: useNearby ? 'distance' : 'createdAt'
        })
    });

    // --- Socket for Notifications ---
    useEffect(() => {
        if (!user || !data?.games) return;
        const userId = user.id || (user as any)._id;
        const socket = getSocket((useAuthStore.getState() as any).accessToken);

        const joinedGames = data.games.filter((g: any) => {
            const creatorId = typeof g.creatorId === 'object' ? (g.creatorId as any)._id : g.creatorId;
            const isParticipant = g.participants?.some((p: any) => (p.userId?._id || p.userId)?.toString() === userId?.toString());
            return (creatorId?.toString() === userId?.toString()) || isParticipant;
        });

        joinedGames.forEach((g: any) => socket.emit('game:subscribe', g._id));

        const handleNewMessage = (payload: any) => {
            if (payload?.gameId) {
                const msgUserId = payload.user?._id || payload.user?.id || payload.user;
                if (msgUserId?.toString() === userId?.toString()) return;
                if (processedMessages.current.has(payload._id)) return;
                processedMessages.current.add(payload._id);
                setUnreadGames(prev => new Set(prev).add(payload.gameId));
            }
        };

        socket.on('chat:message', handleNewMessage);
        return () => { socket.off('chat:message', handleNewMessage); };
    }, [data, user]);

    const games = data?.games || [];

    // --- Actions ---
    const deleteMutation = useMutation({
        mutationFn: (id: string) => gameService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['games'] });
            deleteModal.close();
            toast.success('Session terminated');
        },
        onError: () => toast.error('Termination failed: Check permissions')
    });

    const joinMutation = useMutation({
        mutationFn: (id: string) => gameService.join(id),
        onSuccess: (_, variables) => router.push(`/games/${isOnline ? 'online' : 'offline'}/${variables}`),
        onError: (error: any, variables) => {
            if (error?.response?.data?.message?.toLowerCase().includes('already joined')) {
                router.push(`/games/${isOnline ? 'online' : 'offline'}/${variables}`);
                return;
            }
            toast.error(error?.response?.data?.message || 'Failed to connect');
        }
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto py-6">

            {/* ── Sub-Header Strategy ── */}
            <div className="relative overflow-hidden bg-white border border-gray-100 rounded-xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-12 group shadow-sm transition-all hover:shadow-md">
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-50/30 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none group-hover:bg-green-100/30 transition-colors" />

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-xl bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-100 ring-4 ring-green-50 transform group-hover:scale-105 transition-transform">
                        <HeaderIcon size={32} />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-green-600 mb-2">
                            <Sparkles size={12} className="fill-current" />
                            Active Infrastructure
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">{headerTitle}</h1>
                        <p className="text-gray-500 font-medium max-w-md">{headerSubtitle}</p>
                    </div>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100 h-12 items-center">
                        <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-green-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                            <LayoutGrid size={18} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-green-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                            <List size={18} />
                        </button>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="rounded-lg shadow-sm">
                        <Plus size={18} className="mr-2" />
                        {createButtonText}
                    </Button>
                </div>
            </div>

            {/* ── Search & Filter Bar ── */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search sessions by title, game or host..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-lg outline-none focus:ring-4 focus:ring-green-50 focus:border-green-400 text-gray-900 font-medium shadow-sm transition-all"
                    />
                </div>
                <div className="flex gap-3 h-12">
                    {!isOnline && (
                        <button
                            onClick={() => useNearby ? setUseNearby(false) : requestLocation()}
                            className={`flex items-center gap-3 px-6 h-full rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all border ${useNearby
                                ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'
                                }`}
                        >
                            <MapPin size={16} className={useNearby ? 'animate-bounce' : ''} />
                            {useNearby ? 'Nearby Active (10km)' : 'Enable Nearby Sync'}
                        </button>
                    )}
                    <Badge variant="secondary" size="lg" className="h-full px-6 rounded-lg border border-gray-100 font-bold">All Modules</Badge>
                </div>
            </div>

            {/* ── Main Content Area ── */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-8 bg-white border border-gray-100 rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-green-50/20 to-transparent pointer-events-none" />
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-white border border-green-100 flex items-center justify-center shadow-lg shadow-green-100/50 animate-bounce">
                            <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white shadow-md ring-4 ring-white">
                            <ShieldCheck size={16} />
                        </div>
                    </div>
                    <div className="text-center relative z-10">
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-[0.3em] mb-3">Protocol: Syncing</p>
                        <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Accessing Neural Records...</h3>
                        <p className="text-gray-400 font-medium mt-2 text-sm italic">Synchronizing with global gaming nodes</p>
                    </div>
                </div>
            ) : games.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 bg-white border border-gray-100 rounded-xl shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
                    <div className="w-24 h-24 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 mb-8 relative group">
                        <div className="absolute inset-0 bg-green-50 rounded-3xl scale-0 group-hover:scale-100 transition-transform duration-500" />
                        <FolderOpen className="w-12 h-12 relative z-10 transition-colors group-hover:text-green-600" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">System Status: Idle</h3>
                    <p className="text-gray-500 font-medium mt-3 text-center max-w-sm">No active synchronization hooks found in this sector. Initiate a new session to begin deployment.</p>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="mt-10 px-10 rounded-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-95">
                        Initialize First Module
                    </Button>
                </div>
            ) : (
                <div className={viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8"
                    : "flex flex-col gap-6"
                }>
                    {games.map((game, idx) => {
                        const userId = user?.id || (user as any)?._id;
                        const creatorId = (game.creatorId as any)?._id || (game.creatorId as any)?.id || game.creatorId;
                        const isCreator = userId?.toString() === creatorId?.toString();
                        const isParticipant = game.participants?.some(p => ((p.userId as any)?._id || (p.userId as any)?.id || p.userId)?.toString() === userId?.toString());
                        const isJoined = isCreator || isParticipant;

                        if (viewMode === 'list') {
                            return (
                                <Card key={game._id} className={`p-4 flex flex-col sm:flex-row items-center gap-6 border-gray-100 bg-white hover:bg-gray-50/50 transition-all rounded-xl shadow-sm hover:shadow-md ${isJoined ? 'ring-2 ring-green-600/5 border-green-200/30' : ''}`}>
                                    <div className="w-32 h-20 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-100 shadow-sm relative">
                                        {game.imageUrl ? (
                                            <img src={getImageUrl(game.imageUrl)} alt={game.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl grayscale opacity-30">🎮</div>
                                        )}
                                        <div className="absolute top-0 right-0 p-1">
                                            {isJoined && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-bold text-gray-900 truncate">{game.title}</h4>
                                            {isJoined && <Badge variant="success" size="sm">Connected</Badge>}
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Activity size={12} className="text-green-500" /> {game.category} Node</span>
                                            <span className="flex items-center gap-1.5"><Users size={12} className="text-green-600" /> {game.currentPlayers || 0}/{game.maxPlayers} Syncing</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto">
                                        {isCreator && (
                                            <IconButton
                                                icon={Trash2}
                                                variant="outline"
                                                size="md"
                                                className="rounded-lg text-red-500 hover:bg-red-50 border-gray-100"
                                                onClick={(e) => { e.stopPropagation(); setGameToDelete(game._id); deleteModal.open(); }}
                                            />
                                        )}
                                        <Button
                                            size="md"
                                            onClick={() => isJoined ? router.push(`/games/${isOnline ? 'online' : 'offline'}/${game._id}`) : joinMutation.mutate(game._id)}
                                            variant={isJoined ? "outline" : "primary"}
                                            className="px-8 rounded-lg font-bold"
                                        >
                                            {isJoined ? 'Enter System' : 'Sync In'}
                                        </Button>
                                    </div>
                                </Card>
                            );
                        }

                        return (
                            <Card key={game._id} className="flex flex-col h-full group p-0 overflow-hidden border-gray-100 bg-white transition-all hover:shadow-xl rounded-xl shadow-sm hover:-translate-y-1 duration-300">
                                <div className="aspect-[4/3] w-full bg-gray-50 relative overflow-hidden group-hover:opacity-95 transition-all">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                                    {game.imageUrl ? (
                                        <img src={getImageUrl(game.imageUrl)} alt={game.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl grayscale opacity-20 transform -rotate-12">🎮</div>
                                    )}
                                    <div className="absolute top-4 right-4 flex gap-2 z-20">
                                        {isJoined && unreadGames.has(game._id) && (
                                            <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-100 animate-pulse" />
                                        )}
                                        {isCreator && (
                                            <IconButton
                                                icon={Trash2}
                                                variant="outline"
                                                size="sm"
                                                className="bg-white/95 backdrop-blur-sm text-red-500 shadow-sm border-none hover:bg-red-500 hover:text-white rounded-lg"
                                                onClick={(e) => { e.stopPropagation(); setGameToDelete(game._id); deleteModal.open(); }}
                                            />
                                        )}
                                    </div>
                                    <div className="absolute bottom-4 left-4 z-20">
                                        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-white/50">
                                            <Users size={12} className="text-green-600" />
                                            <span className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">{game.currentPlayers}/{game.maxPlayers} Players</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1 relative">
                                    <div className="mb-4 flex-1">
                                        <div className="flex items-center gap-2 mb-2 font-bold text-[9px] uppercase tracking-widest text-green-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Active Protocol
                                        </div>
                                        <h3 className="font-extrabold text-lg text-gray-900 tracking-tight line-clamp-1 truncate group-hover:text-green-600 transition-colors uppercase">{game.title}</h3>
                                        <div className="flex flex-wrap gap-2 pt-3">
                                            {game.tags?.slice(0, 3).map((tag, i) => (
                                                <span key={i} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[8px] font-bold text-gray-400 uppercase tracking-widest">{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2.5 mb-5">
                                        <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 border border-gray-100 rounded-lg group/item hover:bg-green-50/50 hover:border-green-100 transition-all">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-green-600 shadow-sm group-hover/item:scale-110 transition-transform">
                                                <Clock size={14} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[7px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">Time</span>
                                                <span className="text-[11px] font-bold text-gray-900">{new Date(game.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 border border-gray-100 rounded-lg group/item hover:bg-green-50/50 hover:border-green-100 transition-all">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-green-600 shadow-sm group-hover/item:scale-110 transition-transform">
                                                <MapPin size={14} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[7px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">Area</span>
                                                <span className="text-[11px] font-bold text-gray-900 truncate">{game.locationName || 'Global'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => {
                                            if (isJoined) {
                                                setUnreadGames(prev => { const n = new Set(prev); n.delete(game._id); return n; });
                                                router.push(`/games/${isOnline ? 'online' : 'offline'}/${game._id}`);
                                            } else {
                                                joinMutation.mutate(game._id);
                                            }
                                        }}
                                        variant={isJoined ? "outline" : "primary"}
                                        isFullWidth
                                        isLoading={joinMutation.isPending && joinMutation.variables === game._id}
                                        className={`rounded-lg font-bold text-sm tracking-tight transition-all active:scale-[0.98] ${isJoined
                                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-600 hover:text-white hover:border-green-600'
                                            : 'shadow-sm'
                                            }`}
                                    >
                                        {isJoined ? 'Connect to Session' : 'Initiate Sync'}
                                        {isJoined ? <ChevronRight size={18} className="ml-2" /> : <Plus size={18} className="ml-2" />}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <CreateGameModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} category={category} />

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                onConfirm={async () => { if (gameToDelete) deleteMutation.mutate(gameToDelete); }}
                title="Deconstruct Instance"
                message="Are you sure you want to remove this module? This action will terminate all active sync hooks for secondary users."
                confirmText="Terminate Module"
                variant="danger"
            />
        </div>
    );
}
