import { useAuthStore } from '../store/auth-store';

export const useRegister = () => {
    const register = useAuthStore((state) => state.register);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);

    return { register, isLoading, error };
};
