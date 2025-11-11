import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
    persist(
        (set) => ({
            isLoading: false,
            notification: null,

            setLoading: (loading) => set({ isLoading: loading }),

            showNotification: (message, type = 'success') =>
                set({ notification: { message, type } }),

            clearNotification: () => set({ notification: null }),

            // Sidebar state for mobile
            sidebarOpen: false,
            toggleSidebar: () =>
                set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            closeSidebar: () => set({ sidebarOpen: false }),

            // Theme state
            theme: 'light', // 'light' or 'dark'
            toggleTheme: () =>
                set((state) => {
                    const newTheme = state.theme === 'light' ? 'dark' : 'light';
                    // Apply theme to document
                    if (newTheme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                    return { theme: newTheme };
                }),
            setTheme: (theme) =>
                set(() => {
                    // Apply theme to document
                    if (theme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                    return { theme };
                }),
        }),
        {
            name: 'ui-storage',
            partialize: (state) => ({ theme: state.theme }), // Only persist theme
        }
    )
);

export { useUIStore };
export default useUIStore;
