export interface User {
    id: string;
    email: string;
    fullName: string;
    avatar?: string;
    createdAt?: string;
    role?: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface Profile {
    fullName: string;
    email: string;
    phone?: string;
    favoriteGame?: string;
    place?: string;
    profilePicture?: string;
}

export interface Game {
    _id: string;
    title: string;
    description: string;
    tags: string[];
    imageUrl: string;
    maxPlayers: number;
    currentPlayers: number;
    status: 'OPEN' | 'FULL' | 'ENDED' | 'CANCELLED';
    creatorId: string | User;
    participants: Array<{
        userId: string | User;
        joinedAt: string;
        leftAt?: string;
        status: 'ACTIVE' | 'LEFT';
    }>;
    startTime: string;
    endTime: string;
    endedAt?: string;
    cancelledAt?: string;
    completedAt?: string;
    category: 'ONLINE' | 'OFFLINE';
    location?: string;
    createdAt: string;
    updatedAt: string;
}

export interface GameStats {
    day: string;
    hours: number;
    wins: number;
}

export interface GameDistribution {
    name: string;
    value: number;
    color: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    fullName: string;
    email: string;
    password: string;
    confirmPassword?: string;
}

export interface QueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    [key: string]: string | number | undefined;
}
