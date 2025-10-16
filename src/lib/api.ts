import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and unwrapping
api.interceptors.response.use(
  (response) => {
    // Unwrap the response if it has the { success, data, timestamp, path } structure
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      // Return the unwrapped data
      return {
        ...response,
        data: response.data.data,
        // Preserve the original wrapped response in case needed
        _original: response.data
      };
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if not already on login page
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        localStorage.removeItem('admin_access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
