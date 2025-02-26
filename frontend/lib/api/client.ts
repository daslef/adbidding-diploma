import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5010/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Authentication error handling
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear token and redirect to login page if unauthorized
      localStorage.removeItem('token');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Error normalization for consistent error handling
    const errorResponse = {
      message: error.response?.data?.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      data: error.response?.data || {},
    };

    return Promise.reject(errorResponse);
  }
);

export const api = {
  get: <T>(url: string, params = {}) => 
    apiClient.get<T>(url, { params }),
  
  post: <T>(url: string, data = {}) => 
    apiClient.post<T>(url, data),
  
  put: <T>(url: string, data = {}) => 
    apiClient.put<T>(url, data),
  
  patch: <T>(url: string, data = {}) => 
    apiClient.patch<T>(url, data),
  
  delete: <T>(url: string) => 
    apiClient.delete<T>(url),
};

export default api;