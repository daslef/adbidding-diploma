import { apiClient } from './client';
import { User, AuthResponse } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

export interface RefreshResponse {
  token: string;
}

export interface ApiError extends Error {
  status?: number;
  data?: any;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', userData);
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
    
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  } catch (error) {
    console.error('Logout error:', error);
    
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

export const refreshToken = async (): Promise<string> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const { data } = await apiClient.post<{ token: string }>('/auth/refresh', { refreshToken });
    
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data.token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    throw error;
  }
};