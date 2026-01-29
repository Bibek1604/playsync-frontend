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
}

export interface Profile {
    bio?: string;
    avatar?: string;
    location?: string;
    website?: string;
    phoneNumber?: string;
    favoriteGame?: string;
    oldPassword?: string;
    newPassword?: string;
    socialLinks?: {
        twitter: string;
        linkedin: string;
        github: string;
    };
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
