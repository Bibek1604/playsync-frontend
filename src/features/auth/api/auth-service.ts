import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';
import { AuthResponse, User, Profile } from '@/types';

export const authService = {
    login: async (data: any): Promise<AuthResponse> => {
        const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, data);
        return response.data;
    },

    register: async (data: any): Promise<void> => {
        await apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
    },

    logout: async (): Promise<void> => {
        await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    },

    getProfile: async (): Promise<Profile> => {
        const response = await apiClient.get(ENDPOINTS.USER.PROFILE);
        return response.data;
    },

    updateProfile: async (data: Profile): Promise<Profile> => {
        const response = await apiClient.put(ENDPOINTS.USER.PROFILE, data);
        return response.data;
    }
};
