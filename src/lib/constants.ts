export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/v1/auth/login',
        REGISTER: '/api/v1/auth/register/user',
        REFRESH: '/api/v1/auth/refresh-token',
        LOGOUT: '/api/v1/auth/logout',
        ME: '/api/v1/auth/me',
        USERS: '/api/v1/auth/users',
    },
    PROFILE: {
        GET: '/api/v1/profile',
        UPDATE: '/api/v1/profile',
        CHANGE_PASSWORD: '/api/v1/profile/change-password',
    },
    GAMES: {
        LIST: '/api/v1/games',
    },
};
