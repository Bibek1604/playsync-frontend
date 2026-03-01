import { useAuthStore } from '../store/auth-store';

export const useLogin = () => {
    const login = useAuthStore((state) => state.login);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);

    return { login, isLoading, error };
};
