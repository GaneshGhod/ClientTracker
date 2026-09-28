import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials).then(res => res.data),
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials).then(res => res.data),
  signup: (data) => api.post('/auth/signup', data).then(res => res.data),
  getMe: () => api.get('/auth/me').then(res => res.data),
};

export const leadsApi = {
  getAll: (params) => api.get('/leads', { params }).then(res => res.data),
  getOne: (id) => api.get(`/leads/${id}`).then(res => res.data),
  claim: (id) => api.post(`/leads/${id}/claim`).then(res => res.data),
  getMyLeads: () => api.get('/leads/my').then(res => res.data),
};

export const clientApi = {
  createLead: (data) => api.post('/client/leads', data).then(res => res.data),
  getMyLeads: () => api.get('/client/leads').then(res => res.data),
};

export const adminApi = {
  getLeads: () => api.get('/admin/leads').then(res => res.data),
  createLead: (data) => api.post('/admin/leads', data).then(res => res.data),
  updateLead: (id, data) => api.put(`/admin/leads/${id}`, data).then(res => res.data),
  deleteLead: (id) => api.delete(`/admin/leads/${id}`).then(res => res.data),
  approveLead: (id) => api.put(`/admin/leads/${id}/approve`).then(res => res.data),
  getCategories: () => api.get('/admin/categories').then(res => res.data),
  createCategory: (data) => api.post('/admin/categories', data).then(res => res.data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data).then(res => res.data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`).then(res => res.data),
  getFreelancers: () => api.get('/admin/freelancers').then(res => res.data),
  getClients: () => api.get('/admin/clients').then(res => res.data),
  getStats: () => api.get('/admin/stats').then(res => res.data),
};

export const clientTrackerApi = {
  getAll: (params) => api.get('/clients', { params }).then(res => res.data),
  getReminders: () => api.get('/clients/reminders').then(res => res.data),
  getOne: (id) => api.get(`/clients/${id}`).then(res => res.data),
  create: (data) => api.post('/clients', data).then(res => res.data),
  update: (id, data) => api.put(`/clients/${id}`, data).then(res => res.data),
  updateStatus: (id, status) => api.patch(`/clients/${id}/status`, { status }).then(res => res.data),
  delete: (id) => api.delete(`/clients/${id}`).then(res => res.data),
};

export const subsApi = {
  create: (data) => api.post('/subscriptions/create', data).then(res => res.data),
  getStatus: () => api.get('/subscriptions/status').then(res => res.data),
};

export default api;