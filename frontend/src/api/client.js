import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('internhub_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem('internhub_token');
      localStorage.removeItem('internhub_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const getError = (err) =>
  err.response?.data?.message || err.message || 'Something went wrong. Please try again.';

export default api;
