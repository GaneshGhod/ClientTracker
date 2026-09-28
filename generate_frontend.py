import os
import json

base_dir = r'C:\Users\ganes\.gemini\antigravity\scratch\leadmarket\frontend'
os.makedirs(base_dir, exist_ok=True)

files = {
  'package.json': '''{
  "name": "lead-marketplace-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.6.8",
    "lucide-react": "^0.368.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.3",
    "recharts": "^2.12.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "vite": "^5.2.0"
  }
}''',
  'vite.config.js': '''import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})''',
  'tailwind.config.js': '''/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}''',
  'postcss.config.js': '''export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}''',
  'index.html': '''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lead Marketplace</title>
  </head>
  <body class="bg-gray-50 text-gray-900">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>''',
  'src/index.css': '''@tailwind base;
@tailwind components;
@tailwind utilities;

.blur-sm {
    filter: blur(4px);
}
''',
  'src/utils/constants.js': '''export const STATUS_COLORS = {
  open: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  claimed: 'bg-blue-100 text-blue-800',
  closed: 'bg-gray-100 text-gray-800',
};''',
  'src/services/api.js': '''import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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

export const subsApi = {
  create: (data) => api.post('/subscriptions/create', data).then(res => res.data),
  getStatus: () => api.get('/subscriptions/status').then(res => res.data),
};

export default api;''',
  'src/hooks/useApi.js': '''import { useState, useCallback } from 'react';

export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunc(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  return { data, error, loading, execute };
};''',
  'src/hooks/useAuth.js': '''import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};''',
  'src/context/AuthContext.jsx': '''import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { user } = await authApi.getMe();
          setUser(user);
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials, isAdmin = false) => {
    const data = await (isAdmin ? authApi.adminLogin(credentials) : authApi.login(credentials));
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (data) => {
    const res = await authApi.signup(data);
    localStorage.setItem('token', res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};''',
  'src/components/shared/LoadingSpinner.jsx': '''import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}''',
  'src/components/shared/EmptyState.jsx': '''import React from 'react';

export default function EmptyState({ title, description }) {
  return (
    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
      <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}''',
  'src/components/shared/CategoryBadge.jsx': '''import React from 'react';

export default function CategoryBadge({ name }) {
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
      {name}
    </span>
  );
}''',
  'src/components/shared/StatsCard.jsx': '''import React from 'react';

export default function StatsCard({ title, value, icon }) {
  return (
    <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      <div className="p-5 flex items-center">
        <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-semibold text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}''',
  'src/components/shared/Modal.jsx': '''import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">{title}</h3>
                <div className="mt-2">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}''',
  'src/components/shared/DataTable.jsx': '''import React from 'react';

export default function DataTable({ columns, data }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((col, j) => (
                <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {col.cell ? col.cell(row) : row[col.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}''',
  'src/components/shared/SubscriptionBanner.jsx': '''import React from 'react';
import { Link } from 'react-router-dom';

export default function SubscriptionBanner() {
  return (
    <div className="bg-indigo-600 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-white">
          <p className="text-sm font-medium">Upgrade now to access leads</p>
        </div>
        <Link to="/freelancer/subscription" className="bg-white px-4 py-2 rounded-md text-sm font-medium text-indigo-600 hover:bg-gray-50">
          View Plans
        </Link>
      </div>
    </div>
  );
}''',
  'src/components/shared/ProtectedRoute.jsx': '''import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'client') return <Navigate to="/client/dashboard" replace />;
    return <Navigate to="/freelancer/dashboard" replace />;
  }

  return children;
}''',
  'src/components/shared/LeadCard.jsx': '''import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import CategoryBadge from './CategoryBadge';

export default function LeadCard({ lead, isSubscribed }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{lead.title}</h3>
        <CategoryBadge name={lead.category?.name || 'Uncategorized'} />
      </div>
      
      <div className={`space-y-3 ${!isSubscribed ? 'blur-sm select-none' : ''}`}>
        <p className="text-sm text-gray-500 line-clamp-2">{lead.description || 'Description hidden...'}</p>
        <div className="text-sm font-medium text-gray-900">Budget: ${lead.budgetMin} - ${lead.budgetMax}</div>
        <div className="text-xs text-gray-400">Posted: {new Date(lead.createdAt || Date.now()).toLocaleDateString()}</div>
      </div>

      {!isSubscribed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60">
          <Lock className="h-8 w-8 text-gray-500 mb-2" />
          <Link to="/freelancer/subscription" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
            Subscribe to view
          </Link>
        </div>
      )}

      {isSubscribed && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link to={`/freelancer/leads/${lead._id || lead.id}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            View Details &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}''',
  'src/components/layout/Navbar.jsx': '''import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 z-30 fixed w-full top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">LeadMarket</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-4 w-4 mr-2" />
                  <span>{user.name} ({user.role})</span>
                </div>
                <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}''',
  'src/components/layout/Sidebar.jsx': '''import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, List, Search, CreditCard, Users, Briefcase, FileText, PlusCircle } from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  const links = {
    freelancer: [
      { name: 'Dashboard', path: '/freelancer/dashboard', icon: LayoutDashboard },
      { name: 'Browse Leads', path: '/freelancer/leads', icon: Search },
      { name: 'My Leads', path: '/freelancer/my-leads', icon: Briefcase },
      { name: 'Subscription', path: '/freelancer/subscription', icon: CreditCard },
    ],
    client: [
      { name: 'Dashboard', path: '/client/dashboard', icon: LayoutDashboard },
      { name: 'Post Lead', path: '/client/post-lead', icon: PlusCircle },
      { name: 'My Leads', path: '/client/my-leads', icon: List },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Manage Leads', path: '/admin/leads', icon: FileText },
      { name: 'Categories', path: '/admin/categories', icon: List },
      { name: 'Freelancers', path: '/admin/freelancers', icon: Users },
      { name: 'Clients', path: '/admin/clients', icon: Users },
    ],
  };

  const navLinks = links[role] || [];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen pt-16 fixed">
      <div className="flex flex-col mt-5 h-full">
        <nav className="flex-1 px-2 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}''',
  'src/components/layout/DashboardLayout.jsx': '''import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <main className="pl-64 pt-16">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}''',
  'src/components/forms/LeadForm.jsx': '''import React, { useState } from 'react';

export default function LeadForm({ onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    categoryId: initialData.categoryId || '',
    budgetMin: initialData.budgetMin || '',
    budgetMax: initialData.budgetMax || '',
    clientContact: initialData.clientContact || '',
    clientReference: initialData.clientReference || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Min Budget</label>
          <input type="number" required value={formData.budgetMin} onChange={e => setFormData({...formData, budgetMin: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Budget</label>
          <input type="number" required value={formData.budgetMax} onChange={e => setFormData({...formData, budgetMax: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
        </div>
      </div>
      <div className="mt-5 sm:mt-6">
        <button type="submit" className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          Save Lead
        </button>
      </div>
    </form>
  );
}''',
  'src/components/forms/CategoryForm.jsx': '''import React, { useState } from 'react';

export default function CategoryForm({ onSubmit, initialData = {} }) {
  const [name, setName] = useState(initialData.name || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Category Name</label>
        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
      </div>
      <div className="mt-5 sm:mt-6">
        <button type="submit" className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          Save Category
        </button>
      </div>
    </form>
  );
}''',
  'src/pages/auth/Login.jsx': '''import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login({ email, password });
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">{error}</div>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input type="email" required className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <input type="password" required className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Sign in
            </button>
          </div>
          <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
            <p>Don't have an account?</p>
            <Link to="/signup/freelancer" className="text-indigo-600 hover:text-indigo-500">Sign up as Freelancer</Link>
            <Link to="/signup/client" className="text-indigo-600 hover:text-indigo-500">Sign up as Client</Link>
          </div>
        </form>
      </div>
    </div>
  );
}''',
  'src/pages/auth/AdminLogin.jsx': '''import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password }, true);
      navigate('/admin/dashboard');
    } catch (err) {
      alert('Admin login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Admin Portal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Admin Email" required className="w-full p-3 rounded bg-gray-700 text-white border-gray-600" value={email} onChange={e=>setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required className="w-full p-3 rounded bg-gray-700 text-white border-gray-600" value={password} onChange={e=>setPassword(e.target.value)} />
          <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 font-bold">Login</button>
        </form>
      </div>
    </div>
  );
}''',
  'src/pages/auth/FreelancerSignup.jsx': '''import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function FreelancerSignup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'freelancer' });
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      navigate('/freelancer/dashboard');
    } catch (err) {
      alert('Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Freelancer Signup</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="text" placeholder="Name" required className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 sm:text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input type="email" placeholder="Email address" required className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 sm:text-sm" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input type="password" placeholder="Password" required className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 sm:text-sm" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <button type="submit" className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Sign up</button>
        </form>
      </div>
    </div>
  );
}''',
  'src/pages/auth/ClientSignup.jsx': '''import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ClientSignup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      navigate('/client/dashboard');
    } catch (err) {
      alert('Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Client Signup</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="text" placeholder="Company Name" required className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 sm:text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input type="email" placeholder="Email address" required className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 sm:text-sm" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input type="password" placeholder="Password" required className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 sm:text-sm" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <button type="submit" className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Sign up</button>
        </form>
      </div>
    </div>
  );
}''',
  'src/pages/freelancer/Dashboard.jsx': '''import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatsCard from '../../components/shared/StatsCard';
import SubscriptionBanner from '../../components/shared/SubscriptionBanner';
import { Briefcase, CreditCard } from 'lucide-react';
import { subsApi, leadsApi } from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ claimed: 0, subActive: false });

  useEffect(() => {
    Promise.all([
      leadsApi.getMyLeads(),
      subsApi.getStatus().catch(() => ({ status: 'inactive' }))
    ]).then(([leadsData, subData]) => {
      setStats({
        claimed: leadsData.leads?.length || 0,
        subActive: subData.subscription?.status === 'active' || subData.status === 'active' || false
      });
    }).catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      {!stats.subActive && <SubscriptionBanner />}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard title="Claimed Leads" value={stats.claimed} icon={<Briefcase className="h-6 w-6 text-indigo-600" />} />
        <StatsCard title="Subscription Status" value={stats.subActive ? 'Active' : 'Inactive'} icon={<CreditCard className="h-6 w-6 text-indigo-600" />} />
      </div>
    </DashboardLayout>
  );
}''',
  'src/pages/freelancer/BrowseLeads.jsx': '''import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LeadCard from '../../components/shared/LeadCard';
import { leadsApi, subsApi } from '../../services/api';

export default function BrowseLeads() {
  const [leads, setLeads] = useState([]);
  const [subActive, setSubActive] = useState(false);

  useEffect(() => {
    subsApi.getStatus().then(res => setSubActive(res.status === 'active' || res.subscription?.status === 'active')).catch(() => setSubActive(false));
    leadsApi.getAll({ limit: 50 }).then(res => setLeads(res.leads || [])).catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Leads</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.map(lead => <LeadCard key={lead._id || lead.id} lead={lead} isSubscribed={subActive} />)}
      </div>
    </DashboardLayout>
  );
}''',
  'src/pages/freelancer/LeadDetail.jsx': '''import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { leadsApi, subsApi } from '../../services/api';

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [subActive, setSubActive] = useState(false);

  useEffect(() => {
    subsApi.getStatus().then(res => setSubActive(res.status === 'active' || res.subscription?.status === 'active')).catch(() => setSubActive(false));
    leadsApi.getOne(id).then(res => setLead(res.lead)).catch(console.error);
  }, [id]);

  const claimLead = async () => {
    try {
      await leadsApi.claim(id);
      alert('Lead claimed successfully!');
    } catch (err) {
      alert('Error claiming lead');
    }
  };

  if (!lead) return <DashboardLayout><div>Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{lead.title}</h1>
        <div className={`space-y-4 ${!subActive ? 'blur-sm select-none' : ''}`}>
          <p className="text-gray-700">{lead.description}</p>
          <p className="font-semibold">Budget: ${lead.budgetMin} - ${lead.budgetMax}</p>
          <p>Contact: {lead.clientContact}</p>
        </div>
        <div className="mt-8">
          <button disabled={!subActive} onClick={claimLead} className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
            Claim Lead
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}''',
  'src/pages/freelancer/MyLeads.jsx': '''import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/shared/DataTable';
import { leadsApi } from '../../services/api';

export default function MyLeads() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    leadsApi.getMyLeads().then(res => setLeads(res.leads || [])).catch(console.error);
  }, []);

  const cols = [
    { header: 'Title', accessorKey: 'title' },
    { header: 'Budget', cell: row => `$${row.budgetMin} - $${row.budgetMax}` },
    { header: 'Contact', accessorKey: 'clientContact' }
  ];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Claimed Leads</h1>
      <DataTable columns={cols} data={leads} />
    </DashboardLayout>
  );
}''',
  'src/pages/freelancer/Subscription.jsx': '''import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { subsApi } from '../../services/api';

export default function Subscription() {
  const subscribe = async (plan) => {
    try {
      await subsApi.create({ plan });
      alert(`Subscribed to ${plan} successfully!`);
    } catch (err) {
      alert('Error subscribing');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscription Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
          <h2 className="text-xl font-bold">Basic Plan</h2>
          <p className="text-3xl font-extrabold mt-4">$9.99<span className="text-lg text-gray-500 font-normal">/mo</span></p>
          <ul className="mt-6 space-y-4 text-left">
            <li>✓ 10 claims per month</li>
            <li>✓ Access to basic leads</li>
          </ul>
          <button onClick={() => subscribe('basic')} className="mt-8 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">Subscribe</button>
        </div>
        <div className="bg-white rounded-xl border border-indigo-200 p-8 shadow-md text-center ring-2 ring-indigo-600">
          <h2 className="text-xl font-bold text-indigo-600">Pro Plan</h2>
          <p className="text-3xl font-extrabold mt-4">$29.99<span className="text-lg text-gray-500 font-normal">/mo</span></p>
          <ul className="mt-6 space-y-4 text-left">
            <li>✓ Unlimited claims</li>
            <li>✓ Access to premium leads</li>
          </ul>
          <button onClick={() => subscribe('pro')} className="mt-8 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">Subscribe</button>
        </div>
      </div>
    </DashboardLayout>
  );
}''',
  'src/pages/client/Dashboard.jsx': '''import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatsCard from '../../components/shared/StatsCard';
import { List } from 'lucide-react';
import { clientApi } from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0 });

  useEffect(() => {
    clientApi.getMyLeads().then(res => setStats({ total: res.leads?.length || 0 })).catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Client Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard title="My Posted Leads" value={stats.total} icon={<List className="h-6 w-6 text-indigo-600" />} />
      </div>
    </DashboardLayout>
  );
}''',
  'src/pages/client/PostLead.jsx': '''import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LeadForm from '../../components/forms/LeadForm';
import { clientApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function PostLead() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      await clientApi.createLead(data);
      navigate('/client/my-leads');
    } catch (err) {
      alert('Error creating lead');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New Lead</h1>
      <div className="max-w-2xl bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <LeadForm onSubmit={handleSubmit} />
      </div>
    </DashboardLayout>
  );
}''',
  'src/pages/client/MyLeads.jsx': '''import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/shared/DataTable';
import { clientApi } from '../../services/api';

export default function MyLeads() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    clientApi.getMyLeads().then(res => setLeads(res.leads || [])).catch(console.error);
  }, []);

  const cols = [
    { header: 'Title', accessorKey: 'title' },
    { header: 'Budget', cell: row => `$${row.budgetMin} - $${row.budgetMax}` },
    { header: 'Status', accessorKey: 'status' }
  ];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Leads</h1>
      <DataTable columns={cols} data={leads} />
    </DashboardLayout>
  );
}''',
  'src/pages/admin/Dashboard.jsx': '''import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatsCard from '../../components/shared/StatsCard';
import { adminApi } from '../../services/api';
import { Users, FileText, Briefcase } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    adminApi.getStats().then(setStats).catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Leads" value={stats.totalLeads || 0} icon={<FileText className="h-6 w-6 text-indigo-600" />} />
        <StatsCard title="Freelancers" value={stats.totalFreelancers || 0} icon={<Users className="h-6 w-6 text-indigo-600" />} />
        <StatsCard title="Clients" value={stats.totalClients || 0} icon={<Briefcase className="h-6 w-6 text-indigo-600" />} />
      </div>
    </DashboardLayout>
  );
}''',
  'src/pages/admin/ManageLeads.jsx': '''import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/shared/DataTable';
import { adminApi } from '../../services/api';

export default function ManageLeads() {
  const [leads, setLeads] = useState([]);

  const fetchLeads = () => adminApi.getLeads().then(res => setLeads(res.leads || [])).catch(console.error);
  useEffect(() => { fetchLeads(); }, []);

  const approve = async (id) => {
    await adminApi.approveLead(id);
    fetchLeads();
  };

  const cols = [
    { header: 'Title', accessorKey: 'title' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Actions', cell: row => (
      row.status === 'pending' ? <button onClick={() => approve(row._id || row.id)} className="text-indigo-600">Approve</button> : <span>-</span>
    )}
  ];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Leads</h1>
      <DataTable columns={cols} data={leads} />
    </DashboardLayout>
  );
}''',
  'src/pages/admin/ManageCategories.jsx': '''import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/shared/DataTable';
import Modal from '../../components/shared/Modal';
import CategoryForm from '../../components/forms/CategoryForm';
import { adminApi } from '../../services/api';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchCats = () => adminApi.getCategories().then(res => setCategories(res.categories || [])).catch(console.error);
  useEffect(() => { fetchCats(); }, []);

  const handleCreate = async (data) => {
    await adminApi.createCategory(data);
    setModalOpen(false);
    fetchCats();
  };

  const cols = [{ header: 'Name', accessorKey: 'name' }];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
        <button onClick={() => setModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-md">Add Category</button>
      </div>
      <DataTable columns={cols} data={categories} />
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="New Category">
        <CategoryForm onSubmit={handleCreate} />
      </Modal>
    </DashboardLayout>
  );
}''',
  'src/pages/admin/Freelancers.jsx': '''import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/shared/DataTable';
import { adminApi } from '../../services/api';

export default function Freelancers() {
  const [freelancers, setFreelancers] = useState([]);
  useEffect(() => { adminApi.getFreelancers().then(res => setFreelancers(res.freelancers || [])).catch(console.error); }, []);
  const cols = [{ header: 'Name', accessorKey: 'name' }, { header: 'Email', accessorKey: 'email' }];
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Freelancers</h1>
      <DataTable columns={cols} data={freelancers} />
    </DashboardLayout>
  );
}''',
  'src/pages/admin/Clients.jsx': '''import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/shared/DataTable';
import { adminApi } from '../../services/api';

export default function Clients() {
  const [clients, setClients] = useState([]);
  useEffect(() => { adminApi.getClients().then(res => setClients(res.clients || [])).catch(console.error); }, []);
  const cols = [{ header: 'Name', accessorKey: 'name' }, { header: 'Email', accessorKey: 'email' }];
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Clients</h1>
      <DataTable columns={cols} data={clients} />
    </DashboardLayout>
  );
}''',
  'src/App.jsx': '''import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';

import Login from './pages/auth/Login';
import FreelancerSignup from './pages/auth/FreelancerSignup';
import ClientSignup from './pages/auth/ClientSignup';
import AdminLogin from './pages/auth/AdminLogin';

import FreelancerDashboard from './pages/freelancer/Dashboard';
import BrowseLeads from './pages/freelancer/BrowseLeads';
import LeadDetail from './pages/freelancer/LeadDetail';
import FreelancerMyLeads from './pages/freelancer/MyLeads';
import Subscription from './pages/freelancer/Subscription';

import ClientDashboard from './pages/client/Dashboard';
import PostLead from './pages/client/PostLead';
import ClientMyLeads from './pages/client/MyLeads';

import AdminDashboard from './pages/admin/Dashboard';
import ManageLeads from './pages/admin/ManageLeads';
import ManageCategories from './pages/admin/ManageCategories';
import Freelancers from './pages/admin/Freelancers';
import Clients from './pages/admin/Clients';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup/freelancer" element={<FreelancerSignup />} />
          <Route path="/signup/client" element={<ClientSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Freelancer Routes */}
          <Route path="/freelancer/*" element={<ProtectedRoute role="freelancer"><Routes>
            <Route path="dashboard" element={<FreelancerDashboard />} />
            <Route path="leads" element={<BrowseLeads />} />
            <Route path="leads/:id" element={<LeadDetail />} />
            <Route path="my-leads" element={<FreelancerMyLeads />} />
            <Route path="subscription" element={<Subscription />} />
          </Routes></ProtectedRoute>} />

          {/* Client Routes */}
          <Route path="/client/*" element={<ProtectedRoute role="client"><Routes>
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="post-lead" element={<PostLead />} />
            <Route path="my-leads" element={<ClientMyLeads />} />
          </Routes></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/*" element={<ProtectedRoute role="admin"><Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="leads" element={<ManageLeads />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="freelancers" element={<Freelancers />} />
            <Route path="clients" element={<Clients />} />
          </Routes></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}''',
  'src/main.jsx': '''import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)'''
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print('Successfully generated all frontend files.')
