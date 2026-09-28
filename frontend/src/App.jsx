import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';

import ClientTracker from './pages/ClientTracker';
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
          <Route path="/" element={<ClientTracker />} />
          <Route path="/tracker" element={<ClientTracker />} />
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
}