import axios from 'axios';

const API_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add user info if needed
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      // You can add authorization headers here if needed
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

