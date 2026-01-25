export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register/user',
        REFRESH: '/auth/refresh-token',
        LOGOUT: '/auth/logout',
        ME: '/auth/me', // Assuming there is one, or we use user profile
    },
    USER: {
        PROFILE: '/profile',
    },
    GAMES: {
        LIST: '/games',
    },
};
