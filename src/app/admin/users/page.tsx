"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Eye, Mail, Shield, ChevronLeft, ChevronRight, Calendar, Clock, Gamepad2, UserCheck, X } from "lucide-react";
import { adminService, AdminUser } from "@/features/admin/api/admin-service";
import { Avatar } from "@/components/ui";

// ─── Shared Components & Styles ───────────────────────────────────────────────
const card = "bg-white rounded-xl border border-[#E5E7EB]";
const inputCls = "w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg outline-none transition-all focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 text-[#1F2937] placeholder:text-[#9CA3AF]";
const btnGreen = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:shadow-md active:scale-95";

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";
const fmtTime = (d?: string) => d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

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

// ─── Modal ────────────────────────────────────────────────────────────────────
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
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
    });
    const users: AdminUser[] = data?.data ?? [];

    return (
        <div className="max-w-7xl mx-auto">
            {selectedId && <UserModal userId={selectedId} onClose={() => setSelectedId(null)} />}

            <div className="mb-6">
                <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#1F2937' }}>Manage Users</h1>
                <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>View and manage platform users</p>
            </div>

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
        </div>
    );
}
