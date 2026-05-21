import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isExpired = err.response.headers?.['x-token-expired'] === 'true';
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Preserve the URL user was trying to reach so we can restore after login
      const intendedPath = window.location.pathname + window.location.search;
      if (intendedPath !== '/login') {
        sessionStorage.setItem('redirect_after_login', intendedPath);
      }

      toast.error(isExpired ? 'Your session has expired. Please sign in again.' : 'Authentication required. Please sign in.');
      // Small delay so the toast is visible before redirect
      setTimeout(() => { window.location.href = '/login'; }, 1200);
    } else if (err.response?.status === 429) {
      toast.warning('Too many requests. Please wait a moment and try again.');
    }
    return Promise.reject(err);
  }
);

export default api;
