export interface User {
    id: string;
    email: string;
    fullName: string;
    avatar?: string;
    createdAt?: string;
    role?: string;
    points?: number;
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
    bio?: string;
    favoriteGame?: string;
    place?: string;
    avatar?: string;
    profilePicture?: string; // Deprecated: Use avatar instead
    points?: number;
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
    locationName?: string;
    location?: {
        type: 'Point';
        coordinates: number[];
    };
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
    category?: 'ONLINE' | 'OFFLINE';
    latitude?: number;
    longitude?: number;
    radius?: number;
    [key: string]: string | number | undefined;
}

export interface Tournament {
    _id: string;
    name: string;
    title?: string; // Alias for name
    description: string;
    type: 'ONLINE' | 'OFFLINE';
    location?: string;
    maxPlayers: number;
    currentPlayers: number;
    entryFee: number;
    prize: string;
    prizeDetails?: string; // Alias for prize
    startDate: string;
    startTime?: string; // Alias for startDate
    status: 'OPEN' | 'FULL' | 'CLOSED';
    creatorId: string | User;
    adminId?: string | User; // Alternative field name
    participants: (string | User)[];
    isPaid?: boolean;
    isParticipant?: boolean;
    paymentStatus?: 'NOT_PAID' | 'PENDING' | 'SUCCESS' | 'FAILED';
    createdAt: string;
    updatedAt: string;
}

export interface PaymentTransaction {
    _id: string;
    tournamentId: string | Tournament;
    payerId: string | User;
    amount: number;
    transactionId?: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    createdAt: string;
    updatedAt: string;
}
