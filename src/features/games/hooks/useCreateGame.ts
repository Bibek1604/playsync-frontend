
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService } from '../api/game-service';
import { Game } from '@/types';
import { toast } from '@/lib/toast';


export const useCreateGame = () => {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);

    const createGame = async (formData: FormData) => {
        setIsLoading(true);
        try {
            const game = await gameService.create(formData);
            toast.success('Game created successfully!');
            queryClient.invalidateQueries({ queryKey: ['games'] });
            return game;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create game');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { createGame, isLoading };
};
