import axios from 'axios';

const api = axios.create({ baseURL: (import.meta.env.VITE_API_URL || '') + '/api', timeout: 10000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sy_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sy_token');
      localStorage.removeItem('sy_user');
    }
    return Promise.reject(err.response?.data || err);
  }
);

export default api;
