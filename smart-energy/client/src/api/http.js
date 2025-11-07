import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7000/api',
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`; // [REQ:Auth:jwtRoleSession]
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    const msg = error?.response?.data?.message || 'Request failed.'; // [REQ:Errors:userFriendly]
    return Promise.reject(new Error(msg));
  }
);

export default api;
