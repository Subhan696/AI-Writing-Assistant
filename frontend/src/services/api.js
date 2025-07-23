import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(handleApiError(error));
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  getCurrentUser: () => api.get('/api/auth'),
};

// Generate API
export const generateAPI = {
  generateText: (prompt) => api.post('/api/generate', { prompt }),
};

// History API
export const historyAPI = {
  getHistory: () => api.get('/api/history'),
};

// Share API
export const shareAPI = {
  createShare: (content) => api.post('/api/share', { content }),
  getSharedContent: (id) => api.get(`/api/share/${id}`),
};

export default api;
