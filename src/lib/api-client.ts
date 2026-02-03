import axios from 'axios';
import { API_URL, ENDPOINTS } from './constants';

const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 15000,
});

// Dependency definitions
let getAccessToken: () => string | null = () => null;
let getRefreshToken: () => string | null = () => null;
let performLogout: () => void = () => { };
let storeSetAccessToken: (token: string) => void = () => { };
let storeSetRefreshToken: (token: string) => void = () => { };

export const configureAuth = (
    getToken: () => string | null,
    getRefToken: () => string | null,
    logout: () => void,
    setToken: (token: string) => void,
    setRefToken: (token: string) => void
) => {
    getAccessToken = getToken;
    getRefreshToken = getRefToken;
    performLogout = logout;
    storeSetAccessToken = setToken;
    storeSetRefreshToken = setRefToken;
};

// Queue configuration
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: Error | null = null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = 'Bearer ' + token;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getRefreshToken();

            if (!refreshToken) {
                isRefreshing = false;
                performLogout();
                return Promise.reject(error);
            }

            try {
                // Manual refresh call to avoid interceptors
                const response = await axios.post(
                    `${API_URL}${ENDPOINTS.AUTH.REFRESH}`,
                    { refreshToken },
                    { withCredentials: true }
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                // Update store via injected functions
                storeSetAccessToken(accessToken);
                if (newRefreshToken) {
                    storeSetRefreshToken(newRefreshToken);
                }

                apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
                processQueue(null, accessToken);

                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as Error, null);
                performLogout(); // Use injected logout
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
