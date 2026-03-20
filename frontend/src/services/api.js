import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  updateLanguage: (language) => api.put(`/api/auth/language?language=${language}`),
};

// ---- Crops ----
export const cropAPI = {
  getAll: () => api.get('/api/crops/public/all'),
  search: (query) => api.get(`/api/crops/public/search?query=${query}`),
  getBySpace: (spaceType) => api.get(`/api/crops/public/space/${spaceType}`),
};

// ---- Fertilizers ----
export const fertilizerAPI = {
  getAll: () => api.get('/api/fertilizers/public/all'),
  getForCrop: (cropName) => api.get(`/api/fertilizers/public/for-crop?cropName=${cropName}`),
};

// ---- Recommendations ----
export const recommendationAPI = {
  get: (data) => api.post('/api/recommendations', data),
  getHistory: () => api.get('/api/recommendations/history'),
};

export default api;
