import { create } from 'zustand';

const useUIStore = create((set) => ({
    isLoading: false,
    notification: null,

    setLoading: (loading) => set({ isLoading: loading }),

    showNotification: (message, type = 'success') =>
        set({ notification: { message, type } }),

    clearNotification: () => set({ notification: null }),

    // Sidebar state for mobile
    sidebarOpen: false,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    closeSidebar: () => set({ sidebarOpen: false }),
}));

export { useUIStore };
export default useUIStore;
