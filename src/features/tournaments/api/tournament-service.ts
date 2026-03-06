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

function isRequestCanceled(error: any): boolean {
    const message = String(error?.message || '').toLowerCase();
    return error?.code === 'ERR_CANCELED' || message.includes('aborted') || message.includes('canceled');
}

export const tournamentService = {
    getAll: async (): Promise<Tournament[]> => {
        try {
            const response = await apiClient.get<any>(ENDPOINTS.TOURNAMENTS.LIST);
            const respData = response.data;
            
            // Handle wrapped { success, data } response
            if (respData?.data && Array.isArray(respData.data)) {
                return respData.data;
            }
            // Handle direct array response
            if (Array.isArray(respData)) {
                return respData;
            }
            // Fallback for unexpected format
            console.warn('Unexpected tournament API response format:', respData);
            return [];
        } catch (error) {
            if (!isRequestCanceled(error)) {
                console.error('Error fetching tournaments:', error);
            }
            return [];
        }
    },

    getById: async (id: string): Promise<Tournament> => {
        const response = await apiClient.get<ApiResponse<Tournament> | Tournament>(ENDPOINTS.TOURNAMENTS.BY_ID(id));
        const data = response.data;
        if (Array.isArray(data)) {
            return data[0] as Tournament;
        }
        return (data as ApiResponse<Tournament>).data;
    },

    create: async (payload: Partial<Tournament>): Promise<Tournament> => {
        const response = await apiClient.post<ApiResponse<Tournament> | Tournament>(ENDPOINTS.TOURNAMENTS.CREATE, payload);
        const data = response.data;
        if (Array.isArray(data)) {
            return data[0] as Tournament;
        }
        return (data as ApiResponse<Tournament>).data;
    },
};

export const paymentService = {
    initiatePayment: async (tournamentId: string): Promise<InitiatePaymentResponse> => {
        const response = await apiClient.post<ApiResponse<InitiatePaymentResponse> | InitiatePaymentResponse>(ENDPOINTS.PAYMENTS.INITIATE, { tournamentId });
        const data = response.data;
        if ((data as any).paymentUrl) {
            return data as InitiatePaymentResponse;
        }
        return (data as ApiResponse<InitiatePaymentResponse>).data;
    },

    verifyPayment: async (dataBase64: string): Promise<void> => {
        // Sends base64 eSewa response data back to backend to verify
        await apiClient.get(ENDPOINTS.PAYMENTS.VERIFY, { params: { data: dataBase64 } });
    },

    getAdminTransactions: async (): Promise<{ transactions: PaymentTransaction[], totalCollected: number }> => {
        const response = await apiClient.get<ApiResponse<{ transactions: PaymentTransaction[], totalCollected: number }>>(ENDPOINTS.PAYMENTS.ADMIN_TRANSACTIONS);
        const data = response.data;
        if ((data as any).transactions) {
            return data as { transactions: PaymentTransaction[], totalCollected: number };
        }
        return (data as ApiResponse<{ transactions: PaymentTransaction[], totalCollected: number }>).data;
    }
};
