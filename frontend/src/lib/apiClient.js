import axios from 'axios';

// Get API base URL from environment variables with proper fallback
const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    const mode = import.meta.env.MODE;

    console.log('🌍 Environment Mode:', mode);
    console.log('🔗 API Base URL from env:', envUrl);

    // Fallback logic based on environment
    if (envUrl) {
        return envUrl;
    }

    // Default fallback for development
    if (mode === 'development') {
        console.log('⚠️ Using default development URL');
        return 'http://localhost:5000/api';
    }

    // Default fallback for production
    console.log('⚠️ Using default production URL');
    return 'http://65.0.18.1:5000/api';
};

const apiClient = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies
});

console.log('🚀 API Client initialized with base URL:', apiClient.defaults.baseURL);

// Helper to get token from Zustand persist storage
const getAccessToken = () => {
    try {
        const authStorage = localStorage.getItem('auth-storage');
        console.log('🔍 Auth Storage:', authStorage);
        if (authStorage) {
            const { state } = JSON.parse(authStorage);
            console.log('🔍 Parsed State:', state);
            console.log('🔑 Access Token:', state?.accessToken);
            return state?.accessToken;
        }
    } catch (error) {
        console.error('❌ Error getting access token:', error);
    }
    console.log('⚠️ No access token found');
    return null;
};

// Helper to get refresh token from Zustand persist storage
const getRefreshToken = () => {
    try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
            const { state } = JSON.parse(authStorage);
            return state?.refreshToken;
        }
    } catch (error) {
        console.error('Error getting refresh token:', error);
    }
    return null;
};

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config) => {
        console.log('📤 Outgoing Request:', config.url);
        console.log('📦 Request Data:', config.data);
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Added Authorization header');
        } else {
            console.log('⚠️ No token available for request');
        }
        console.log('📋 Request Headers:', config.headers);
        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
    (response) => {
        console.log('✅ Response received:', response.config.url, response.status);
        return response;
    },
    async (error) => {
        console.log('❌ Response error:', error.response?.status, error.config?.url);
        console.log('📄 Error details:', error.response?.data);

        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('🔄 Attempting token refresh...');
            originalRequest._retry = true;

            try {
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                // Try to refresh token
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
                    { refreshToken }
                );

                const { accessToken } = response.data.data;
                console.log('✅ Token refreshed successfully');

                // Update token in Zustand storage
                const authStorage = localStorage.getItem('auth-storage');
                if (authStorage) {
                    const parsed = JSON.parse(authStorage);
                    parsed.state.accessToken = accessToken;
                    localStorage.setItem('auth-storage', JSON.stringify(parsed));
                }

                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('❌ Token refresh failed:', refreshError);
                // Refresh failed, logout user
                localStorage.removeItem('auth-storage');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            console.error('🚫 403 Forbidden - Access Denied');
            console.log('Request URL:', error.config?.url);
            console.log('Request Headers:', error.config?.headers);
            console.log('Response:', error.response?.data);
        }

        return Promise.reject(error);
    }
);

export { apiClient };
export default apiClient;
