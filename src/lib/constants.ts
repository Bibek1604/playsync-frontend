export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/v1/auth/login',
        REGISTER: '/api/v1/auth/register/user',
        REFRESH: '/api/v1/auth/refresh-token',
        LOGOUT: '/api/v1/auth/logout',
        ME: '/api/v1/auth/me',
        USERS: '/api/v1/auth/users',
        FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
        RESET_PASSWORD: '/api/v1/auth/reset-password',
    },
    PROFILE: {
        GET: '/api/v1/profile',
        UPDATE: '/api/v1/profile',
        CHANGE_PASSWORD: '/api/v1/profile/change-password',
    },
    GAMES: {
        BASE: '/api/v1/games',
        LIST: '/api/v1/games',
        MY_CREATED: '/api/v1/games/my/created',
        MY_JOINED: '/api/v1/games/my/joined',
        BY_ID: (id: string) => `/api/v1/games/${id}`,
        JOIN: (id: string) => `/api/v1/games/${id}/join`,
        LEAVE: (id: string) => `/api/v1/games/${id}/leave`,
        CAN_JOIN: (id: string) => `/api/v1/games/${id}/can-join`,
        CANCEL: (id: string) => `/api/v1/games/${id}/cancel`,
        COMPLETE: (id: string) => `/api/v1/games/${id}/complete`,
        TAGS: '/api/v1/games/tags',
    },
    CHAT: {
        HISTORY: (gameId: string) => `/api/v1/games/${gameId}/chat`,
    },
    HISTORY: {
        LIST: '/api/v1/history',
        STATS: '/api/v1/history/stats',
        COUNT: '/api/v1/history/count',
    },
    SCORECARD: {
        GET: '/api/v1/scorecard',
        TREND: '/api/v1/scorecard/trend',
    },
    LEADERBOARD: {
        LIST: '/api/v1/leaderboard',
        STATS: '/api/v1/leaderboard/stats',
    },
    ADMIN: {
        USERS: '/api/v1/admin/users',
        USER_BY_ID: (id: string) => `/api/v1/admin/users/${id}`,
        GAMES: '/api/v1/admin/games',
        ONLINE_GAMES: '/api/v1/admin/games/online',
        OFFLINE_GAMES: '/api/v1/admin/games/offline',
        GAME_BY_ID: (id: string) => `/api/v1/admin/games/${id}`,
        STATS: '/api/v1/admin/stats',
    },
    NOTIFICATIONS: {
        LIST: '/api/v1/notifications',
        UNREAD_COUNT: '/api/v1/notifications/unread-count',
        READ_ALL: '/api/v1/notifications/read-all',
        MARK_READ: (id: string) => `/api/v1/notifications/${id}/read`,
    },
    TOURNAMENTS: {
        LIST: '/api/v1/tournaments',
        CREATE: '/api/v1/tournaments',
        MINE: '/api/v1/tournaments/my/created',
        BY_ID: (id: string) => `/api/v1/tournaments/${id}`,
        UPDATE: (id: string) => `/api/v1/tournaments/${id}`,
        DELETE: (id: string) => `/api/v1/tournaments/${id}`,
        INITIATE_PAYMENT: (id: string) => `/api/v1/payments/initiate`,
        VERIFY_PAYMENT: '/api/v1/payments/verify',
        PAYMENT_STATUS: (id: string) => `/api/v1/tournaments/${id}/payment/status`,
        CHAT_ACCESS: (id: string) => `/api/v1/tournaments/${id}/chat/access`,
        DASHBOARD_TRANSACTIONS: '/api/v1/payments/admin/transactions',
        TOURNAMENT_PAYMENTS: (id: string) => `/api/v1/tournaments/${id}/payments`,
    },
    PAYMENTS: {
        INITIATE: '/api/v1/payments/initiate',
        VERIFY: '/api/v1/payments/verify',
        ADMIN_TRANSACTIONS: '/api/v1/payments/admin/transactions',
    },
};

export const getImageUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('/uploads')) {
        return `${API_URL}${url}`;
    }
    return url;
};

