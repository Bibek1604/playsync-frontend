/**
 * Tournament Feature - API Service
 */
import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';

export interface Tournament {
  _id: string;
  name: string;
  description: string;
  type: 'online' | 'offline';
  location?: string;
  maxPlayers: number;
  currentPlayers: number;
  entryFee: number;
  prize: string;
  startDate: string;
  endDate?: string;
  status: 'open' | 'full' | 'ongoing' | 'completed' | 'cancelled';
  creatorId: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  participants: Array<{
    userId: string;
    joinedAt: string;
    paymentId: string;
  }>;
  createdAt: string;
}

export interface TournamentPayment {
  _id: string;
  tournamentId: { _id: string; name: string; entryFee: number };
  payerId: { _id: string; fullName: string; email: string; avatar?: string };
  amount: number;
  transactionId: string;
  refId?: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  paidAt?: string;
  createdAt: string;
}

export interface CreateTournamentInput {
  name: string;
  description: string;
  type: 'online' | 'offline';
  location?: string;
  maxPlayers: number;
  entryFee: number;
  prize: string;
  startDate: string;
  endDate?: string;
}

// ── Tournament CRUD ─────────────────────────────────────────────────────

export const tournamentApi = {
  list: async (params?: { page?: number; limit?: number; status?: string; type?: string }) => {
    const res = await apiClient.get(ENDPOINTS.TOURNAMENTS.LIST, { params });
    return res.data;
  },

  getById: async (id: string): Promise<Tournament> => {
    const res = await apiClient.get(ENDPOINTS.TOURNAMENTS.BY_ID(id));
    return res.data.data;
  },

  create: async (data: CreateTournamentInput): Promise<Tournament> => {
    const res = await apiClient.post(ENDPOINTS.TOURNAMENTS.CREATE, data);
    return res.data.data;
  },

  myTournaments: async (): Promise<Tournament[]> => {
    const res = await apiClient.get(ENDPOINTS.TOURNAMENTS.MINE);
    return res.data.data;
  },

  update: async (id: string, data: Partial<CreateTournamentInput>): Promise<Tournament> => {
    const res = await apiClient.patch(ENDPOINTS.TOURNAMENTS.UPDATE(id), data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.TOURNAMENTS.DELETE(id));
  },

  // ── Payment ──────────────────────────────────────────────────────

  initiatePayment: async (tournamentId: string) => {
    const res = await apiClient.post(ENDPOINTS.TOURNAMENTS.INITIATE_PAYMENT(tournamentId));
    return res.data.data as {
      paymentUrl: string;
      params: Record<string, string>;
      paymentId: string;
    };
  },

  verifyPayment: async (transactionUuid: string) => {
    const res = await apiClient.post(ENDPOINTS.TOURNAMENTS.VERIFY_PAYMENT, { transactionUuid });
    return res.data.data as { success: boolean; tournamentId: string };
  },

  getPaymentStatus: async (tournamentId: string) => {
    const res = await apiClient.get(ENDPOINTS.TOURNAMENTS.PAYMENT_STATUS(tournamentId));
    return res.data.data as { status: 'pending' | 'success' | 'failed' | null };
  },

  checkChatAccess: async (tournamentId: string) => {
    const res = await apiClient.get(ENDPOINTS.TOURNAMENTS.CHAT_ACCESS(tournamentId));
    return res.data.data as { allowed: boolean };
  },

  // ── Creator Dashboard ─────────────────────────────────────────────

  getDashboardTransactions: async () => {
    const res = await apiClient.get(ENDPOINTS.TOURNAMENTS.DASHBOARD_TRANSACTIONS);
    return res.data.data as { payments: TournamentPayment[]; totalCollected: number };
  },

  getTournamentPayments: async (tournamentId: string) => {
    const res = await apiClient.get(ENDPOINTS.TOURNAMENTS.TOURNAMENT_PAYMENTS(tournamentId));
    return res.data.data as TournamentPayment[];
  },
};
