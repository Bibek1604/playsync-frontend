"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth-store";
import {
    Users, Gamepad2, Wifi, WifiOff, Activity, Search,
    ChevronLeft, ChevronRight, Shield, Mail, Calendar, Eye,
    X, Crown, Clock, TrendingUp, UserCheck, BarChart3, AlertCircle, Lock,
} from "lucide-react";
import {
    adminService,
    AdminUser,
    AdminGame,
} from "@/features/admin/api/admin-service";
import { Avatar } from "@/components/ui";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";
const fmtTime = (d?: string) =>
    d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

// ─── Reusable Tokens ──────────────────────────────────────────────────────────
const card = "bg-white rounded-xl border border-[#E5E7EB]";
const inputCls = "w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg outline-none transition-all focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 text-[#1F2937] placeholder:text-[#9CA3AF]";
const btnGreen = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:shadow-md active:scale-95";

// ─── Status / Category badges ─────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { bg: string; text: string }> = {
        OPEN: { bg: '#F0FDF4', text: '#16A34A' },
        FULL: { bg: '#FFFBEB', text: '#D97706' },
        ENDED: { bg: '#F3F4F6', text: '#6B7280' },
        CANCELLED: { bg: '#FEF2F2', text: '#DC2626' },
    };
    const t = map[status] ?? { bg: '#F3F4F6', text: '#6B7280' };
    return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase"
            style={{ background: t.bg, color: t.text }}>
            {status}
        </span>
    );
}

function CategoryBadge({ category }: { category: "ONLINE" | "OFFLINE" }) {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
            style={category === "ONLINE"
                ? { background: '#EFF6FF', color: '#2563EB' }
                : { background: '#F5F3FF', color: '#7C3AED' }}>
            {category === "ONLINE" ? <Wifi size={10} /> : <WifiOff size={10} />}
            {category}
        </span>
    );
}

