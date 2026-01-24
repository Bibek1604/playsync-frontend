import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosApi from './axios';
import { ENDPOINTS } from './endpoints';

export const useUserProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await axiosApi.get(`${ENDPOINTS.UserProfile}/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useGames = () => {
  return useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const response = await axiosApi.get(ENDPOINTS.Games);
      return response.data;
    },
  });
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await axiosApi.post(ENDPOINTS.LoginUser, { email, password });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async ({ email, password, fullName }: { email: string; password: string; fullName: string }) => {
      const response = await axiosApi.post(ENDPOINTS.RegisterUser, { email, password, fullName });
      return response.data;
    },
  });
};