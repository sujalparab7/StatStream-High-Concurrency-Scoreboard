import axios from 'axios';

// Create a dedicated instance pointing to your Go backend
const api = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// We will use this later to attach your JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// The 3 functions your UI will use to talk to Go
export const registerUser = (userData) => api.post('/register', userData);
export const loginUser = (userData) => api.post('/login', userData);
export const getLeaderboard = () => api.get('/leaderboard');

export default api;

export const submitScore = (scoreData) => api.post('/scores', scoreData);