function RoleBadge({ role }: { role: string }) {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
            style={role === "admin"
                ? { background: '#F5F3FF', color: '#7C3AED' }
                : { background: '#F0FDF4', color: '#16A34A' }}>
            {role === "admin" && <Shield size={10} />}
            {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent }: {
    icon: any; label: string; value: number | string; accent: string;
}) {
    return (
        <div className={`${card} p-5 flex items-center gap-4`}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${accent}15`, color: accent }}>
                <Icon size={20} strokeWidth={2} />
            </div>
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>{label}</p>
                <p className="text-2xl font-extrabold mt-0.5" style={{ color: '#1F2937' }}>{value}</p>
            </div>
        </div>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ pagination, onPage }: { pagination: any; onPage: (p: number) => void }) {
    if (!pagination || pagination.totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-between px-6 py-3" style={{ borderTop: '1px solid #E5E7EB' }}>
            <p className="text-xs text-[#6B7280]">
                {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of <span className="font-bold">{pagination.total}</span>
            </p>
            <div className="flex items-center gap-1">
                <button disabled={!pagination.hasPrev} onClick={() => onPage(pagination.page - 1)}
                    className="p-1.5 rounded-lg disabled:opacity-30 transition-all hover:bg-[#F8F9FA]">
                    <ChevronLeft size={15} />
                </button>
                <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ color: '#1F2937', background: '#F8F9FA' }}>
                    {pagination.page} / {pagination.totalPages}
                </span>
                <button disabled={!pagination.hasNext} onClick={() => onPage(pagination.page + 1)}
                    className="p-1.5 rounded-lg disabled:opacity-30 transition-all hover:bg-[#F8F9FA]">
                    <ChevronRight size={15} />
                </button>
            </div>
        </div>
    );
}

// ─── Table components ─────────────────────────────────────────────────────────
const Th = ({ children }: { children: React.ReactNode }) => (
    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-widest"
        style={{ color: '#6B7280', background: '#F8F9FA' }}>
        {children}
    </th>
);

const SkeletonRow = ({ cols }: { cols: number }) => (
    <tr>
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-5 py-3.5">
                <div className="h-4 rounded animate-pulse" style={{ background: '#F3F4F6' }} />
            </td>
        ))}
    </tr>
);

// ─── User Detail Modal ────────────────────────────────────────────────────────
function UserModal({ userId, onClose }: { userId: string; onClose: () => void }) {
    const { data: user, isLoading } = useQuery({
        queryKey: ["admin-user", userId],
        queryFn: () => adminService.getUserById(userId),
    });
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.25)' }}>
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <h3 className="text-sm font-bold" style={{ color: '#1F2937' }}>User Details</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg transition-all hover:bg-[#F8F9FA]">
                        <X size={16} style={{ color: '#6B7280' }} />
                    </button>
                </div>
                {isLoading ? (
                    <div className="p-8 space-y-3">
                        {[72, 48, 48, 48].map((h, i) => (
                            <div key={i} className="rounded-lg animate-pulse" style={{ height: h, background: '#F3F4F6' }} />
                        ))}
                    </div>
                ) : !user ? (
                    <div className="p-8 text-center text-sm" style={{ color: '#6B7280' }}>User not found.</div>
                ) : (
                    <div className="p-6 space-y-5">
                        <div className="flex items-center gap-4">
                            <Avatar src={user.profilePicture} fallback={user.fullName} size="xl" />
                            <div>
                                <h4 className="text-lg font-bold" style={{ color: '#1F2937' }}>{user.fullName}</h4>
                                <p className="text-sm flex items-center gap-1.5 mt-0.5" style={{ color: '#6B7280' }}>
                                    <Mail size={13} />{user.email}
                                </p>
                                <div className="mt-2"><RoleBadge role={user.role} /></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Games Created", value: user.gamesCreated ?? "—", icon: Gamepad2 },
                                { label: "Games Joined", value: user.gamesJoined ?? "—", icon: UserCheck },
                                { label: "Joined", value: fmtDate(user.createdAt), icon: Calendar },
                                { label: "Last Login", value: user.lastLogin ? fmtDate(user.lastLogin) : "Never", icon: Clock },
                            ].map((item) => (
                                <div key={item.label} className="rounded-xl p-3.5 flex items-center gap-3" style={{ background: '#F8F9FA', border: '1px solid #E5E7EB' }}>
                                    <item.icon size={14} style={{ color: '#16A34A', flexShrink: 0 }} />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#6B7280' }}>{item.label}</p>
                                        <p className="text-sm font-bold mt-0.5" style={{ color: '#1F2937' }}>{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Game Detail Modal ────────────────────────────────────────────────────────
function GameModal({ gameId, onClose }: { gameId: string; onClose: () => void }) {
    const { data: game, isLoading } = useQuery({
        queryKey: ["admin-game", gameId],
        queryFn: () => adminService.getGameById(gameId),
    });
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.25)' }}>
            <div className="bg-white rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
                <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <h3 className="text-sm font-bold" style={{ color: '#1F2937' }}>Game Details</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg transition-all hover:bg-[#F8F9FA]">
                        <X size={16} style={{ color: '#6B7280' }} />
                    </button>
                </div>
                {isLoading ? (
                    <div className="p-8 space-y-3 flex-1">
                        {[80, 48, 48].map((h, i) => (
                            <div key={i} className="rounded-lg animate-pulse" style={{ height: h, background: '#F3F4F6' }} />
                        ))}
                    </div>
                ) : !game ? (
                    <div className="p-8 text-center text-sm" style={{ color: '#6B7280' }}>Game not found.</div>
                ) : (
                    <div className="overflow-y-auto flex-1 p-6 space-y-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h4 className="text-xl font-bold" style={{ color: '#1F2937' }}>{game.title}</h4>
                                {game.description && <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{game.description}</p>}
                                <div className="flex items-center gap-2 mt-2.5">
                                    <CategoryBadge category={game.category} />
                                    <StatusBadge status={game.status} />
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-3xl font-extrabold" style={{ color: '#1F2937' }}>
                                    {game.currentPlayers}<span className="text-lg font-normal" style={{ color: '#D1D5DB' }}>/{game.maxPlayers}</span>
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#6B7280' }}>Players</p>
                            </div>
                        </div>
                        {game.creator && (
                            <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: '#F8F9FA', border: '1px solid #E5E7EB' }}>
                                <Crown size={13} style={{ color: '#D97706', flexShrink: 0 }} />
                                <Avatar src={game.creator.profilePicture} fallback={game.creator.fullName} size="sm" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#6B7280' }}>Host</p>
                                    <p className="text-sm font-bold" style={{ color: '#1F2937' }}>{game.creator.fullName}</p>
                                    <p className="text-xs" style={{ color: '#6B7280' }}>{game.creator.email}</p>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl p-3.5" style={{ background: '#F8F9FA', border: '1px solid #E5E7EB' }}>
                                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#6B7280' }}>Created</p>
                                <p className="text-sm font-bold mt-0.5" style={{ color: '#1F2937' }}>{fmtDate(game.createdAt)}</p>
                                <p className="text-xs" style={{ color: '#9CA3AF' }}>{fmtTime(game.createdAt)}</p>
                            </div>
                            {game.endTime && (
                                <div className="rounded-xl p-3.5" style={{ background: '#F8F9FA', border: '1px solid #E5E7EB' }}>
                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#6B7280' }}>End Time</p>
                                    <p className="text-sm font-bold mt-0.5" style={{ color: '#1F2937' }}>{fmtDate(game.endTime)}</p>
                                    <p className="text-xs" style={{ color: '#9CA3AF' }}>{fmtTime(game.endTime)}</p>
                                </div>
                            )}
                        </div>
                        {game.participants && game.participants.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#6B7280' }}>
                                    Participants ({game.participants.length})
                                </p>
                                <div className="space-y-2">
                                    {game.participants.map((p, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-all" style={{ background: '#F8F9FA', border: '1px solid #E5E7EB' }}>
                                            <Avatar src={p.userId?.profilePicture} fallback={p.userId?.fullName || "?"} size="sm" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate" style={{ color: '#1F2937' }}>{p.userId?.fullName || "Unknown"}</p>
                                                <p className="text-[10px]" style={{ color: '#9CA3AF' }}>Joined {fmtDate(p.joinedAt)}</p>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                style={p.status === "ACTIVE"
                                                    ? { background: '#F0FDF4', color: '#16A34A' }
                                                    : { background: '#F3F4F6', color: '#6B7280' }}>
                                                {p.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Users Tab ───────────────────────────────────────────────────────────────
function UsersTab({ isReady }: { isReady: boolean }) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    React.useEffect(() => {
        const t = setTimeout(() => setDebounced(search), 400);
        return () => clearTimeout(t);
    }, [search]);
    React.useEffect(() => { setPage(1); }, [debounced]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["admin-users", page, debounced],
        queryFn: () => adminService.getUsers({ page, limit: 15, search: debounced || undefined }),
        enabled: isReady,
    });
    const users: AdminUser[] = data?.data ?? [];

    return (
        <>
            {selectedId && <UserModal userId={selectedId} onClose={() => setSelectedId(null)} />}
            <div className={`${card} overflow-hidden`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <div>
                        <h3 className="text-sm font-bold" style={{ color: '#1F2937' }}>All Users</h3>
                        {data?.pagination && <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{data.pagination.total} registered</p>}
                    </div>
                    <div className="relative w-full sm:w-60">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                        <input id="user-search" type="text" placeholder="Search users…" value={search}
                            onChange={e => setSearch(e.target.value)} className={inputCls} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead><tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                            {["User", "Role", "Joined", "Last Login", ""].map(h => <Th key={h}>{h}</Th>)}
                        </tr></thead>
                        <tbody>
                            {isLoading ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={5} />) :
                                isError ? <tr><td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: '#DC2626' }}>Failed to load users.</td></tr> :
                                    users.length === 0 ? <tr><td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: '#6B7280' }}>No users found.</td></tr> :
                                        users.map(u => (
                                            <tr key={u._id} className="transition-colors" style={{ borderBottom: '1px solid #F3F4F6' }}
                                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F0FDF4'}
                                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar src={u.profilePicture} fallback={u.fullName} size="sm" />
                                                        <div>
                                                            <p className="text-sm font-semibold" style={{ color: '#1F2937' }}>{u.fullName}</p>
                                                            <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#9CA3AF' }}>
                                                                <Mail size={10} />{u.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5"><RoleBadge role={u.role} /></td>
                                                <td className="px-5 py-3.5 text-sm" style={{ color: '#6B7280' }}>{fmtDate(u.createdAt)}</td>
                                                <td className="px-5 py-3.5 text-sm" style={{ color: '#9CA3AF' }}>
                                                    {u.lastLogin ? fmtDate(u.lastLogin) : <span style={{ color: '#E5E7EB' }}>Never</span>}
                                                </td>
                                                <td className="px-5 py-3.5 text-right">
                                                    <button onClick={() => setSelectedId(u._id)}
                                                        className={btnGreen} style={{ background: '#16A34A' }}
                                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#15803D'}
                                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#16A34A'}>
                                                        <Eye size={13} /> View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                        </tbody>
                    </table>
                </div>
                <Pagination pagination={data?.pagination} onPage={setPage} />
            </div>
        </>
    );
}

// ─── Games Tab ────────────────────────────────────────────────────────────────
function GamesTab({ isReady }: { isReady: boolean }) {
    const [filter, setFilter] = useState<"all" | "online" | "offline">("all");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    React.useEffect(() => { setPage(1); }, [filter, status]);

    const queryFn = filter === "online"
        ? () => adminService.getOnlineGames({ page, limit: 15, status: status || undefined })
        : filter === "offline"
            ? () => adminService.getOfflineGames({ page, limit: 15, status: status || undefined })
            : () => adminService.getGames({ page, limit: 15, status: status || undefined });

    const { data, isLoading, isError } = useQuery({
        queryKey: ["admin-games", filter, page, status],
        queryFn,
        enabled: isReady
    });
    const games: AdminGame[] = data?.data ?? [];

    const filterBtn = (key: "all" | "online" | "offline", label: string, icon?: React.ReactNode) => (
        <button onClick={() => setFilter(key)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={filter === key
                ? { background: '#16A34A', color: '#fff', boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }
                : { color: '#6B7280', background: 'transparent' }}
            onMouseEnter={e => { if (filter !== key) (e.currentTarget as HTMLElement).style.background = '#F8F9FA'; }}
            onMouseLeave={e => { if (filter !== key) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            {icon}{label}
        </button>
    );

    return (
        <>
            {selectedId && <GameModal gameId={selectedId} onClose={() => setSelectedId(null)} />}
            <div className={`${card} overflow-hidden`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: '#F8F9FA', border: '1px solid #E5E7EB' }}>
                        {filterBtn("all", "All")}
                        {filterBtn("online", "Online", <Wifi size={13} />)}
                        {filterBtn("offline", "Offline", <WifiOff size={13} />)}
                    </div>
                    <select value={status} onChange={e => setStatus(e.target.value)}
                        className="text-sm border rounded-lg px-3 py-2 outline-none transition-all"
                        style={{ borderColor: '#E5E7EB', color: '#6B7280', background: '#fff' }}>
                        <option value="">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="FULL">Full</option>
                        <option value="ENDED">Ended</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead><tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                            {["Game", "Category", "Status", "Creator", "Players", "Created", ""].map(h => <Th key={h}>{h}</Th>)}
                        </tr></thead>
                        <tbody>
                            {isLoading ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={7} />) :
                                isError ? <tr><td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: '#DC2626' }}>Failed to load games.</td></tr> :
                                    games.length === 0 ? <tr><td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: '#6B7280' }}>No games found.</td></tr> :
                                        games.map(g => (
                                            <tr key={g._id} className="transition-colors" style={{ borderBottom: '1px solid #F3F4F6' }}
                                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F0FDF4'}
                                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                                                <td className="px-5 py-3.5">
                                                    <p className="text-sm font-semibold max-w-[160px] truncate" style={{ color: '#1F2937' }}>{g.title}</p>
                                                </td>
                                                <td className="px-5 py-3.5"><CategoryBadge category={g.category} /></td>
                                                <td className="px-5 py-3.5"><StatusBadge status={g.status} /></td>
                                                <td className="px-5 py-3.5">
                                                    {g.creator
                                                        ? <div className="flex items-center gap-2">
                                                            <Avatar src={g.creator.profilePicture} fallback={g.creator.fullName} size="sm" />
                                                            <span className="text-sm max-w-[110px] truncate" style={{ color: '#1F2937' }}>{g.creator.fullName}</span>
                                                        </div>
                                                        : <span style={{ color: '#D1D5DB' }}>—</span>}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold" style={{ color: '#1F2937' }}>{g.currentPlayers}</span>
                                                        <span className="text-xs" style={{ color: '#9CA3AF' }}>/ {g.maxPlayers}</span>
                                                        <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                                                            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((g.currentPlayers / g.maxPlayers) * 100, 100)}%`, background: '#16A34A' }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-sm" style={{ color: '#6B7280' }}>{fmtDate(g.createdAt)}</td>
                                                <td className="px-5 py-3.5 text-right">
                                                    <button onClick={() => setSelectedId(g._id)}
                                                        className={btnGreen} style={{ background: '#16A34A' }}
                                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#15803D'}
                                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#16A34A'}>
                                                        <Eye size={13} /> View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                        </tbody>
                    </table>
                </div>
                <Pagination pagination={data?.pagination} onPage={setPage} />
            </div>
        </>
    );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function Overview({ stats }: { stats: any }) {
    if (!stats) return null;
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${card} p-6`}>
                <h3 className="text-sm font-bold mb-5 flex items-center gap-2" style={{ color: '#1F2937' }}>
                    <BarChart3 size={15} style={{ color: '#16A34A' }} /> Platform Breakdown
                </h3>
                <div className="space-y-5">
                    {[
                        { label: "Active games", value: stats.activeGames, total: stats.totalGames },
                        { label: "Online games", value: stats.totalOnlineGames, total: stats.totalGames },
                        { label: "Offline games", value: stats.totalOfflineGames, total: stats.totalGames },
                    ].map(item => (
                        <div key={item.label}>
                            <div className="flex justify-between mb-1.5">
                                <span className="text-sm" style={{ color: '#6B7280' }}>{item.label}</span>
                                <span className="text-sm font-bold" style={{ color: '#1F2937' }}>
                                    {item.value} <span style={{ color: '#D1D5DB', fontWeight: 400 }}>/ {item.total}</span>
                                </span>
                            </div>
                            <div className="h-2 rounded-full" style={{ background: '#F3F4F6' }}>
                                <div className="h-2 rounded-full transition-all" style={{
                                    width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%`,
                                    background: 'linear-gradient(90deg,#16A34A,#22C55E)',
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className={`${card} p-6`}>
                <h3 className="text-sm font-bold mb-5 flex items-center gap-2" style={{ color: '#1F2937' }}>
                    <TrendingUp size={15} style={{ color: '#16A34A' }} /> Quick Metrics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: "Avg players/game", value: stats.totalGames > 0 ? (stats.totalParticipantsAcrossAllGames / stats.totalGames).toFixed(1) : "0" },
                        { label: "Active game rate", value: stats.totalGames > 0 ? `${((stats.activeGames / stats.totalGames) * 100).toFixed(0)}%` : "0%" },
                        { label: "Online ratio", value: stats.totalGames > 0 ? `${((stats.totalOnlineGames / stats.totalGames) * 100).toFixed(0)}%` : "0%" },
                        { label: "Total participants", value: stats.totalParticipantsAcrossAllGames.toLocaleString() },
                    ].map(m => (
                        <div key={m.label} className="p-4 rounded-xl" style={{ background: '#F8F9FA', border: '1px solid #E5E7EB' }}>
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>{m.label}</p>
                            <p className="text-2xl font-extrabold" style={{ color: '#1F2937' }}>{m.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const [tab, setTab] = useState<"overview" | "users" | "games">("overview");

    // Wait for Zustand persist to rehydrate before firing any API calls
    const { isHydrated, isAuthenticated, user } = useAuthStore();
    const isReady = isHydrated && isAuthenticated && (user as any)?.role === 'admin';

    const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: adminService.getStats,
        enabled: isReady,   // ← waits for hydration + auth + admin role
        staleTime: 30_000,
        retry: false,
    });

    const STAT_CARDS = stats ? [
        { icon: Users, label: "Total Users", value: stats.totalUsers, accent: "#16A34A" },
        { icon: Gamepad2, label: "Total Games", value: stats.totalGames, accent: "#2563EB" },
        { icon: Wifi, label: "Online Games", value: stats.totalOnlineGames, accent: "#0891B2" },
        { icon: WifiOff, label: "Offline Games", value: stats.totalOfflineGames, accent: "#7C3AED" },
        { icon: Activity, label: "Active Now", value: stats.activeGames, accent: "#D97706" },
        { icon: TrendingUp, label: "Total Players", value: stats.totalParticipantsAcrossAllGames, accent: "#DB2777" },
    ] : [];

    const tabStyle = (t: string) => ({
        className: "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
        style: tab === t
            ? { background: '#16A34A', color: '#fff', boxShadow: '0 2px 8px rgba(22,163,74,0.25)' }
            : { color: '#6B7280', background: 'transparent' },
    });

    return (
        <div className="space-y-7 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Shield size={16} style={{ color: '#16A34A' }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#16A34A' }}>Admin Control Center</span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#1F2937' }}>Platform Dashboard</h1>
                    <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>Manage users, games, and platform statistics</p>
                </div>

                {/* Tab switcher */}
                <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#F8F9FA', border: '1px solid #E5E7EB' }}>
                    {[
                        { key: "overview", label: "Overview", icon: <BarChart3 size={14} /> },
                        { key: "users", label: "Users", icon: <Users size={14} /> },
                        { key: "games", label: "Games", icon: <Gamepad2 size={14} /> },
                    ].map(t => (
                        <button key={t.key} {...tabStyle(t.key as any)} onClick={() => setTab(t.key as any)}>
                            {t.icon}{t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Gate UI until hydrated and ready */}
            {!isReady ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    {!isHydrated || !isAuthenticated ? (
                        <>
                            <div className="w-10 h-10 rounded-full border-4 border-[#E5E7EB] border-t-[#16A34A] animate-spin" />
                            <p className="text-sm font-semibold" style={{ color: '#6B7280' }}>Verifying access…</p>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#FEF2F2' }}>
                                <Lock size={24} style={{ color: '#DC2626' }} />
                            </div>
                            <p className="text-sm font-bold" style={{ color: '#DC2626' }}>Admin access required</p>
                        </>
                    )}
                </div>
            ) : (
                <>
                    {/* Stats Cards — always visible */}
                    {statsError ? (
                        <div className="flex items-center gap-3 p-4 rounded-xl text-sm font-medium" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                            <AlertCircle size={17} /> Failed to load statistics.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                            {statsLoading
                                ? Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl p-5 animate-pulse" style={{ border: '1px solid #E5E7EB' }}>
                                        <div className="w-11 h-11 rounded-xl mb-4" style={{ background: '#F3F4F6' }} />
                                        <div className="h-3 w-3/4 rounded mb-2" style={{ background: '#F3F4F6' }} />
                                        <div className="h-7 w-1/2 rounded" style={{ background: '#F3F4F6' }} />
                                    </div>
                                ))
                                : STAT_CARDS.map(s => <StatCard key={s.label} {...s} />)
                            }
                        </div>
                    )}

                    {/* Tab content */}
                    {tab === "overview" && <Overview stats={stats} />}
                    {tab === "users" && <UsersTab isReady={isReady} />}
                    {tab === "games" && <GamesTab isReady={isReady} />}
                </>
            )}
        </div>
    );
}
