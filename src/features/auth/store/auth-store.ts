import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AxiosError } from 'axios';
import { authService } from '../api/auth-service';
import { configureAuth } from '@/lib/api-client';
import { User, Profile, LoginCredentials, RegisterCredentials } from '@/types';
import { disconnectSocket } from '@/lib/socket';

interface AuthState {
    user: User | null;
    profile: Profile | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    setAccessToken: (token: string) => void;
    setRefreshToken: (token: string) => void;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    register: (credentials: RegisterCredentials) => Promise<boolean>;
    logout: () => Promise<void>;
    fetchProfile: () => Promise<void>;
    updateProfile: (data: Partial<Profile> | FormData) => Promise<boolean>;
    clearAuth: () => void;
    isHydrated: boolean;
    setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            profile: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isHydrated: false,

            setAccessToken: (token) => set({ accessToken: token }),
            setRefreshToken: (token) => set({ refreshToken: token }),
            setHydrated: () => set({ isHydrated: true }),

            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const { user, accessToken, refreshToken } = await authService.login(credentials);
                    set({
                        user,
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    return true;
                } catch (error) {
                    const err = error as AxiosError<{ message: string }>;
                    const msg = err.response?.data?.message || 'Login failed';
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
                } catch (error) {
                    const err = error as AxiosError<{ message: string }>;
                    const msg = err.response?.data?.message || 'Registration failed';
                    set({ error: msg, isLoading: false });
                    return false;
                }
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await authService.logout();
                } catch {
                    // Ignore logout errors
                } finally {
                    disconnectSocket(); // Ensure socket is disconnected
                    get().clearAuth();
                }
            },

            fetchProfile: async () => {
                set({ isLoading: true });
                try {
                    const profile = await authService.getProfile();
                    set((state) => ({
                        profile,
                        user: state.user ? {
                            ...state.user,
                            fullName: profile.fullName,
                            email: profile.email || state.user.email,
                            avatar: profile.avatar || profile.profilePicture || state.user.avatar
                        } as unknown as typeof state.user : null,
                        isLoading: false
                    }));
                } catch (error) {
                    console.error('Fetch profile error:', error);
                    set({ isLoading: false });
                }
            },

            updateProfile: async (data) => {
                set({ isLoading: true });
                try {
                    const profile = await authService.updateProfile(data);
                    set((state) => ({
                        profile,
                        // Synchronize important fields to the user state as well so navigation/sidebar updates immediately
                        user: state.user ? {
                            ...state.user,
                            fullName: profile.fullName,
                            avatar: profile.avatar || profile.profilePicture || state.user.avatar,
                            email: profile.email || state.user.email
                        } as unknown as typeof state.user : null,
                        isLoading: false
                    }));
                    return true;
                } catch (error) {
                    console.error('Update profile error:', error);
                    set({ isLoading: false });
                    return false;
                }
            },

            clearAuth: () =>
                set({
                    user: null,
                    profile: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                profile: state.profile,
                isAuthenticated: state.isAuthenticated,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated();
            },
        }
    )
);

// Configure API Client with Store access
configureAuth(
    () => useAuthStore.getState().accessToken,
    () => useAuthStore.getState().refreshToken,
    () => useAuthStore.getState().clearAuth(), // Use clearAuth to avoid API loops on expired session
    (token) => useAuthStore.getState().setAccessToken(token),
    (token) => useAuthStore.getState().setRefreshToken(token)
);
