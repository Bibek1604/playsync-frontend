import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const pushMock = jest.fn();
const registerMock = jest.fn(async () => true);

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/auth/register',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/features/auth/hooks/useRegister', () => ({
  useRegister: () => ({
    register: registerMock,
    isLoading: false,
    error: null,
  }),
}));

const RegisterPage = require('@/app/auth/register/page').default;

describe('RegisterPage', () => {
  const fillForm = () => {
    fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'Bibek' } });
    fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'Shrestha' } });
    fireEvent.change(screen.getByPlaceholderText('john@example.com'), { target: { value: 'bibek@playsync.dev' } });
    const passwordFields = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordFields[0], { target: { value: 'Password123!' } });
    fireEvent.change(passwordFields[1], { target: { value: 'Password123!' } });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    registerMock.mockResolvedValue(true);
  });

  it('renders all required form inputs', () => {
    render(<RegisterPage />);

    expect(screen.getByPlaceholderText('John')).toBeTruthy();
    expect(screen.getByPlaceholderText('Doe')).toBeTruthy();
    expect(screen.getByPlaceholderText('john@example.com')).toBeTruthy();
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
  });

  it('renders account creation button', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('button', { name: /Create Master Account/i })).toBeTruthy();
  });

  it('submits fullName, email and passwords via register hook', async () => {
    render(<RegisterPage />);

    fillForm();

    fireEvent.click(screen.getByRole('button', { name: /Create Master Account/i }));

    await waitFor(() => {
      expect(registerMock as jest.Mock).toHaveBeenCalledWith({
        fullName: 'Bibek Shrestha',
        email: 'bibek@playsync.dev',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
    });
  });

  it('redirects to login page on successful registration', async () => {
    render(<RegisterPage />);
    fillForm();

    fireEvent.click(screen.getByRole('button', { name: /Create Master Account/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('does not redirect when registration fails', async () => {
    registerMock.mockResolvedValue(false);

    render(<RegisterPage />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /Create Master Account/i }));

    await waitFor(() => {
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it('renders login-now link for existing users', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('link', { name: /Login Now/i }).getAttribute('href')).toBe('/auth/login');
  });

  it('INTENTIONAL FAIL: expects wrong register CTA label', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('button', { name: /Create Account/i })).toBeTruthy();
  });
});
