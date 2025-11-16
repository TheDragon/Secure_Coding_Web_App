import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`; // [REQ:Auth:jwtRoleSession]
  return config;
});

let refreshPromise;

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error.config || {};
    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;
      try {
        refreshPromise = refreshPromise || api.post('/auth/refresh');
        const resp = await refreshPromise;
        refreshPromise = null;
        const { token, user } = resp.data || {};
        if (token) {
          localStorage.setItem('token', token);
          if (user?.role) localStorage.setItem('role', user.role);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        refreshPromise = null;
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.hash = '#/login';
        return Promise.reject(refreshErr);
      }
    }
    const msg = error?.response?.data?.message || 'Request failed.'; // [REQ:Errors:userFriendly]
    return Promise.reject(new Error(msg));
  }
);

export default api;
