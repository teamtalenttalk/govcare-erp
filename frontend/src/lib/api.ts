import axios from 'axios';
import { DEMO_MODE, getDemoResponse } from './demo-data';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('govcare_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (DEMO_MODE && err.config) {
      const url = err.config.url || '';
      const method = (err.config.method || 'get').toUpperCase();
      return { data: getDemoResponse(url, method), status: 200, statusText: 'OK', headers: {}, config: err.config };
    }
    if (err.response?.status === 401) {
      localStorage.removeItem('govcare_token');
      localStorage.removeItem('govcare_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
