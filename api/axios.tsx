// lib/axios.ts
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const axiosApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true, // ← very important for httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = []

const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(null)
  })
  failedQueue = []
}

// Request interceptor - add access token from store/memory
axiosApi.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle 401 + token refresh
axiosApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => axiosApi(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Try to refresh token
        await axiosApi.post('/refresh-token') // backend should set new refresh cookie + return new access

        // After successful refresh → retry original request
        processQueue(null)
        return axiosApi(originalRequest)
      } catch (refreshError) {
        // Refresh failed → full logout
        processQueue(refreshError)
        // Trigger logout in store (we'll connect it later)
        useAuthStore.getState().logout(true) // true = from interceptor
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosApi