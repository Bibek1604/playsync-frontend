// store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axiosApi from '../api/axios'
import { ENDPOINTS } from '../api/endpoints'
import { setUser } from '../../utils/sentry'
import * as Sentry from '@sentry/nextjs'

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null
  accessToken: string | null   
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

      setAccessToken: (token: string) => set({ accessToken: token }),

      login: async (email, password) => {
        console.log('AuthStore: Starting login with email:', email);
        set({ isLoading: true, error: undefined })
        try {
          console.log('AuthStore: Making API call to:', ENDPOINTS.LoginUser);

          const res = await axiosApi.post(ENDPOINTS.LoginUser, { email, password })

          const responseData = res.data.data || res.data
          const { user, accessToken } = responseData

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          })

          setUser({
            id: user.id,
            email: user.email,
            username: user.fullName,
          })
        } catch (err: any) {
          console.error('AuthStore: Login failed with error:', err);
          console.error('AuthStore: Error response:', err.response?.data);

          if (process.env.NODE_ENV === 'development' && !err.response) {
            console.log('AuthStore: Development mode - simulating login (backend not running)');

            // Simulate successful login with mock data
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockUser = {
              id: 'dev-user-123',
              email: email,
              fullName: 'Development User',
              role: 'user' as const,
            };
            const mockAccessToken = 'dev-mock-token-123';

            set({
              user: mockUser,
              accessToken: mockAccessToken,
              isAuthenticated: true,
              isLoading: false,
            });

            setUser({
              id: mockUser.id,
              email: mockUser.email,
              username: mockUser.fullName,
            });

            console.log('AuthStore: Mock login simulated successfully');
            return;
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

          if (process.env.NODE_ENV === 'development') {
            console.log('AuthStore: Development mode - simulating registration (no auto-login)');

            await new Promise(resolve => setTimeout(resolve, 1000));

            // Simulate registration success only; do not auto-login
            set({
              isLoading: false,
            });

            console.log('AuthStore: Mock registration simulated successfully');
            return;
          }

          const res = await axiosApi.post(ENDPOINTS.RegisterUser, data)
          console.log('AuthStore: API response received:', res);

          const responseData = res.data.data || res.data
          console.log('AuthStore: Processed response data:', responseData);

          // Do NOT auto-login after registration. Backend should return tokens only on login.
          set({
            isLoading: false,
          })

          console.log('AuthStore: Registration completed successfully (user not logged in)');
        } catch (err: any) {
          console.error('AuthStore: Registration failed with error:', err);
          console.error('AuthStore: Error response:', err.response?.data);

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


        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: undefined,
        })
        Sentry.setUser(null);

        if (!fromInterceptor) {
        }
      },
    }),
    {
      name: 'auth-storage',
      // Persist auth state including accessToken to localStorage (per user request)
      // NOTE: persisting tokens in localStorage is less secure (XSS risk).
      // Use only for temporary/dev purposes.
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
      }),
    }
  )
)