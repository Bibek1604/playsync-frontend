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
    id: string;
    name: string;
    image: string;
    players: number;
    maxPlayers: number;
    status: 'waiting' | 'playing' | 'finished';
    difficulty?: string;
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
