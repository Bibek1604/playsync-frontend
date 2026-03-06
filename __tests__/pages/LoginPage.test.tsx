import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LoginPage from '@/app/auth/login/page';

const pushMock = jest.fn();
const loginMock = jest.fn();
const loginState = {
    isLoading: false,
    error: null as string | null,
};

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
        replace: jest.fn(),
        refresh: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
    }),
    usePathname: () => '/auth/login',
    useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/features/auth/hooks/useLogin', () => ({
    useLogin: () => ({
        login: loginMock,
        isLoading: loginState.isLoading,
        error: loginState.error,
    }),
}));

jest.mock('@/features/auth/store/auth-store', () => ({
    useAuthStore: Object.assign(jest.fn(), {
        getState: jest.fn(() => ({ user: { role: 'user' } })),
    }),
}));

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        loginMock.mockResolvedValue(true);
        loginState.isLoading = false;
        loginState.error = null;
        const storeModule = jest.requireMock('@/features/auth/store/auth-store');
        storeModule.useAuthStore.getState.mockReturnValue({ user: { role: 'user' } });
    });

    it('renders email, password, and submit controls', () => {
        render(<LoginPage />);

        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In to PlaySync/i })).toBeInTheDocument();
    });

    it('toggles password visibility when eye button is clicked', () => {
        render(<LoginPage />);

        const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
        const toggleButton = screen
            .getAllByRole('button')
            .find((btn) => btn.getAttribute('type') === 'button') as HTMLButtonElement;

        expect(passwordInput.type).toBe('password');
        fireEvent.click(toggleButton);
        expect(passwordInput.type).toBe('text');
    });

    it('submits email and password to the login hook', async () => {
        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
            target: { value: 'player@playsync.dev' },
        });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), {
            target: { value: 'strong-password' },
        });

        fireEvent.click(screen.getByRole('button', { name: /Sign In to PlaySync/i }));

        await waitFor(() => {
            expect(loginMock).toHaveBeenCalledWith({
                email: 'player@playsync.dev',
                password: 'strong-password',
            });
        });
    });

    it('redirects admin users to /admin', async () => {
        const storeModule = jest.requireMock('@/features/auth/store/auth-store');
        storeModule.useAuthStore.getState.mockReturnValue({ user: { role: 'admin' } });

        render(<LoginPage />);
        fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
            target: { value: 'admin@playsync.dev' },
        });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), {
            target: { value: 'adminpass' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Sign In to PlaySync/i }));

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith('/admin');
        });
    });

    it('redirects non-admin users to /dashboard', async () => {
        render(<LoginPage />);
        fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
            target: { value: 'user@playsync.dev' },
        });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), {
            target: { value: 'userpass' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Sign In to PlaySync/i }));

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('does not redirect when login fails', async () => {
        loginMock.mockResolvedValue(false);

        render(<LoginPage />);
        fireEvent.click(screen.getByRole('button', { name: /Sign In to PlaySync/i }));

        await waitFor(() => {
            expect(pushMock).not.toHaveBeenCalled();
        });
    });

    it('renders forgot password and create account links', () => {
        render(<LoginPage />);

        expect(screen.getByRole('link', { name: /Forgot password\?/i })).toHaveAttribute('href', '/auth/forgot-password');
        expect(screen.getByRole('link', { name: /Create Account/i })).toHaveAttribute('href', '/auth/register');
    });

    it('shows error text from login hook', () => {
        loginState.error = 'Invalid credentials';

        render(<LoginPage />);

        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('INTENTIONAL FAIL: expects wrong forgot-password path for demo', () => {
        render(<LoginPage />);

        expect(screen.getByRole('link', { name: /Forgot password\?/i })).toHaveAttribute('href', '/forgot-password');
    });
});
