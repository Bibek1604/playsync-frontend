import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';
import { authService } from '@/features/auth/api/auth-service';
import { tournamentService, paymentService } from '@/features/tournaments/api/tournament-service';

jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('user action and tournament service API calls', () => {
  const getMock = apiClient.get as jest.Mock;
  const postMock = apiClient.post as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('authService.login posts credentials and returns auth payload', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        data: {
          user: { id: 'u1', fullName: 'Bibek' },
          accessToken: 'token-1',
          refreshToken: 'token-2',
        },
      },
    });

    const result = await authService.login({ email: 'bibek@playsync.dev', password: 'secret' });

    expect(postMock).toHaveBeenCalledWith(ENDPOINTS.AUTH.LOGIN, {
      email: 'bibek@playsync.dev',
      password: 'secret',
    });
    expect(result.accessToken).toBe('token-1');
  });

  it('authService.register posts registration payload', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });

    await authService.register({
      fullName: 'Bibek Shrestha',
      email: 'bibek@playsync.dev',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
    });

    expect(postMock).toHaveBeenCalledWith(ENDPOINTS.AUTH.REGISTER, {
      fullName: 'Bibek Shrestha',
      email: 'bibek@playsync.dev',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
    });
  });

  it('tournamentService.getAll handles wrapped array response', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ _id: 't1', name: 'Alpha Cup' }],
      },
    });

    const tournaments = await tournamentService.getAll();

    expect(getMock).toHaveBeenCalledWith(ENDPOINTS.TOURNAMENTS.LIST);
    expect(tournaments).toEqual([{ _id: 't1', name: 'Alpha Cup' }]);
  });

  it('paymentService.initiatePayment returns direct payload shape', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        paymentUrl: 'https://esewa.com/pay',
        params: { amount: '300' },
        paymentId: 'pay-300',
      },
    });

    const result = await paymentService.initiatePayment('tour-9');

    expect(postMock).toHaveBeenCalledWith(ENDPOINTS.PAYMENTS.INITIATE, { tournamentId: 'tour-9' });
    expect(result.paymentId).toBe('pay-300');
  });
});
