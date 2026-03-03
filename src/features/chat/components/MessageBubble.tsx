import React from 'react';
import { Crown } from 'lucide-react';
import { getImageUrl } from '@/lib/constants';

interface ChatMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    senderName?: string;
    senderAvatar?: string;
}

interface MessageBubbleProps {
    message: ChatMessage;
    isOwn: boolean;
    isGrouped: boolean;
    isHost?: boolean;
}

/* ── deterministic avatar color ── */
const AVATAR_COLORS = [
    'from-green-500 to-green-700',
    'from-teal-500 to-teal-700',
    'from-emerald-500 to-emerald-700',
    'from-cyan-600 to-cyan-800',
    'from-lime-500 to-lime-700',
    'from-sky-500 to-sky-700',
    'from-violet-500 to-violet-700',
    'from-rose-500 to-rose-700',
    'from-orange-500 to-orange-700',
    'from-indigo-500 to-indigo-700',
];

function getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ── detect if text is purely emoji ── */
const EMOJI_REGEX = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}|\u200d)+$/u;
function isPureEmoji(text: string | undefined | null): boolean {
    if (!text) return false;
    const trimmed = text.trim();
    if (!trimmed) return false;
    return EMOJI_REGEX.test(trimmed) && trimmed.length <= 12;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isOwn,
    isGrouped,
    isHost,
}) => {
    const [imgError, setImgError] = React.useState(false);

    const time = new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    const senderName = message.senderName || '?';
    const avatarColor = getAvatarColor(senderName);
    const initials = senderName.charAt(0).toUpperCase();
    const emojiOnly = isPureEmoji(message.text);
    const showImage = message.senderAvatar && !imgError;

    return (
        <div className={`flex w-full msg-anim ${isGrouped ? 'mt-0.5' : 'mt-5'} ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] sm:max-w-[66%] gap-2.5 items-end ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>

                {/* ── Avatar (others only) ── */}
                {!isOwn && (
                    <div className="w-8 h-8 flex-shrink-0 self-end mb-0.5">
                        {!isGrouped ? (
                            showImage ? (
                                <img
                                    src={getImageUrl(message.senderAvatar)}
                                    alt={senderName}
                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-white shadow-sm`}>
                                    {initials}
                                </div>
                            )
                        ) : (
                            <div className="w-8 h-8" /> /* spacer to align grouped bubbles */
                        )}
                    </div>
                )}

                {/* ── Message content ── */}
                <div className={`flex flex-col min-w-0 ${isOwn ? 'items-end' : 'items-start'}`}>

                    {/* Sender name (first msg in group) */}
                    {!isGrouped && !isOwn && (
                        <div className="flex items-center gap-1.5 mb-1 pl-1">
                            <span className="text-[12px] font-bold text-gray-700 leading-none">
                                {senderName}
                            </span>
                            {isHost && (
                                <span className="inline-flex items-center gap-0.5 bg-amber-50 border border-amber-200 text-amber-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                    <Crown size={8} className="fill-amber-400" />
                                    Host
                                </span>
                            )}
                        </div>
                    )}

                    {/* Bubble */}
                    {emojiOnly ? (
                        /* ── emoji-only: large, no bubble box ── */
                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                            <span className="text-4xl leading-none select-none" role="img" aria-label="emoji">
                                {message.text}
                            </span>
                            <span className={`text-[10px] font-semibold mt-1 ${isOwn ? 'text-gray-400' : 'text-gray-400'}`}>
                                {time}
                            </span>
                        </div>
                    ) : (
                        <div className={`
                            relative px-4 py-2.5 break-words whitespace-pre-wrap shadow-sm max-w-full
                            ${isOwn
                                ? 'bg-green-600 text-white rounded-2xl rounded-br-sm'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-sm'
                            }
                            ${isGrouped
                                ? isOwn ? 'rounded-tr-2xl' : 'rounded-tl-2xl'
                                : ''
                            }
                        `}>
                            <p className="text-[14px] leading-relaxed">{message.text}</p>
                            <div className={`text-[10px] font-semibold mt-1.5 text-right leading-none
                                ${isOwn ? 'text-green-200' : 'text-gray-400'}`}
                            >
                                {time}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
