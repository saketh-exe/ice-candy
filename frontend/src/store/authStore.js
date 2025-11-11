import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            setAuth: (user, accessToken, refreshToken) =>
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                }),

            updateUser: (userData) =>
                set((state) => ({
                    user: { ...state.user, ...userData },
                })),

            logout: () =>
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                }),

            // Helper to check role
            hasRole: (roles) => {
                const state = useAuthStore.getState();
                if (Array.isArray(roles)) {
                    return roles.includes(state.user?.role);
                }
                return state.user?.role === roles;
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// Sync with localStorage
if (typeof window !== 'undefined') {
    const auth = useAuthStore.getState();
    if (auth.accessToken) {
        localStorage.setItem('accessToken', auth.accessToken);
    }
    if (auth.refreshToken) {
        localStorage.setItem('refreshToken', auth.refreshToken);
    }
}

export { useAuthStore };
export default useAuthStore;
