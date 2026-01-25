import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../api/auth-service';
import { configureAuth } from '@/lib/api-client';
import { User, Profile, LoginCredentials, RegisterCredentials } from '@/types';

interface AuthState {
    user: User | null;
    profile: Profile | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    setAccessToken: (token: string) => void;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    register: (credentials: RegisterCredentials) => Promise<boolean>;
    logout: () => Promise<void>;
    fetchProfile: () => Promise<void>;
    updateProfile: (data: Profile) => Promise<boolean>;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            profile: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            setAccessToken: (token) => set({ accessToken: token }),

            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const { user, accessToken } = await authService.login(credentials);
                    set({
                        user,
                        accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    return true;
                } catch (error: any) {
                    const msg = error.response?.data?.message || 'Login failed';
                    set({ error: msg, isLoading: false });
                    return false;
                }
            },

            register: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    await authService.register(credentials);
                    set({ isLoading: false, error: null });
                    return true;
                } catch (error: any) {
                    const msg = error.response?.data?.message || 'Registration failed';
                    set({ error: msg, isLoading: false });
                    return false;
                }
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await authService.logout();
                } catch (error) {
                    // Ignore logout errors
                } finally {
                    get().clearAuth();
                }
            },

            fetchProfile: async () => {
                set({ isLoading: true });
                try {
                    const profile = await authService.getProfile();
                    set({ profile, isLoading: false });
                } catch (error: any) {
                    console.error(error);
                    set({ isLoading: false });
                }
            },

            updateProfile: async (data) => {
                set({ isLoading: true });
                try {
                    const profile = await authService.updateProfile(data);
                    set({ profile, isLoading: false });
                    return true;
                } catch (error) {
                    set({ isLoading: false });
                    return false;
                }
            },

            clearAuth: () =>
                set({
                    user: null,
                    profile: null,
                    accessToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                // profile: state.profile // Optional: persist profile if needed
            }),
        }
    )
);

// Configure API Client with Store access
configureAuth(
    () => useAuthStore.getState().accessToken,
    () => useAuthStore.getState().logout(),
    (token) => useAuthStore.getState().setAccessToken(token)
);
