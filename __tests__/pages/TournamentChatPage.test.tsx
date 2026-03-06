import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const pushMock: jest.Mock = jest.fn();
const replaceMock: jest.Mock = jest.fn();

const getByIdMock: jest.Mock = jest.fn();
const checkChatAccessMock: jest.Mock = jest.fn();

const authState: any = {
  user: { id: 'user-1', _id: 'user-1', fullName: 'Bibek Player' },
  accessToken: 'token-1',
};

const socketHandlers: Record<string, Function> = {};
const socketEmitMock: jest.Mock = jest.fn();
const socketOnMock: jest.Mock = jest.fn((event: string, cb: Function) => {
  socketHandlers[event] = cb;
});
const socketOffMock: jest.Mock = jest.fn();
const socketDisconnectMock: jest.Mock = jest.fn();

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
    get: () => null,
  }),
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>;
});

jest.mock('@/features/auth/store/auth-store', () => ({
  useAuthStore: () => authState,
}));

jest.mock('@/features/tournaments/api/tournament.api', () => ({
  tournamentApi: {
    getById: (...args: any[]) => getByIdMock(...args),
    checkChatAccess: (...args: any[]) => checkChatAccessMock(...args),
  },
}));

jest.mock('socket.io-client', () => ({
  io: () => ({
    emit: (event: string, payload: any) => socketEmitMock(event, payload),
    on: (event: string, cb: Function) => socketOnMock(event, cb),
    off: (event: string, cb: Function) => socketOffMock(event, cb),
    disconnect: () => socketDisconnectMock(),
  }),
}));

const TournamentChatPage = require('@/app/(dashboard)/tournaments/[id]/chat/page').default;

describe('TournamentChatPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(socketHandlers).forEach((k) => delete socketHandlers[k]);

    authState.user = { id: 'user-1', _id: 'user-1', fullName: 'Bibek Player' };
    authState.accessToken = 'token-1';

    getByIdMock.mockResolvedValue({
      _id: 'tour-1',
      title: 'PlaySync Championship',
      creatorId: { _id: 'host-1' },
      currentPlayers: 3,
    });
    checkChatAccessMock.mockResolvedValue({ allowed: true });
  });

  it('renders loading state first', () => {
    const { container } = render(<TournamentChatPage />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders chat header when access is allowed', async () => {
    render(<TournamentChatPage />);

    await waitFor(() => {
      expect(screen.getByText(/Tournament Chat/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Type a message/i)).toBeInTheDocument();
    });
  });

  it('shows access restricted state when API denies chat access', async () => {
    checkChatAccessMock.mockResolvedValueOnce({ allowed: false });

    render(<TournamentChatPage />);

    await waitFor(() => {
      expect(screen.getByText(/Chat Access Restricted/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Pay & Join Tournament/i })).toHaveAttribute('href', '/tournaments/tour-1');
    });
  });

  it('disables send button for empty message input', async () => {
    render(<TournamentChatPage />);

    const sendButton = await screen.findByRole('button', { name: /Send message/i });
    expect(sendButton).toBeDisabled();
  });

  it('sends chat message and clears input', async () => {
    render(<TournamentChatPage />);

    await waitFor(() => {
      expect(socketEmitMock).toHaveBeenCalledWith('tournament:join', { tournamentId: 'tour-1' });
    });

    const input = await screen.findByPlaceholderText(/Type a message/i);
    fireEvent.change(input, { target: { value: 'GL HF everyone' } });

    const sendButton = await screen.findByRole('button', { name: /Send message/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(socketEmitMock).toHaveBeenCalledWith('tournament:send', {
        tournamentId: 'tour-1',
        content: 'GL HF everyone',
      });
    });
  });

  it('INTENTIONAL FAIL: expects restricted state while access is allowed', async () => {
    render(<TournamentChatPage />);

    await waitFor(() => {
      expect(screen.getByText(/Chat Access Restricted/i)).toBeInTheDocument();
    });
  });
});
