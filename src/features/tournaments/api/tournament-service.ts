import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';
import { Tournament, PaymentTransaction } from '@/types';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface InitiatePaymentResponse {
    paymentUrl: string;
    params: Record<string, string>;
    paymentId: string;
    transactionId?: string;
    amount?: number;
    productCode?: string;
    signature?: string;
    signedFieldNames?: string;
}

export const tournamentService = {
    getAll: async (): Promise<Tournament[]> => {
        const response = await apiClient.get<ApiResponse<Tournament[]>>(ENDPOINTS.TOURNAMENTS.LIST);
        return response.data.data;
    },

    getById: async (id: string): Promise<Tournament> => {
        const response = await apiClient.get<ApiResponse<Tournament>>(ENDPOINTS.TOURNAMENTS.BY_ID(id));
        return response.data.data;
    },

    create: async (data: Partial<Tournament>): Promise<Tournament> => {
        const response = await apiClient.post<ApiResponse<Tournament>>(ENDPOINTS.TOURNAMENTS.CREATE, data);
        return response.data.data;
    },
};

export const paymentService = {
    initiatePayment: async (tournamentId: string): Promise<InitiatePaymentResponse> => {
        const response = await apiClient.post<ApiResponse<InitiatePaymentResponse>>(ENDPOINTS.PAYMENTS.INITIATE, { tournamentId });
        return response.data.data;
    },

    verifyPayment: async (dataBase64: string): Promise<void> => {
        // Sends base64 eSewa response data back to backend to verify
        await apiClient.get(ENDPOINTS.PAYMENTS.VERIFY, { params: { data: dataBase64 } });
    },

    getAdminTransactions: async (): Promise<{ transactions: PaymentTransaction[], totalCollected: number }> => {
        const response = await apiClient.get<ApiResponse<{ transactions: PaymentTransaction[], totalCollected: number }>>(ENDPOINTS.PAYMENTS.ADMIN_TRANSACTIONS);
        return response.data.data;
    }
};
