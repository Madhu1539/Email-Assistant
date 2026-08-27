// Client-side Axios instance
// All requests are sent with credentials (cookies) included automatically.
// Base URL is set from NEXT_PUBLIC_API_BASE_URL environment variable.

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
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
