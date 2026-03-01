'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Smile, X } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme, EmojiStyle } from 'emoji-picker-react';

interface MessageInputProps {
    onSendMessage: (text: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
    onSendMessage,
    placeholder = 'Type a message...',
    disabled = false,
}) => {
    const [text, setText] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);
    const emojiButtonRef = useRef<HTMLButtonElement>(null);

    /* ── auto-resize textarea ── */
    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
    }, [text]);

    /* ── close picker on outside click ── */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(e.target as Node) &&
                emojiButtonRef.current &&
                !emojiButtonRef.current.contains(e.target as Node)
            ) {
                setShowEmoji(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ── insert emoji at caret ── */
    const onEmojiClick = useCallback((emojiData: EmojiClickData) => {
        const ta = textareaRef.current;
        const emoji = emojiData.emoji;

        if (ta) {
            const start = ta.selectionStart ?? text.length;
            const end = ta.selectionEnd ?? text.length;
            const newText = text.slice(0, start) + emoji + text.slice(end);
            setText(newText);

            // restore caret after emoji
            requestAnimationFrame(() => {
                ta.focus();
                const pos = start + emoji.length;
                ta.setSelectionRange(pos, pos);
            });
        } else {
            setText((prev) => prev + emoji);
        }
        // keep picker open so user can pick multiple
    }, [text]);

    /* ── send ── */
    const handleSend = useCallback(() => {
        const trimmed = text.trim();
        if (trimmed && !disabled) {
            onSendMessage(trimmed);
            setText('');
            setShowEmoji(false);
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
            textareaRef.current?.focus();
        }
    }, [text, disabled, onSendMessage]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const hasText = text.trim().length > 0;

    return (
        <div className="relative bg-white border-t border-gray-100 shrink-0">

            {/* ── Emoji Picker Popup ── */}
            {showEmoji && (
                <div
                    ref={pickerRef}
                    className="absolute bottom-full left-0 z-50 pb-2 px-3"
                    style={{ filter: 'drop-shadow(0 -4px 24px rgba(0,0,0,0.08))' }}
                >
                    <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        theme={Theme.LIGHT}
                        emojiStyle={EmojiStyle.NATIVE}
                        width={340}
                        height={380}
                        searchPlaceholder="Search emoji..."
                        skinTonesDisabled
                        previewConfig={{ showPreview: false }}
                        lazyLoadEmojis
                        style={{
                            borderRadius: '16px',
                            border: '1px solid #F3F4F6',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.10)',
                            fontFamily: 'inherit',
                        } as React.CSSProperties}
                    />
                </div>
            )}

            {/* ── Input Row ── */}
            <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-end gap-2 px-4 py-3"
            >
                {/* Emoji toggle */}
                <button
                    ref={emojiButtonRef}
                    type="button"
                    disabled={disabled}
                    onClick={() => setShowEmoji((v) => !v)}
                    aria-label={showEmoji ? 'Close emoji picker' : 'Open emoji picker'}
                    className={`w-9 h-9 flex-shrink-0 mb-0.5 flex items-center justify-center rounded-xl transition-all disabled:opacity-40
                        ${showEmoji
                            ? 'bg-green-100 text-green-600 shadow-inner'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                >
                    {showEmoji
                        ? <X size={18} strokeWidth={2.5} />
                        : <Smile size={19} />
                    }
                </button>

                {/* Textarea */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={disabled ? 'Connect to send messages' : placeholder}
                        disabled={disabled}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 pr-12 text-[14px] text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 focus:bg-white transition-all leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ minHeight: '44px', maxHeight: '140px' }}
                    />
                </div>

                {/* Send button */}
                <button
                    type="submit"
                    disabled={!hasText || disabled}
                    aria-label="Send message"
                    className={`w-10 h-10 flex-shrink-0 mb-0.5 flex items-center justify-center rounded-full transition-all active:scale-90 shadow-sm
                        ${hasText && !disabled
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                >
                    <Send
                        size={17}
                        strokeWidth={2.5}
                        className={hasText && !disabled ? 'translate-x-px -translate-y-px' : ''}
                    />
                </button>
            </form>

            {/* Hint */}
            <p className="text-center text-[10px] text-gray-300 font-medium pb-2">
                Press <kbd className="px-1 py-px bg-gray-100 rounded text-[9px] font-bold text-gray-400">Enter</kbd> to send &nbsp;·&nbsp;
                <kbd className="px-1 py-px bg-gray-100 rounded text-[9px] font-bold text-gray-400">Shift+Enter</kbd> for new line
            </p>
        </div>
    );
};
