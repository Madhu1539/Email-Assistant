// Client-side Axios instance
// All requests are sent with credentials (cookies) included automatically.
// Base URL is set from NEXT_PUBLIC_API_BASE_URL environment variable.

import axios from 'axios';

// Normalize API base URL (handles with or without /api and trailing slashes)
export function getApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  const trimmed = raw.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // Required for HttpOnly cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — handle global auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.error?.code;

    // If 401 on any protected request, redirect to login
    if (status === 401 && typeof window !== 'undefined') {
      const publicPaths = ['/login', '/register', '/'];
      const currentPath = window.location.pathname;
      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
