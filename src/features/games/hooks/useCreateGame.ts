
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService } from '../api/game-service';
import { Game } from '@/types';


export const useCreateGame = () => {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);

    const createGame = async (formData: FormData) => {
        setIsLoading(true);
        try {
            const game = await gameService.create(formData);
            alert('Game created successfully!');
            queryClient.invalidateQueries({ queryKey: ['games'] });
            return game;
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create game');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { createGame, isLoading };
};
