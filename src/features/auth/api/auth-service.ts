import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';
import { AuthResponse, User, Profile } from '@/types';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const authService = {
    login: async (data: any): Promise<AuthResponse> => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>(ENDPOINTS.AUTH.LOGIN, data);
        return response.data.data;
    },

    register: async (data: any): Promise<void> => {
        await apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
    },

    logout: async (): Promise<void> => {
        await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    },

    getProfile: async (): Promise<Profile> => {
        const response = await apiClient.get<ApiResponse<Profile>>(ENDPOINTS.PROFILE.GET);
        return response.data.data;
    },

    updateProfile: async (data: Profile | FormData): Promise<Profile> => {
        const response = await apiClient.put<ApiResponse<Profile>>(ENDPOINTS.PROFILE.UPDATE, data);
        return response.data.data;
    },

    changePassword: async (data: { currentPassword: string; newPassword: string; confirmNewPassword: string }): Promise<void> => {
        await apiClient.put(ENDPOINTS.PROFILE.CHANGE_PASSWORD, data);
    },

    getAllUsers: async (): Promise<User[]> => {
        const response = await apiClient.get<ApiResponse<User[]>>(ENDPOINTS.AUTH.USERS);
        return response.data.data;
    }
};
