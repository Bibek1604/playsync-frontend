// api/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosApi from './axios';
import { ENDPOINTS } from './endpoints';

// Example query hook for fetching user profile
export const useUserProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await axiosApi.get(`/user/${userId}`);
      return response.data;
    },
    enabled: !!userId, // Only run if userId is provided
  });
};

// Example query hook for fetching games
export const useGames = () => {
  return useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const response = await axiosApi.get('/games');
      return response.data;
    },
  });
};

// Mutation for login (though you might keep this in store)
export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await axiosApi.post(ENDPOINTS.LoginUser, { email, password });
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // You can also update auth store here if needed
    },
  });
};