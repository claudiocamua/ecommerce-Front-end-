import axios from 'axios';
import { authStorage } from '@/lib/auth';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = authStorage.getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && typeof window !== 'undefined') {
      authStorage.clear();
      window.dispatchEvent(new CustomEvent('logout'));
    }
    return Promise.reject(error);
  }
);

export default api;