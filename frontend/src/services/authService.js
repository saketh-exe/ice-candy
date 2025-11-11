import apiClient from '@/lib/apiClient';

const authService = {
    // Register new user
    register: async (data) => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    // Login user
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    // Refresh access token
    refreshToken: async (refreshToken) => {
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        return response.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    // Logout
    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },

    // Update password
    updatePassword: async (passwords) => {
        const response = await apiClient.put('/auth/password', passwords);
        return response.data;
    },
};

export default authService;
