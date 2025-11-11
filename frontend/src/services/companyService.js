import apiClient from '@/lib/apiClient';

const companyService = {
    // Get company profile
    getProfile: async () => {
        const response = await apiClient.get('/company/profile');
        return response.data;
    },

    // Update company profile
    updateProfile: async (profileData) => {
        const response = await apiClient.put('/company/profile', profileData);
        return response.data;
    },

    // Create internship
    createInternship: async (internshipData) => {
        const response = await apiClient.post('/company/internships', internshipData);
        return response.data;
    },

    // Get company's internships
    getInternships: async (params = {}) => {
        const response = await apiClient.get('/company/internships', { params });
        return response.data;
    },

    // Get single internship
    getInternshipById: async (id) => {
        const response = await apiClient.get(`/company/internships/${id}`);
        return response.data;
    },

    // Update internship
    updateInternship: async (id, internshipData) => {
        const response = await apiClient.put(
            `/company/internships/${id}`,
            internshipData
        );
        return response.data;
    },

    // Delete internship
    deleteInternship: async (id) => {
        const response = await apiClient.delete(`/company/internships/${id}`);
        return response.data;
    },

    // Get applicants for internship
    getApplicants: async (internshipId, params = {}) => {
        const response = await apiClient.get(
            `/company/internships/${internshipId}/applicants`,
            { params }
        );
        return response.data;
    },

    // Get all applications
    getAllApplications: async (params = {}) => {
        const response = await apiClient.get('/company/applications', { params });
        return response.data;
    },

    // Update application status
    updateApplicationStatus: async (id, statusData) => {
        const response = await apiClient.put(
            `/company/applications/${id}/status`,
            statusData
        );
        return response.data;
    },

    // Get recommendations for all internships
    getRecommendations: async () => {
        const response = await apiClient.get('/company/recommendations');
        return response.data;
    },

    // Get recommendations for specific internship
    getInternshipRecommendations: async (internshipId) => {
        const response = await apiClient.get(`/company/recommendations/${internshipId}`);
        return response.data;
    },

    // Analyze specific applicant
    analyzeApplicant: async (applicationId) => {
        const response = await apiClient.post('/company/recommendations/analyze', {
            applicationId,
        });
        return response.data;
    },
};

export default companyService;
