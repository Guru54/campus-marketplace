import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // sends httpOnly cookie automatically
  headers: {
    'Content-Type': 'application/json'
  }
});

// Handle 401 globally (cookie expired / unauthorized)
// Exclude auth routes (login, register, etc.) from redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('rezell_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/** 
 * Campus Marketplace Centralized API Services
 */

// Auth related APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  getColleges: () => api.get('/auth/colleges'),
};

// Listings (Marketplace) related APIs
export const listingAPI = {
  getAll: (params) => {
    // Filter out empty values to avoid sending empty query params
    const cleanParams = Object.fromEntries(
      Object.entries(params || {}).filter(([, v]) => v && v !== '')
    );
    return api.get('/listings', { params: cleanParams });
  },
  getById: (id) => api.get(`/listings/${id}`),
  create: (formData) => api.post('/listings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/listings/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/listings/${id}`),
  getMyListings: () => api.get('/listings/my'),
  getSuggestions: (query) => api.get('/listings/suggestions', { params: { q: query } }),
};

// Chat system APIs
export const chatAPI = {
  getInbox: () => api.get('/chats'),
  getChatMessages: (chatId, page = 1, limit = 30) => api.get(`/chats/${chatId}/messages`, { params: { page, limit } }),
  startChat: (payload) => api.post('/chats', payload),
  sendMessage: (chatId, content) => api.post(`/chats/${chatId}/messages`, { content }),
  deleteChat: (chatId) => api.delete(`/chats/${chatId}`),
};

// User Profile & Settings
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.patch('/user/profile', data),
  updateAvatar: (formData) => api.patch('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changePassword: (data) => api.put('/users/change-password', data),
  getUserPublicProfile: (userId) => api.get(`/users/${userId}`),
};

export default api;