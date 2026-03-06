// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// We mock next/navigation as it's common in Next.js 13+ app directory
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            refresh: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
        };
    },
    usePathname() {
        return '';
    },
    useSearchParams() {
        return new URLSearchParams();
    },
    useParams() {
        return { id: 'test-id' };
    }
}));

// We mock Zustand's useAuthStore if it's used directly in top level components often
jest.mock('@/features/auth/store/auth-store', () => {
    const authState = {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isHydrated: true,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        error: null,
    };

    const useAuthStore = jest.fn((selector?: (state: typeof authState) => unknown) => {
        if (typeof selector === 'function') {
            return selector(authState);
        }
        return authState;
    });

    (useAuthStore as any).getState = jest.fn(() => authState);

    return {
        useAuthStore,
    };
});
