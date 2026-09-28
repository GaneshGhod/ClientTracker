import React, { useState } from 'react';
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
}