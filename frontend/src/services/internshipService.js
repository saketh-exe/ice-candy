import apiClient from '@/lib/apiClient';

const internshipService = {
    // Get all public internships
    getInternships: async (params = {}) => {
        const response = await apiClient.get('/internships', { params });
        return response.data;
    },

    // Get internship by ID (public)
    getInternshipById: async (id) => {
        const response = await apiClient.get(`/internships/${id}`);
        return response.data;
    },
};

export default internshipService;
