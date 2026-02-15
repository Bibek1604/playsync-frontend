
import { create } from 'zustand';
import { Game } from '@/types';

interface GameState {
    viewMode: 'LOBBY' | 'IN_GAME';
    activeGame: Game | null;

    // Actions
    enterGame: (game: Game) => void;
    leaveGame: () => void;
    updateGame: (game: Partial<Game>) => void;

    // Participant Management
    addParticipant: (userData: { userId: string; username: string; profilePicture?: string }) => void;
    removeParticipant: (userId: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
    viewMode: 'LOBBY',
    activeGame: null,

    enterGame: (game) => set({ viewMode: 'IN_GAME', activeGame: game }),

    leaveGame: () => set({ viewMode: 'LOBBY', activeGame: null }),

    updateGame: (updates) => set((state) => ({
        activeGame: state.activeGame ? { ...state.activeGame, ...updates } : null
    })),

    addParticipant: (userData) => set((state) => {
        if (!state.activeGame) return state;

        // Check duplication
        const exists = state.activeGame.participants.some((p: any) =>
            (p.userId._id || p.userId) === userData.userId
        );
        if (exists) return state;

        const newParticipant = {
            userId: {
                _id: userData.userId,
                fullName: userData.username,
                profilePicture: userData.profilePicture
            },
            status: 'ACTIVE',
            joinedAt: new Date().toISOString()
        };

        return {
            activeGame: {
                ...state.activeGame,
                participants: [...state.activeGame.participants, newParticipant],
                currentPlayers: state.activeGame.currentPlayers + 1
            }
        };
    }),

    removeParticipant: (userId) => set((state) => {
        if (!state.activeGame) return state;
        return {
            activeGame: {
                ...state.activeGame,
                participants: state.activeGame.participants.filter((p: any) =>
                    (p.userId._id || p.userId) !== userId
                ),
                currentPlayers: Math.max(0, state.activeGame.currentPlayers - 1)
            }
        };
    })
}));
