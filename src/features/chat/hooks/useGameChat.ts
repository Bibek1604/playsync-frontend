
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

        // Deduplicate
        const combined = [...historyMessages, ...socketMessages];
        const unique = new Map();
        combined.forEach(msg => unique.set(msg._id || msg.id, msg)); // adjust for ID differences if any
        return Array.from(unique.values()).sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
    }, [history, socketMessages]);

    // 3. Socket Listeners
    useEffect(() => {
        if (!accessToken || !gameId) return;
        const socket = getSocket(accessToken);

        const handleMessage = (msg: any) => {
            // Ensure message shape
            setSocketMessages(prev => [...prev, msg]);
        };

        socket.on('chat:message', handleMessage); // Both user and system messages come here

        return () => {
            socket.off('chat:message', handleMessage);
        };
    }, [accessToken, gameId]);

    // 4. Send
    const sendMessage = (content: string) => {
        if (!content.trim() || !accessToken) return;
        const socket = getSocket(accessToken);
        socket.emit('chat:send', { gameId, content });
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
