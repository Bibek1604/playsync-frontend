// store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axiosApi from '../api/axios'
import { ENDPOINTS } from '../api/endpoints'

interface User {
  id: string;
  email: string;
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
  registerUser: (data: { email: string; password: string; name?: string }) => Promise<void>
  registerAdmin: (data: { email: string; password: string; name?: string }) => Promise<void>
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
        set({ isLoading: true, error: undefined })
        try {
          const res = await axiosApi.post(ENDPOINTS.LoginUser, { email, password })
          const { user, accessToken } = res.data // assume this shape

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (err: any) {
          set({
            isLoading: false,
            error: err.response?.data?.message || 'Login failed'
          })
          throw err
        }
      },

      registerUser: async (data) => {
        set({ isLoading: true, error: undefined })
        try {
          const res = await axiosApi.post(ENDPOINTS.RegisterUser, data)
          const { user, accessToken } = res.data

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (err: any) {
          set({
            isLoading: false,
            error: err.response?.data?.message || 'User registration failed'
          })
          throw err
        }
      },

      registerAdmin: async (data) => {
        set({ isLoading: true, error: undefined })
        try {
          const res = await axiosApi.post(ENDPOINTS.RegisterAdmin, data)
          const { user, accessToken } = res.data

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