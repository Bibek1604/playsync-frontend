
import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService, ChatMessage } from '@/features/chat/api/chat-service';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/features/auth/store/auth-store';

export const useGameChat = (gameId: string) => {
    const { accessToken, user } = useAuthStore();
    const [socketMessages, setSocketMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const queryClient = useQueryClient();

    // 1. Fetch History
    const { data: history, isLoading } = useQuery({
        queryKey: ['chat', gameId],
        queryFn: () => chatService.getChatHistory(gameId),
        enabled: !!gameId
    });

    // 2. Combined Messages
    const messages = useMemo(() => {
        let historyMessages: ChatMessage[] = [];
        if (Array.isArray(history)) {
            historyMessages = history;
        } else if (history && (history as any).messages) {
            historyMessages = (history as any).messages;
        }

        const normalizeMsg = (msg: any): ChatMessage => {
            const userId = msg.senderId || msg.user?._id || msg.user?.id || msg.user || '';
            return {
                _id: msg._id || msg.id,
                senderId: userId.toString(),
                senderName: msg.senderName || msg.user?.fullName || 'Anonymous',
                senderAvatar: msg.senderAvatar || msg.user?.profilePicture,
                text: msg.text || msg.content || '',
                type: msg.type || 'text',
                createdAt: msg.createdAt,
            };
        };

        // Deduplicate
        const combined = [...historyMessages, ...socketMessages];
        const unique = new Map<string, ChatMessage>();

        combined.forEach(msg => {
            const normalized = normalizeMsg(msg);
            unique.set(normalized._id, normalized);
        });

        return Array.from(unique.values()).sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
    }, [history, socketMessages]);

    // 3. Socket Listeners & Room Management
    useEffect(() => {
        if (!accessToken || !gameId) return;
        const socket = getSocket(accessToken);

        // Join the game room to receive broadcasts
        const joinRoom = () => {
            console.log(`🎮 Joining game room: ${gameId}`);
            socket.emit('join:game', gameId);
        };

        if (socket.connected) {
            joinRoom();
        }

        socket.on('connect', joinRoom);

        const handleMessage = (msg: any) => {
            setSocketMessages(prev => [...prev, msg]);
        };

        socket.on('chat:message', handleMessage);

        return () => {
            console.log(`🚪 Leaving game room: ${gameId}`);
            socket.emit('leave:game', gameId);
            socket.off('chat:message', handleMessage);
            socket.off('connect', joinRoom);
        };
    }, [accessToken, gameId]);

    // 4. Send
    const sendMessage = (content: string) => {
        if (!content.trim() || !accessToken) return;
        const socket = getSocket(accessToken);

        // Use acknowledgment callback for better reliability
        socket.emit('chat:send', { gameId, content }, (ack: any) => {
            if (ack && !ack.success) {
                console.error('❌ Failed to send message:', ack.error);
            }
        });

        setInput('');
    };

    return {
        messages,
        input,
        setInput,
        sendMessage,
        isLoading
    };
};
