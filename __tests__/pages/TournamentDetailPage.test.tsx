import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const pushMock: jest.Mock = jest.fn();
const replaceMock: jest.Mock = jest.fn();
const searchMap = new Map<string, string>();

const getByIdMock: jest.Mock = jest.fn();
const getPaymentStatusMock: jest.Mock = jest.fn();
const initiatePaymentMock: jest.Mock = jest.fn();
const verifyPaymentMock: jest.Mock = jest.fn();

const submitEsewaPaymentFormMock: jest.Mock = jest.fn();
const toastSuccessMock: jest.Mock = jest.fn();
const toastErrorMock: jest.Mock = jest.fn();
const toastInfoMock: jest.Mock = jest.fn();

const authState: any = {
  user: { id: 'user-1', _id: 'user-1', fullName: 'Bibek Player' },
};

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'tour-1' }),
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    refresh: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => searchMap.get(key) ?? null,
  }),
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>;
});

jest.mock('@/features/auth/store/auth-store', () => ({
  useAuthStore: (selector: any) => (typeof selector === 'function' ? selector(authState) : authState),
}));

jest.mock('@/features/tournaments/api/tournament.api', () => ({
  tournamentApi: {
    getById: (...args: any[]) => getByIdMock(...args),
    getPaymentStatus: (...args: any[]) => getPaymentStatusMock(...args),
    initiatePayment: (...args: any[]) => initiatePaymentMock(...args),
    verifyPayment: (...args: any[]) => verifyPaymentMock(...args),
  },
}));

jest.mock('@/lib/esewa', () => ({
  submitEsewaPaymentForm: (...args: any[]) => submitEsewaPaymentFormMock(...args),
}));

jest.mock('@/lib/toast', () => ({
  toast: Object.assign(
    (...args: any[]) => toastInfoMock(...args),
    {
      success: (...args: any[]) => toastSuccessMock(...args),
      error: (...args: any[]) => toastErrorMock(...args),
    }
  ),
}));

const TournamentDetailPage = require('@/app/(dashboard)/tournaments/[id]/page').default;

describe('TournamentDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    searchMap.clear();
    authState.user = { id: 'user-1', _id: 'user-1', fullName: 'Bibek Player' };

    getByIdMock.mockResolvedValue({
      _id: 'tour-1',
      name: 'Kathmandu Clash',
      description: 'Offline knockout event',
      type: 'offline',
      location: 'Kathmandu',
      maxPlayers: 16,
      currentPlayers: 4,
      entryFee: 250,
      prize: 'NPR 20,000',
      startDate: '2026-03-10T12:00:00.000Z',
      status: 'open',
      creatorId: { _id: 'host-1', fullName: 'Host One' },
      participants: [],
    });

    getPaymentStatusMock.mockResolvedValue({ status: null });
    initiatePaymentMock.mockResolvedValue({
      paymentUrl: 'https://pay.esewa.com.np',
      params: {
        amount: '250',
        total_amount: '250',
        transaction_uuid: 'tx-1',
        product_code: 'EPAYTEST',
        signature: 'sig',
        signed_field_names: 'total_amount,transaction_uuid,product_code',
      },
    });
    verifyPaymentMock.mockResolvedValue({ success: true });
    submitEsewaPaymentFormMock.mockReturnValue({ ok: true });
  });

  it('renders loading spinner initially', () => {
    const { container } = render(<TournamentDetailPage />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders tournament details after load', async () => {
    render(<TournamentDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Kathmandu Clash')).toBeInTheDocument();
      expect(screen.getByText(/Offline knockout event/i)).toBeInTheDocument();
      expect(screen.getByText(/Back to Tournaments/i)).toBeInTheDocument();
    });
  });

  it('shows eSewa payment button for unpaid open tournament', async () => {
    render(<TournamentDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Pay NPR 250 via eSewa & Join/i })).toBeInTheDocument();
    });
  });

  it('submits payment payload when eSewa button is clicked', async () => {
    render(<TournamentDetailPage />);

    const payButton = await screen.findByRole('button', { name: /via eSewa/i });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(initiatePaymentMock).toHaveBeenCalledWith('tour-1');
      expect(submitEsewaPaymentFormMock).toHaveBeenCalled();
    });
  });

  it('shows toast error when eSewa payload is invalid', async () => {
    submitEsewaPaymentFormMock.mockReturnValue({ ok: false, error: 'Missing signature' });

    render(<TournamentDetailPage />);
    fireEvent.click(await screen.findByRole('button', { name: /via eSewa/i }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Missing signature');
    });
  });

  it('redirects to chat when payment status is already success', async () => {
    getPaymentStatusMock.mockResolvedValueOnce({ status: 'success' });

    render(<TournamentDetailPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/tournaments/tour-1/chat');
    });
  });

  it('redirects to login when pay is clicked without auth user', async () => {
    authState.user = null;
    render(<TournamentDetailPage />);

    const payButton = await screen.findByRole('button', { name: /via eSewa/i });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/auth/login');
    });

    authState.user = { id: 'user-1', _id: 'user-1', fullName: 'Bibek Player' };
  });

  it('INTENTIONAL FAIL: expects incorrect back link path', async () => {
    render(<TournamentDetailPage />);

    const backLink = await screen.findByRole('link', { name: /Back to Tournaments/i });
    expect(backLink).toHaveAttribute('href', '/dashboard/tournaments');
  });
});
