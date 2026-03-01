import React from 'react';
import { Crown, Users, X, Wifi, WifiOff } from 'lucide-react';
import { getImageUrl } from '@/lib/constants';

interface Participant {
    id: string;
    name: string;
    isOnline: boolean;
    isHost: boolean;
    avatar?: string;
}

interface ParticipantsSidebarProps {
    participants: Participant[];
    isOpen: boolean;
    onClose?: () => void;
}

// Same deterministic color as MessageBubble
const AVATAR_COLORS = [
    'from-green-500 to-green-700',
    'from-teal-500 to-teal-700',
    'from-emerald-500 to-emerald-700',
    'from-cyan-600 to-cyan-800',
    'from-lime-500 to-lime-700',
    'from-sky-500 to-sky-700',
    'from-violet-500 to-violet-700',
    'from-rose-500 to-rose-700',
];
function getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const ParticipantsSidebar: React.FC<ParticipantsSidebarProps> = ({
    participants,
    isOpen,
    onClose
}) => {
    const onlineCount = participants.filter(p => p.isOnline).length;
    const sorted = [...participants].sort((a, b) => {
        if (a.isHost) return -1;
        if (b.isHost) return 1;
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return a.name.localeCompare(b.name);
    });

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
                w-72 bg-white border-r border-gray-100
                flex flex-col h-full
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 h-[68px] border-b border-gray-100 shrink-0 bg-white">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">
                            <Users size={16} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-[13px] font-bold text-gray-900">Players</p>
                            <p className="text-[10px] text-gray-400 font-semibold">{onlineCount} online · {participants.length} total</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Online section */}
                <div className="flex-1 overflow-y-auto chat-scrollbar px-3 py-3">
                    {/* Online */}
                    {sorted.filter(p => p.isOnline).length > 0 && (
                        <div className="mb-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                Online — {sorted.filter(p => p.isOnline).length}
                            </p>
                            <div className="space-y-0.5">
                                {sorted.filter(p => p.isOnline).map(p => (
                                    <ParticipantRow key={p.id} participant={p} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Offline */}
                    {sorted.filter(p => !p.isOnline).length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
                                Offline — {sorted.filter(p => !p.isOnline).length}
                            </p>
                            <div className="space-y-0.5">
                                {sorted.filter(p => !p.isOnline).map(p => (
                                    <ParticipantRow key={p.id} participant={p} />
                                ))}
                            </div>
                        </div>
                    )}

                    {participants.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                            <Users size={28} className="text-gray-200 mb-2" />
                            <p className="text-xs text-gray-400 font-semibold">No players yet</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-100 shrink-0 bg-gray-50/50">
                    <div className="flex items-center gap-1.5 justify-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Wifi size={12} className="text-green-500" />
                        Session Active
                    </div>
                </div>
            </aside>
        </>
    );
};

// ----------------------------------------------------------------
// Individual participant row
// ----------------------------------------------------------------
const ParticipantRow: React.FC<{ participant: { id: string; name: string; isOnline: boolean; isHost: boolean; avatar?: string } }> = ({ participant }) => {
    const avatarColor = getAvatarColor(participant.name);
    const initials = participant.name.charAt(0).toUpperCase();
    const [imgError, setImgError] = React.useState(false);

    const showImage = participant.avatar && !imgError;

    return (
        <div className={`flex items-center gap-3 px-2 py-2 rounded-xl transition-all group cursor-default
            ${participant.isHost ? 'hover:bg-amber-50/60' : 'hover:bg-gray-50'}
        `}>
            {/* Avatar with online dot */}
            <div className="relative flex-shrink-0">
                {showImage ? (
                    <img
                        src={getImageUrl(participant.avatar)}
                        alt={participant.name}
                        className={`w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm ${!participant.isOnline ? 'opacity-50 grayscale' : ''}`}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-[12px] font-bold text-white ring-2 ring-white shadow-sm ${!participant.isOnline ? 'opacity-40 grayscale' : ''}`}>
                        {initials}
                    </div>
                )}
                {/* Online status dot */}
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-[2px] ring-white ${participant.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>

            {/* Name + status */}
            <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-1.5">
                    <p className={`text-[13px] font-semibold truncate transition-colors
                        ${participant.isOnline ? 'text-gray-900' : 'text-gray-400'}
                        ${participant.isHost ? 'group-hover:text-amber-700' : 'group-hover:text-green-700'}`
                    }>
                        {participant.name}
                    </p>
                    {participant.isHost && (
                        <Crown size={11} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                    )}
                </div>
                <p className="text-[10px] font-semibold text-gray-400 mt-0.5 leading-none">
                    {participant.isHost ? 'Host' : participant.isOnline ? 'Playing' : 'Away'}
                </p>
            </div>
        </div>
    );
};
