import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mutateMock = jest.fn();
const toastLoadingMock = jest.fn((..._args: any[]) => 'toast-1');
const toastDismissMock = jest.fn();

const authState: any = {
  user: { id: 'u1', _id: 'u1', fullName: 'Bibek Shrestha', email: 'bibek@playsync.dev', role: 'user' },
  isAuthenticated: true,
};

const queryState: Record<string, any> = {
  scorecard: { data: { xp: 1400, level: 5, gamesPlayed: 22, rank: 7, winRate: 65.5 }, isLoading: false, error: null },
  'history-stats': { data: { totalGames: 20, completedGames: 15 }, isLoading: false, error: null },
  'scorecard-trend': { data: [{ date: '2026-03-01', points: 20 }], isLoading: false, error: null },
  leaderboard: { data: [{ userId: 'u1' }], isLoading: false, error: null },
  'admin-stats': { data: null, isLoading: false, error: null },
  tournaments: { data: [], isLoading: false, error: null },
};

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>;
});

jest.mock('recharts', () => ({
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  CartesianGrid: () => <div data-testid="grid" />,
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn((cfg: any) => {
    const key = Array.isArray(cfg.queryKey) ? cfg.queryKey[0] : 'unknown';
    return queryState[key] || { data: undefined, isLoading: false, error: null };
  }),
  useMutation: jest.fn(() => ({
    mutate: mutateMock,
    isPending: false,
  })),
}));

jest.mock('@/features/auth/store/auth-store', () => ({
  useAuthStore: (selector: any) => (typeof selector === 'function' ? selector(authState) : authState),
}));

jest.mock('@/features/history/components/RecentGamesList', () => ({
  RecentGamesList: () => <div data-testid="recent-games-list">RecentGamesList</div>,
}));

jest.mock('@/features/tournaments/api/tournament-service', () => ({
  tournamentService: {
    getAll: jest.fn(),
  },
  paymentService: {
    initiatePayment: jest.fn(),
  },
}));

jest.mock('@/lib/esewa', () => ({
  submitEsewaPaymentForm: jest.fn(() => ({ ok: true })),
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    loading: (...args: any[]) => toastLoadingMock(...args),
    dismiss: (...args: any[]) => toastDismissMock(...args),
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const DashboardPage = require('@/app/(dashboard)/dashboard/page').default;
const TournamentsPage = require('@/app/(dashboard)/tournaments/page').default;

describe('Dashboard page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authState.user = { id: 'u1', _id: 'u1', fullName: 'Bibek Shrestha', email: 'bibek@playsync.dev', role: 'user' };
    authState.isAuthenticated = true;
    queryState.scorecard = { data: { xp: 1400, level: 5, gamesPlayed: 22, rank: 7, winRate: 65.5 }, isLoading: false, error: null };
    queryState['history-stats'] = { data: { totalGames: 20, completedGames: 15 }, isLoading: false, error: null };
    queryState['scorecard-trend'] = { data: [{ date: '2026-03-01', points: 20 }], isLoading: false, error: null };
    queryState.leaderboard = { data: [{ userId: 'u1' }], isLoading: false, error: null };
    queryState['admin-stats'] = { data: null, isLoading: false, error: null };
  });

  it('renders welcome hero with player first name', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Bibek/i).length).toBeGreaterThan(0);
    });
  });

  it('renders primary dashboard actions and sections', () => {
    render(<DashboardPage />);

    expect(screen.getByRole('button', { name: /Play Now/i })).toBeTruthy();
    expect(screen.getByText(/Performance Overview/i)).toBeTruthy();
    expect(screen.getByTestId('recent-games-list')).toBeTruthy();
  });

  it('shows skeleton cards while score and stats are loading', () => {
    queryState.scorecard = { data: undefined, isLoading: true, error: null };
    queryState['history-stats'] = { data: undefined, isLoading: true, error: null };

    const { container } = render(<DashboardPage />);

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders computed stat labels after successful queries', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Growth Score')).toBeTruthy();
    expect(screen.getByText('Sessions Joined')).toBeTruthy();
    expect(screen.getByText('Completion Rate')).toBeTruthy();
  });
});

describe('Tournament cards page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryState.tournaments = {
      data: [
        {
          _id: 't1',
          name: 'PlaySync Cup',
          title: 'PlaySync Cup',
          type: 'ONLINE',
          description: 'Weekly tournament',
          prize: '5000',
          entryFee: 200,
          currentPlayers: 2,
          maxPlayers: 16,
          status: 'OPEN',
          participants: [],
        },
      ],
      isLoading: false,
      error: null,
    };
  });

  it('renders tournament card details and triggers pay flow on click', () => {
    render(<TournamentsPage />);

    expect(screen.getByText(/PlaySync Cup/i)).toBeTruthy();
    expect(screen.getByText(/Weekly tournament/i)).toBeTruthy();

    const payButton = screen.getByRole('button', { name: /Pay & Join/i });
    expect(payButton).toBeTruthy();

    fireEvent.click(payButton);
    expect(toastLoadingMock).toHaveBeenCalledWith('Initiating secure payment...', { position: 'bottom-right' });
    expect(mutateMock).toHaveBeenCalledWith('t1', expect.any(Object));
  });

  it('renders loading state when tournaments are loading', () => {
    queryState.tournaments = { data: [], isLoading: true, error: null };
    const { container } = render(<TournamentsPage />);

    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('renders error state when tournament query fails', () => {
    queryState.tournaments = { data: undefined, isLoading: false, error: new Error('network') };

    render(<TournamentsPage />);

    expect(screen.getByText(/Failed to load active tournaments/i)).toBeTruthy();
  });

  it('INTENTIONAL FAIL: expects Closed button on open tournament', () => {
    render(<TournamentsPage />);

    expect(screen.getByRole('button', { name: /Closed/i })).toBeTruthy();
  });
});
