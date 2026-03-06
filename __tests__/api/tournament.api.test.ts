import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/constants';
import { tournamentApi } from '@/features/tournaments/api/tournament.api';

jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('tournamentApi', () => {
  const getMock = apiClient.get as jest.Mock;
  const postMock = apiClient.post as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('list() normalizes wrapped tournament response', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        data: [
          {
            _id: 't1',
            title: 'Weekend Cup',
            prizeDetails: 'NPR 5000',
            type: 'ONLINE',
            status: 'OPEN',
            startTime: '2026-03-01T12:00:00.000Z',
          },
        ],
      },
    });

    const result: any = await tournamentApi.list();

    expect(result.data[0].name).toBe('Weekend Cup');
    expect(result.data[0].type).toBe('online');
    expect(result.data[0].status).toBe('open');
  });

  it('list() handles direct array response', async () => {
    getMock.mockResolvedValueOnce({
      data: [
        {
          _id: 't2',
          name: 'LAN Masters',
          prize: 'NPR 10,000',
          type: 'OFFLINE',
          status: 'FULL',
          startDate: '2026-03-05T10:00:00.000Z',
        },
      ],
    });

    const result: any[] = await tournamentApi.list();

    expect(result[0].name).toBe('LAN Masters');
    expect(result[0].status).toBe('full');
  });

  it('getById() calls BY_ID endpoint and normalizes payload', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        data: {
          _id: 't3',
          title: 'City Clash',
          prizeDetails: 'NPR 3000',
          type: 'ONLINE',
          status: 'OPEN',
          startTime: '2026-03-09T08:00:00.000Z',
        },
      },
    });

    const tournament = await tournamentApi.getById('t3');

    expect(getMock).toHaveBeenCalledWith(ENDPOINTS.TOURNAMENTS.BY_ID('t3'));
    expect(tournament.name).toBe('City Clash');
    expect(tournament.prize).toBe('NPR 3000');
  });

  it('initiatePayment() posts tournamentId payload', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        data: {
          paymentUrl: 'https://esewa.com/pay',
          params: { amount: '200' },
          paymentId: 'pay-1',
        },
      },
    });

    const response = await tournamentApi.initiatePayment('t4');

    expect(postMock).toHaveBeenCalledWith(ENDPOINTS.TOURNAMENTS.INITIATE_PAYMENT('t4'), {
      tournamentId: 't4',
    });
    expect(response.paymentId).toBe('pay-1');
  });

  it('getPaymentStatus() returns normalized status shape', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        data: {
          paymentStatus: 'SUCCESS',
          paymentId: 'pay-2',
          amount: 300,
          transactionId: 'txn-22',
        },
      },
    });

    const status = await tournamentApi.getPaymentStatus('t5');

    expect(getMock).toHaveBeenCalledWith(ENDPOINTS.TOURNAMENTS.PAYMENT_STATUS('t5'));
    expect(status).toEqual({
      status: 'success',
      paymentId: 'pay-2',
      amount: 300,
      transactionId: 'txn-22',
    });
  });

});
