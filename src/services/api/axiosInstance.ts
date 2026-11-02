import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { getToken, clearAuth } from '../storage/tokenService';

/**
 * Axios instance with interceptors for API calls
 * Handles authentication, error handling, and base configuration
 */
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5216/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    const axiosError = error as { response?: { status?: number }; config?: { url?: string } };
    const isAuthCall = axiosError.config?.url?.startsWith('/auth/');
    // Un 401 sur /auth/login est un simple échec d'identifiants : pas de redirection
    if (axiosError.response?.status === 401 && !isAuthCall) {
      clearAuth();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
