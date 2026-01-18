// store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axiosApi from '../api/axios'
import { ENDPOINTS } from '../api/endpoints'
import { setUser } from '../utils/sentry'
import * as Sentry from '@sentry/nextjs'

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  // Add other user properties as needed, e.g., name, avatar, etc.
}

interface AuthState {
  user: User | null
  accessToken: string | null    // ← kept in memory only
  isAuthenticated: boolean
  isLoading: boolean
  error?: string

  login: (email: string, password: string) => Promise<void>
  registerUser: (data: { email: string; password: string; fullName: string }) => Promise<void>
  registerAdmin: (data: { email: string; password: string; fullName: string; adminCode: string }) => Promise<void>
  logout: (fromInterceptor?: boolean) => Promise<void>
  refreshToken: () => Promise<boolean>
  setAccessToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: undefined,

      // ── Very important: we keep accessToken in memory only! ──
      setAccessToken: (token: string) => set({ accessToken: token }),

      login: async (email, password) => {
        console.log('AuthStore: Starting login with email:', email);
        set({ isLoading: true, error: undefined })
        try {
          console.log('AuthStore: Making API call to:', ENDPOINTS.LoginUser);

          // For testing purposes, simulate API response when backend is not available
          if (process.env.NODE_ENV === 'development') {
            console.log('AuthStore: Development mode - simulating successful login');

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock successful response
            const mockUser = {
              id: 'mock-user-id-' + Date.now(),
              email: email,
              fullName: 'Mock User',
              role: 'user'
            };
            const mockAccessToken = 'mock-access-token-' + Date.now();

            console.log('AuthStore: Using mock response data:', { mockUser, hasAccessToken: !!mockAccessToken });

            set({
              user: mockUser,
              accessToken: mockAccessToken,
              isAuthenticated: true,
              isLoading: false,
            });

            // Set user in Sentry for error tracking
            setUser({
              id: mockUser.id,
              email: mockUser.email,
              username: mockUser.fullName,
            });

            console.log('AuthStore: Mock login completed successfully');
            return;
          }

          const res = await axiosApi.post(ENDPOINTS.LoginUser, { email, password })

          // Handle both nested and direct response structures
          const responseData = res.data.data || res.data
          const { user, accessToken } = responseData

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          })

          // Set user in Sentry for error tracking
          setUser({
            id: user.id,
            email: user.email,
            username: user.fullName,
          })
        } catch (err: any) {
          console.error('AuthStore: Login failed with error:', err);
          console.error('AuthStore: Error response:', err.response?.data);

          // In development, if it's a network error, provide helpful message
          if (process.env.NODE_ENV === 'development' && !err.response) {
            set({
              isLoading: false,
              error: 'Backend server not running. Please start the backend server on http://localhost:5000'
            })
          } else {
            set({
              isLoading: false,
              error: err.response?.data?.message || 'Login failed'
            })
          }
          throw err
        }
      },

      registerUser: async (data) => {
        console.log('AuthStore: Starting user registration with data:', data);
        set({ isLoading: true, error: undefined })
        try {
          console.log('AuthStore: Making API call to:', ENDPOINTS.RegisterUser);

          // For testing purposes, simulate API response when backend is not available
          if (process.env.NODE_ENV === 'development') {
            console.log('AuthStore: Development mode - simulating successful registration');

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock successful response
            const mockUser = {
              id: 'mock-user-id-' + Date.now(),
              email: data.email,
              fullName: data.fullName,
              role: 'user'
            };
            const mockAccessToken = 'mock-access-token-' + Date.now();

            console.log('AuthStore: Using mock response data:', { mockUser, hasAccessToken: !!mockAccessToken });

            set({
              user: mockUser,
              accessToken: mockAccessToken,
              isAuthenticated: true,
              isLoading: false,
            });

            console.log('AuthStore: Mock registration completed successfully');
            return;
          }

          const res = await axiosApi.post(ENDPOINTS.RegisterUser, data)
          console.log('AuthStore: API response received:', res);

          // Handle both nested and direct response structures
          const responseData = res.data.data || res.data
          console.log('AuthStore: Processed response data:', responseData);
          const { user, accessToken } = responseData

          console.log('AuthStore: Setting user data:', { user, hasAccessToken: !!accessToken });
          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          })

          console.log('AuthStore: Registration completed successfully');
        } catch (err: any) {
          console.error('AuthStore: Registration failed with error:', err);
          console.error('AuthStore: Error response:', err.response?.data);

          // In development, if it's a network error, provide helpful message
          if (process.env.NODE_ENV === 'development' && !err.response) {
            set({
              isLoading: false,
              error: 'Backend server not running. Please start the backend server on http://localhost:5000'
            })
          } else {
            set({
              isLoading: false,
              error: err.response?.data?.message || 'User registration failed'
            })
          }
          throw err
        }
      },

      registerAdmin: async (data) => {
        set({ isLoading: true, error: undefined })
        try {
          const res = await axiosApi.post(ENDPOINTS.RegisterAdmin, data)

          // Handle both nested and direct response structures
          const responseData = res.data.data || res.data
          const { user, accessToken } = responseData

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (err: any) {
          set({
            isLoading: false,
            error: err.response?.data?.message || 'Admin registration failed'
          })
          throw err
        }
      },

      refreshToken: async () => {
        try {
          const res = await axiosApi.post(ENDPOINTS.RefreshToken)
          const { accessToken } = res.data

          set({ accessToken })
          return true
        } catch {
          set({ accessToken: null, isAuthenticated: false, user: null })
          return false
        }
      },

      logout: async (fromInterceptor = false) => {
        // Optional: call logout endpoint if you have one
        // await axiosApi.post('/logout')

        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: undefined,
        })

        // Clear user from Sentry
        Sentry.setUser(null);

        if (!fromInterceptor) {
          // Optional: redirect or other client-side cleanup
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // NEVER persist accessToken!
      }),
    }
  )
)