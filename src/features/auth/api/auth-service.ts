import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';
import { AuthResponse, User, Profile, LoginCredentials, RegisterCredentials } from '@/types';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const authService = {
    login: async (data: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>(ENDPOINTS.AUTH.LOGIN, data);
        return response.data.data;
    },

    register: async (data: RegisterCredentials): Promise<void> => {
        await apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
    },

    logout: async (): Promise<void> => {
        await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    },

    getProfile: async (): Promise<Profile> => {
        const response = await apiClient.get<ApiResponse<Profile>>(ENDPOINTS.PROFILE.GET);
        return response.data.data;
    },

    updateProfile: async (data: Partial<Profile> | FormData): Promise<Profile> => {
        const response = await apiClient.patch<ApiResponse<Profile>>(ENDPOINTS.PROFILE.UPDATE, data);
        return response.data.data;
    },

    changePassword: async (data: { currentPassword: string; newPassword: string; confirmNewPassword: string }): Promise<void> => {
        await apiClient.patch(ENDPOINTS.PROFILE.CHANGE_PASSWORD, data);
    },

    getAllUsers: async (): Promise<User[]> => {
        const response = await apiClient.get<ApiResponse<User[]>>(ENDPOINTS.AUTH.USERS);
        return response.data.data;
    }
};
