import apiClient from '@/lib/apiClient';

const adminService = {
    // Get all users
    getUsers: async (params = {}) => {
        const response = await apiClient.get('/admin/users', { params });
        return response.data;
    },

    // Get user by ID
    getUserById: async (id) => {
        const response = await apiClient.get(`/admin/users/${id}`);
        return response.data;
    },

    // Update user status
    updateUserStatus: async (id, statusData) => {
        const response = await apiClient.put(`/admin/users/${id}/status`, statusData);
        return response.data;
    },

    // Delete user
    deleteUser: async (id) => {
        const response = await apiClient.delete(`/admin/users/${id}`);
        return response.data;
    },

    // Get all internships
    getInternships: async (params = {}) => {
        const response = await apiClient.get('/admin/internships', { params });
        return response.data;
    },

    // Delete internship
    deleteInternship: async (id) => {
        const response = await apiClient.delete(`/admin/internships/${id}`);
        return response.data;
    },

    // Get all applications
    getApplications: async (params = {}) => {
        const response = await apiClient.get('/admin/applications', { params });
        return response.data;
    },

    // Verify company
    verifyCompany: async (id, verified = true) => {
        const response = await apiClient.put(`/admin/companies/${id}/verify`, {
            verified,
        });
        return response.data;
    },

    // Get platform statistics
    getStats: async () => {
        const response = await apiClient.get('/admin/stats');
        return response.data;
    },
};

export default adminService;
