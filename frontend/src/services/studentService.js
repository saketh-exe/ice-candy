import apiClient from '@/lib/apiClient';

const studentService = {
    // Get student profile
    getProfile: async () => {
        const response = await apiClient.get('/student/profile');
        return response.data;
    },

    // Update student profile
    updateProfile: async (profileData) => {
        console.log("Updating profile with data:", profileData);
        const response = await apiClient.put('/student/profile', profileData);
        return response.data;
    },

    // Upload resume
    uploadResume: async (file) => {
        const formData = new FormData();
        formData.append('resume', file);

        const response = await apiClient.post('/student/resume', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get all internships
    getInternships: async (params = {}) => {
        const response = await apiClient.get('/student/internships', { params });
        return response.data;
    },

    // Get internship by ID
    getInternshipById: async (id) => {
        const response = await apiClient.get(`/student/internships/${id}`);
        return response.data;
    },

    // Apply for internship
    applyForInternship: async (internshipId, applicationData) => {
        const response = await apiClient.post(
            `/student/apply/${internshipId}`,
            applicationData
        );
        return response.data;
    },

    // Get my applications
    getMyApplications: async (params = {}) => {
        const response = await apiClient.get('/student/applications', { params });
        return response.data;
    },

    // Get application by ID
    getApplicationById: async (id) => {
        const response = await apiClient.get(`/student/applications/${id}`);
        return response.data;
    },

    // Withdraw application
    withdrawApplication: async (id) => {
        const response = await apiClient.delete(`/student/applications/${id}`);
        return response.data;
    },
};

export default studentService;
