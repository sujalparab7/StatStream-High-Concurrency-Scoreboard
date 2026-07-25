import axios from 'axios';

// Dynamically use Vercel's environment variable or fallback to localhost
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach your JWT token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (userData) => api.post('/register', userData);
export const loginUser = (userData) => api.post('/login', userData);
export const getLeaderboard = () => api.get('/leaderboard');
export const submitScore = (scoreData) => api.post('/scores', scoreData);

export default api;